import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import * as api from '@/services/api';

jest.mock('@/services/api');
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: jest.fn((value) => value),
}));

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

const mockAdminUser = {
  ...mockUser,
  id: '2',
  name: 'Admin User',
  role: 'admin' as const,
};

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading and Error States', () => {
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

    it('should show retry button on error', async () => {
      (api.fetchUserData as jest.Mock).mockRejectedValue(new Error('Failed'));
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/Retry/i)).toBeInTheDocument();
      });
    });

    it('should retry loading user data', async () => {
      (api.fetchUserData as jest.Mock).mockRejectedValueOnce(new Error('Failed')).mockResolvedValueOnce(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/Retry/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Retry/i));

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

  it('should show empty state when no user found', async () => {
    (api.fetchUserData as jest.Mock).mockRejectedValue(new Error('User not found'));
    render(<UserProfile userId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/User not found/i)).toBeInTheDocument();
    });
  });    it('should handle non-Error exceptions', async () => {
      (api.fetchUserData as jest.Mock).mockRejectedValue('String error');
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load user/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when edit button is clicked', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const editButton = screen.getByText(/Edit Profile/i);
      fireEvent.click(editButton);
      
      expect(screen.getByText(/Save/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });

    it('should cancel editing and restore original data', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
      
      fireEvent.click(screen.getByText(/Cancel/i));
      
      expect(screen.queryByText(/Save/i)).not.toBeInTheDocument();
    });

    it('should not show edit button in readonly mode', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" readonly={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email on change with debounce', async () => {
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

    it('should validate name length', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'A' } });
      
      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate phone format', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const phoneInput = screen.getByLabelText(/Phone/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });
      
      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid phone format/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when valid', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });

      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      
      await waitFor(() => {
        expect(screen.queryByText(/Invalid email format/i)).not.toBeInTheDocument();
      });
    });

    it('should disable save button when validation errors exist', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      
      await waitFor(() => {
        const saveButton = screen.getByText(/Save/i) as HTMLButtonElement;
        expect(saveButton.disabled).toBe(true);
      });
    });
  });

  describe('Update Profile', () => {
    it('should successfully update user profile', async () => {
      const updatedUser = { ...mockUser, name: 'Jane Doe' };
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      (api.updateUserProfile as jest.Mock).mockResolvedValue(updatedUser);
      
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      
      fireEvent.click(screen.getByText(/Save/i));

      await waitFor(() => {
        expect(api.updateUserProfile).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Jane Doe' }));
      });
    });

    it('should call onUpdate callback after successful update', async () => {
      const onUpdate = jest.fn();
      const updatedUser = { ...mockUser, name: 'Jane Doe' };
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      (api.updateUserProfile as jest.Mock).mockResolvedValue(updatedUser);
      
      render(<UserProfile userId="1" onUpdate={onUpdate} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      
      fireEvent.click(screen.getByText(/Save/i));

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(updatedUser);
      });
    });

    it('should show error on update failure', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      (api.updateUserProfile as jest.Mock).mockRejectedValue(new Error('Update failed'));
      
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      
      fireEvent.click(screen.getByText(/Save/i));

      await waitFor(() => {
        expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
      });
    });

    it('should handle non-Error update exceptions', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      (api.updateUserProfile as jest.Mock).mockRejectedValue('String error');
      
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      fireEvent.click(screen.getByText(/Save/i));

      await waitFor(() => {
        expect(screen.getByText(/Failed to update user/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role Management', () => {
    it('should change user role', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const guestRadio = screen.getByLabelText(/guest/i);
      fireEvent.click(guestRadio);
      
      expect(guestRadio).toBeChecked();
    });

    it('should not change role for admin users', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockAdminUser);
      render(<UserProfile userId="2" />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const userRadio = screen.getByLabelText(/^user$/i);
      expect(userRadio).toBeDisabled();
    });

    it('should not change role in readonly mode', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" readonly={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Edit Profile/i)).not.toBeInTheDocument();
    });
  });

  describe('Status Management', () => {
    it('should toggle status from active to inactive', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const checkbox = screen.getByLabelText(/Active Status/i);
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should not toggle status in readonly mode', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" readonly={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/Active Status/i)).not.toBeInTheDocument();
    });
  });

  describe('Badge Colors', () => {
    it('should display correct badge color for admin role', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockAdminUser);
      render(<UserProfile userId="2" />);
      
      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });
    });

    it('should display correct badge color for user role', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('user')).toBeInTheDocument();
      });
    });

    it('should display correct badge color for guest role', async () => {
      const guestUser = { ...mockUser, role: 'guest' as const };
      (api.fetchUserData as jest.Mock).mockResolvedValue(guestUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('guest')).toBeInTheDocument();
      });
    });

    it('should display correct badge color for active status', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });
    });

    it('should display correct badge color for inactive status', async () => {
      const inactiveUser = { ...mockUser, status: 'inactive' as const };
      (api.fetchUserData as jest.Mock).mockResolvedValue(inactiveUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('inactive')).toBeInTheDocument();
      });
    });

    it('should display correct badge color for suspended status', async () => {
      const suspendedUser = { ...mockUser, status: 'suspended' as const };
      (api.fetchUserData as jest.Mock).mockResolvedValue(suspendedUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('suspended')).toBeInTheDocument();
      });
    });
  });

  describe('Last Login Formatting', () => {
    it('should display "Never" when lastLogin is undefined', async () => {
      const userWithoutLogin = { ...mockUser, metadata: {} };
      (api.fetchUserData as jest.Mock).mockResolvedValue(userWithoutLogin);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/Last Login: Never/i)).toBeInTheDocument();
      });
    });

    it('should display "Today" for today login', async () => {
      const today = new Date().toISOString();
      const userWithTodayLogin = { ...mockUser, metadata: { lastLogin: today } };
      (api.fetchUserData as jest.Mock).mockResolvedValue(userWithTodayLogin);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/Last Login: Today/i)).toBeInTheDocument();
      });
    });

    it('should display "Yesterday" for yesterday login', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const userWithYesterdayLogin = { ...mockUser, metadata: { lastLogin: yesterday } };
      (api.fetchUserData as jest.Mock).mockResolvedValue(userWithYesterdayLogin);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/Last Login: Yesterday/i)).toBeInTheDocument();
      });
    });

    it('should display days ago for recent logins', async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const userWithRecentLogin = { ...mockUser, metadata: { lastLogin: threeDaysAgo } };
      (api.fetchUserData as jest.Mock).mockResolvedValue(userWithRecentLogin);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/Last Login: 3 days ago/i)).toBeInTheDocument();
      });
    });

    it('should display formatted date for old logins', async () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const userWithOldLogin = { ...mockUser, metadata: { lastLogin: oldDate } };
      (api.fetchUserData as jest.Mock).mockResolvedValue(userWithOldLogin);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/Last Login:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Theme Support', () => {
    it('should apply light theme by default', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        const profile = screen.getByTestId('user-profile');
        expect(profile).toHaveClass('light');
      });
    });

    it('should apply dark theme', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" theme="dark" />);
      
      await waitFor(() => {
        const profile = screen.getByTestId('user-profile');
        expect(profile).toHaveClass('dark');
      });
    });
  });

  describe('Input Handling', () => {
    it('should update form data on input change', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
      
      expect(nameInput.value).toBe('New Name');
    });

    it('should disable inputs during loading', async () => {
      (api.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
      (api.updateUserProfile as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      render(<UserProfile userId="1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Edit Profile/i));
      fireEvent.click(screen.getByText(/Save/i));

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
        expect(nameInput.disabled).toBe(true);
      });
    });
  });
});
