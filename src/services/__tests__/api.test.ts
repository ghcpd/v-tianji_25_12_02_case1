import axios from 'axios';
import { fetchUserData, updateUserProfile, deleteUser, fetchUsers, User } from '../api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'user',
  status: 'active',
  metadata: {
    lastLogin: '2024-01-01T00:00:00Z',
    preferences: { theme: 'dark' },
  },
};

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserData', () => {
    it('should fetch user data successfully', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockUser });

      const result = await fetchUserData('1');
      expect(result).toEqual(mockUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users/1');
    });

    it('should fetch user with different ID', async () => {
      const user2 = { ...mockUser, id: '2', name: 'Jane Doe' };
      mockedAxios.get.mockResolvedValue({ data: user2 });

      const result = await fetchUserData('2');
      expect(result).toEqual(user2);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users/2');
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUserData('1')).rejects.toThrow('Network error');
    });

    it('should handle 404 errors', async () => {
      const error = { response: { status: 404, data: { message: 'User not found' } } };
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUserData('999')).rejects.toEqual(error);
    });

    it('should handle user without metadata', async () => {
      const userWithoutMetadata = { ...mockUser, metadata: undefined };
      mockedAxios.get.mockResolvedValue({ data: userWithoutMetadata });

      const result = await fetchUserData('1');
      expect(result.metadata).toBeUndefined();
    });

    it('should handle user with empty metadata', async () => {
      const userWithEmptyMetadata = { ...mockUser, metadata: {} };
      mockedAxios.get.mockResolvedValue({ data: userWithEmptyMetadata });

      const result = await fetchUserData('1');
      expect(result.metadata).toEqual({});
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updatedData = { name: 'Jane Doe' };
      const mockResponse = { ...mockUser, ...updatedData };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserProfile('1', updatedData);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.patch).toHaveBeenCalledWith('https://api.example.com/users/1', updatedData);
    });

    it('should update multiple fields', async () => {
      const updatedData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+9876543210',
      };
      const mockResponse = { ...mockUser, ...updatedData };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserProfile('1', updatedData);
      expect(result).toEqual(mockResponse);
    });

    it('should update user role', async () => {
      const updatedData = { role: 'admin' as const };
      const mockResponse = { ...mockUser, ...updatedData };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserProfile('1', updatedData);
      expect(result.role).toBe('admin');
    });

    it('should update user status', async () => {
      const updatedData = { status: 'inactive' as const };
      const mockResponse = { ...mockUser, ...updatedData };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserProfile('1', updatedData);
      expect(result.status).toBe('inactive');
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockedAxios.patch.mockRejectedValue(error);

      await expect(updateUserProfile('1', { name: 'Jane' })).rejects.toThrow('Update failed');
    });

    it('should handle validation errors', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid email format' },
        },
      };
      mockedAxios.patch.mockRejectedValue(error);

      await expect(updateUserProfile('1', { email: 'invalid' })).rejects.toEqual(error);
    });

    it('should update with empty partial data', async () => {
      mockedAxios.patch.mockResolvedValue({ data: mockUser });

      const result = await updateUserProfile('1', {});
      expect(result).toEqual(mockUser);
    });

    it('should update metadata', async () => {
      const updatedData = {
        metadata: {
          lastLogin: '2024-12-01T00:00:00Z',
          preferences: { theme: 'light' },
        },
      };
      const mockResponse = { ...mockUser, ...updatedData };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserProfile('1', updatedData);
      expect(result.metadata).toEqual(updatedData.metadata);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockedAxios.delete.mockResolvedValue({ data: null });

      await deleteUser('1');
      expect(mockedAxios.delete).toHaveBeenCalledWith('https://api.example.com/users/1');
    });

    it('should delete user with different ID', async () => {
      mockedAxios.delete.mockResolvedValue({ data: null });

      await deleteUser('999');
      expect(mockedAxios.delete).toHaveBeenCalledWith('https://api.example.com/users/999');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockedAxios.delete.mockRejectedValue(error);

      await expect(deleteUser('1')).rejects.toThrow('Delete failed');
    });

    it('should handle 404 on delete', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'User not found' },
        },
      };
      mockedAxios.delete.mockRejectedValue(error);

      await expect(deleteUser('999')).rejects.toEqual(error);
    });

    it('should handle unauthorized delete', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      };
      mockedAxios.delete.mockRejectedValue(error);

      await expect(deleteUser('1')).rejects.toEqual(error);
    });

    it('should return void on success', async () => {
      mockedAxios.delete.mockResolvedValue({ data: null });

      const result = await deleteUser('1');
      expect(result).toBeUndefined();
    });
  });

  describe('fetchUsers', () => {
    const mockUsers: User[] = [
      mockUser,
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+9876543210',
        role: 'admin',
        status: 'active',
      },
      {
        id: '3',
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1122334455',
        role: 'guest',
        status: 'inactive',
      },
    ];

    it('should fetch users without parameters', async () => {
      const mockResponse = { users: mockUsers, total: 3 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers();
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', { params: undefined });
    });

    it('should fetch users with pagination parameters', async () => {
      const mockResponse = { users: mockUsers.slice(0, 2), total: 3 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers({ page: 1, limit: 2 });
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params: { page: 1, limit: 2 },
      });
    });

    it('should fetch users with search parameter', async () => {
      const mockResponse = { users: [mockUser], total: 1 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers({ search: 'John' });
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params: { search: 'John' },
      });
    });

    it('should fetch users with all parameters', async () => {
      const mockResponse = { users: [mockUser], total: 1 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers({ page: 1, limit: 10, search: 'Doe' });
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params: { page: 1, limit: 10, search: 'Doe' },
      });
    });

    it('should handle empty user list', async () => {
      const mockResponse = { users: [], total: 0 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers();
      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle fetch users errors', async () => {
      const error = new Error('Failed to fetch users');
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUsers()).rejects.toThrow('Failed to fetch users');
    });

    it('should handle invalid pagination parameters', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid page number' },
        },
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUsers({ page: -1 })).rejects.toEqual(error);
    });

    it('should return correct total count', async () => {
      const mockResponse = { users: mockUsers.slice(0, 2), total: 100 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers({ page: 1, limit: 2 });
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(100);
    });

    it('should handle large page numbers', async () => {
      const mockResponse = { users: [], total: 3 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers({ page: 999, limit: 10 });
      expect(result.users).toHaveLength(0);
    });

    it('should handle different limit values', async () => {
      const mockResponse = { users: mockUsers, total: 3 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      await fetchUsers({ limit: 50 });
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params: { limit: 50 },
      });
    });

    it('should handle special characters in search', async () => {
      const mockResponse = { users: [], total: 0 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      await fetchUsers({ search: 'test@example.com' });
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params: { search: 'test@example.com' },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout', async () => {
      const error = { code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' };
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUserData('1')).rejects.toEqual(error);
    });

    it('should handle 500 server errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUserData('1')).rejects.toEqual(error);
    });

    it('should handle unauthorized requests', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUserData('1')).rejects.toEqual(error);
    });
  });
});
