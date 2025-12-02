import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
});
