import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import * as api from '@/services/api';

jest.mock('@/services/api');

const baseMockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'user' as const,
  status: 'active' as const,
  metadata: {
    lastLogin: '2024-01-01T00:00:00Z',
  },
};

const mockFetch = api.fetchUserData as jest.Mock;
const mockUpdate = api.updateUserProfile as jest.Mock;

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<UserProfile userId="1" />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders user data after loading', async () => {
    mockFetch.mockResolvedValue(baseMockUser);
    render(<UserProfile userId="1" />);
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
  });

  it('displays error message on load failure with retry', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(baseMockUser);
    render(<UserProfile userId="1" />);

    await waitFor(() => expect(screen.getByText(/Network error/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Retry/i));
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
  });

  it('enters edit mode when edit button is clicked', async () => {
    mockFetch.mockResolvedValue(baseMockUser);
    render(<UserProfile userId="1" />);
    await screen.findByText('John Doe');
    fireEvent.click(screen.getByText(/Edit Profile/i));
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  it('validates email with debounce and clears error when valid', async () => {
    mockFetch.mockResolvedValue(baseMockUser);
    render(<UserProfile userId="1" />);
    await screen.findByText('John Doe');

    fireEvent.click(screen.getByText(/Edit Profile/i));
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(await screen.findByText(/Invalid email format/i)).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() => expect(screen.queryByText(/Invalid email format/i)).not.toBeInTheDocument());
  });

  it('validates name and phone on submit', async () => {
    mockFetch.mockResolvedValue(baseMockUser);
    render(<UserProfile userId="1" />);
    await screen.findByText('John Doe');

    fireEvent.click(screen.getByText(/Edit Profile/i));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: 'bad' } });
    fireEvent.click(screen.getByText(/Save/i));

    expect(await screen.findByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid phone format/i)).toBeInTheDocument();
  });

  it('submits valid updates and calls onUpdate', async () => {
    const updatedUser = { ...baseMockUser, name: 'Jane Doe' };
    mockFetch.mockResolvedValue(baseMockUser);
    mockUpdate.mockResolvedValue(updatedUser);
    const onUpdate = jest.fn();

    render(<UserProfile userId="1" onUpdate={onUpdate} />);
    await screen.findByText('John Doe');
    fireEvent.click(screen.getByText(/Edit Profile/i));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updatedUser));
    expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
  });

  it('shows error banner on update failure', async () => {
    mockFetch.mockResolvedValue(baseMockUser);
    mockUpdate.mockRejectedValue(new Error('Update failed'));

    render(<UserProfile userId="1" />);
    await screen.findByText('John Doe');
    fireEvent.click(screen.getByText(/Edit Profile/i));
    fireEvent.click(screen.getByText(/Save/i));

    expect(await screen.findByRole('alert')).toHaveTextContent('Update failed');
  });

  it('cancels edits and restores original data', async () => {
    mockFetch.mockResolvedValue(baseMockUser);
    render(<UserProfile userId="1" />);
    await screen.findByText('John Doe');
    fireEvent.click(screen.getByText(/Edit Profile/i));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Temp' } });
    fireEvent.click(screen.getByText(/Cancel/i));
    expect((screen.getByLabelText(/Name/i) as HTMLInputElement).value).toBe('John Doe');
  });

  it('toggles status when checkbox clicked', async () => {
    mockFetch.mockResolvedValue(baseMockUser);
    render(<UserProfile userId="1" />);
    await screen.findByText('John Doe');
    fireEvent.click(screen.getByText(/Edit Profile/i));

    const statusCheckbox = screen.getByRole('checkbox');
    expect(statusCheckbox).toBeChecked();
    fireEvent.click(statusCheckbox);
    expect(statusCheckbox).not.toBeChecked();
  });

  it('disables role changes for admin and readonly modes', async () => {
    const adminUser = { ...baseMockUser, role: 'admin' as const };
    mockFetch.mockResolvedValue(adminUser);
    render(<UserProfile userId="1" />);
    await screen.findByText('John Doe');
    fireEvent.click(screen.getByText(/Edit Profile/i));

    const radios = screen.getAllByRole('radio');
    radios.forEach(r => expect(r).toBeDisabled());

    // readonly mode hides edit controls
    mockFetch.mockResolvedValue(baseMockUser);
    render(<UserProfile userId="1" readonly />);
    await screen.findByText('John Doe');
    expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument();
  });

  it('applies theme class', async () => {
    mockFetch.mockResolvedValue(baseMockUser);
    render(<UserProfile userId="1" theme="dark" />);
    await screen.findByTestId('user-profile');
    expect(screen.getByTestId('user-profile')).toHaveClass('dark');
  });

  it('formats last login for today, yesterday, and older dates', async () => {
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    const threeDaysAgo = new Date(); threeDaysAgo.setDate(today.getDate() - 3);

    mockFetch.mockResolvedValue({ ...baseMockUser, metadata: { lastLogin: today.toISOString() } });
    const { unmount } = render(<UserProfile userId="1" />);
    await screen.findByText(/Today/);
    unmount();

    mockFetch.mockResolvedValue({ ...baseMockUser, metadata: { lastLogin: yesterday.toISOString() } });
    const { unmount: unmount2 } = render(<UserProfile userId="1" />);
    await screen.findByText(/Yesterday/);
    unmount2();

    mockFetch.mockResolvedValue({ ...baseMockUser, metadata: { lastLogin: threeDaysAgo.toISOString() } });
    const { unmount: unmount3 } = render(<UserProfile userId="1" />);
    await screen.findByText(/3 days ago/);
    unmount3();

    mockFetch.mockResolvedValue({ ...baseMockUser, metadata: { lastLogin: undefined } });
    render(<UserProfile userId="1" />);
    await screen.findByText(/Never/);
  });
});
