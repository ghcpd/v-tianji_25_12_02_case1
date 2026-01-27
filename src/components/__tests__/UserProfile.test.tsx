import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserProfile } from '../UserProfile';
import * as api from '@/services/api';

jest.mock('@/services/api');

const mockUser = {
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

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    (api.fetchUserData as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<UserProfile userId="1" />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('should render user data after loading', async () => {
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    render(<UserProfile userId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display error message on load failure', async () => {
    (api.fetchUserData as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<UserProfile userId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('should enter edit mode when edit button is clicked', async () => {
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    render(<UserProfile userId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);
    
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  it('should validate email on change', async () => {
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    render(<UserProfile userId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Edit Profile/i));
    
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  it('should submit updates and call onUpdate', async () => {
    const onUpdate = jest.fn();
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    (api.updateUserProfile as jest.Mock).mockResolvedValue({ ...mockUser, name: 'Jane Doe' });
    render(<UserProfile userId="1" onUpdate={onUpdate} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Edit Profile/i));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
    });
  });

  it('should show error banner when update fails', async () => {
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    (api.updateUserProfile as jest.Mock).mockRejectedValue(new Error('Update failed'));
    render(<UserProfile userId="1" />);

    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText(/Edit Profile/i));
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Update failed');
    });
  });

  it('should not allow role change when user is admin', async () => {
    const adminUser = { ...mockUser, role: 'admin' as const };
    (api.fetchUserData as jest.Mock).mockResolvedValue(adminUser);
    render(<UserProfile userId="1" />);

    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText(/Edit Profile/i));
    const guestRadio = screen.getByLabelText('guest') as HTMLInputElement;
    expect(guestRadio.disabled).toBe(true);
    expect((screen.getByLabelText('admin') as HTMLInputElement).checked).toBe(true);
  });

  it('should toggle status when checkbox clicked', async () => {
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    render(<UserProfile userId="1" />);
    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText(/Edit Profile/i));
    const statusCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(statusCheckbox.checked).toBe(true);
    fireEvent.click(statusCheckbox);
    expect(statusCheckbox.checked).toBe(false);
  });

  it('should render readonly view without edit controls', async () => {
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    render(<UserProfile userId="1" readonly />);
    await waitFor(() => screen.getByText('John Doe'));
    expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument();
  });

  it('should format last login dates correctly', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-10T12:00:00Z'));

    (api.fetchUserData as jest.Mock).mockResolvedValue({
      ...mockUser,
      metadata: { lastLogin: '2024-01-10T08:00:00Z' },
    });
    const { rerender } = render(<UserProfile userId="1" />);
    await waitFor(() => screen.getByText('John Doe'));
    expect(screen.getByText(/Last Login: Today/)).toBeInTheDocument();

    (api.fetchUserData as jest.Mock).mockResolvedValue({
      ...mockUser,
      metadata: { lastLogin: '2024-01-09T12:00:00Z' },
    });
    rerender(<UserProfile userId="2" />);
    await waitFor(() => expect(screen.getByText(/Last Login: Yesterday/)).toBeInTheDocument());

    (api.fetchUserData as jest.Mock).mockResolvedValue({
      ...mockUser,
      metadata: { lastLogin: '2024-01-07T12:00:00Z' },
    });
    rerender(<UserProfile userId="3" />);
    await waitFor(() => expect(screen.getByText(/Last Login: 3 days ago/)).toBeInTheDocument());

    (api.fetchUserData as jest.Mock).mockResolvedValue({
      ...mockUser,
      metadata: {},
    });
    rerender(<UserProfile userId="4" />);
    await waitFor(() => expect(screen.getByText(/Last Login: Never/)).toBeInTheDocument());

    jest.useRealTimers();
  });

  it('should debounce email validation', async () => {
    jest.useFakeTimers();
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    render(<UserProfile userId="1" />);
    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText(/Edit Profile/i));
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });

    // Advance debounce timer
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText(/Invalid email format/i)).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('should reset form on cancel', async () => {
    (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    render(<UserProfile userId="1" />);
    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText(/Edit Profile/i));
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Changed' } });
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(nameInput.value).toBe('John Doe');
  });
});
