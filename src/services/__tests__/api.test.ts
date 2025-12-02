import axios from 'axios';
import { fetchUserData, updateUserProfile, deleteUser, fetchUsers } from '../api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserData', () => {
    it('should fetch user data successfully', async () => {
      const mockUser = {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'user',
        status: 'active',
      };

      mockedAxios.get.mockResolvedValue({ data: mockUser });

      const result = await fetchUserData('1');
      expect(result).toEqual(mockUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users/1');
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUserData('1')).rejects.toThrow('Network error');
    });

    it('should construct correct URL for different user IDs', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await fetchUserData('123');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users/123');

      await fetchUserData('user-uuid-1234');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users/user-uuid-1234');
    });

    it('should return full user object with metadata', async () => {
      const mockUser = {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'user',
        status: 'active',
        metadata: {
          lastLogin: '2024-01-01T00:00:00Z',
          preferences: { theme: 'dark' },
        },
      };

      mockedAxios.get.mockResolvedValue({ data: mockUser });

      const result = await fetchUserData('1');
      expect(result.metadata).toEqual(mockUser.metadata);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updatedData = { name: 'Jane' };
      const mockResponse = { id: '1', ...updatedData };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserProfile('1', updatedData);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        updatedData
      );
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockedAxios.patch.mockRejectedValue(error);

      await expect(updateUserProfile('1', { name: 'Jane' })).rejects.toThrow(
        'Update failed'
      );
    });

    it('should allow partial updates', async () => {
      const partialData = { email: 'newemail@example.com' };
      mockedAxios.patch.mockResolvedValue({ data: { id: '1', ...partialData } });

      const result = await updateUserProfile('1', partialData);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        partialData
      );
      expect(result.email).toBe('newemail@example.com');
    });

    it('should handle updating multiple fields', async () => {
      const updateData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+9876543210',
      };

      mockedAxios.patch.mockResolvedValue({
        data: { id: '1', ...updateData },
      });

      const result = await updateUserProfile('1', updateData);
      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane@example.com');
      expect(result.phone).toBe('+9876543210');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} });

      await deleteUser('1');
      expect(mockedAxios.delete).toHaveBeenCalledWith('https://api.example.com/users/1');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockedAxios.delete.mockRejectedValue(error);

      await expect(deleteUser('1')).rejects.toThrow('Delete failed');
    });

    it('should construct correct delete URL', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} });

      await deleteUser('user-123');
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'https://api.example.com/users/user-123'
      );
    });

    it('should handle deletion of non-existent user', async () => {
      const error = new Error('User not found');
      mockedAxios.delete.mockRejectedValue(error);

      await expect(deleteUser('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('fetchUsers', () => {
    it('should fetch users with default params', async () => {
      const mockResponse = {
        users: [
          { id: '1', name: 'User 1' },
          { id: '2', name: 'User 2' },
        ],
        total: 2,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers();
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params: undefined,
      });
    });

    it('should fetch users with pagination', async () => {
      const params = { page: 2, limit: 10 };
      const mockResponse = {
        users: [{ id: '11', name: 'User 11' }],
        total: 100,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers(params);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params,
      });
    });

    it('should fetch users with search', async () => {
      const params = { search: 'john' };
      const mockResponse = {
        users: [{ id: '1', name: 'John Doe' }],
        total: 1,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers(params);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params,
      });
    });

    it('should handle fetch users errors', async () => {
      const error = new Error('Failed to fetch users');
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchUsers()).rejects.toThrow('Failed to fetch users');
    });

    it('should return empty list when no users found', async () => {
      const mockResponse = { users: [], total: 0 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers({ search: 'nonexistent' });
      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle combined pagination and search', async () => {
      const params = { page: 1, limit: 5, search: 'admin' };
      const mockResponse = {
        users: [{ id: '100', name: 'Admin User' }],
        total: 1,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers(params);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params,
      });
    });

    it('should handle large page numbers', async () => {
      const params = { page: 1000, limit: 10 };
      const mockResponse = { users: [], total: 0 };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchUsers(params);
      expect(result.users).toHaveLength(0);
    });

    it('should handle different limit values', async () => {
      mockedAxios.get.mockResolvedValue({ data: { users: [], total: 0 } });

      await fetchUsers({ limit: 50 });
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params: { limit: 50 },
      });

      await fetchUsers({ limit: 100 });
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', {
        params: { limit: 100 },
      });
    });
  });

  describe('API base URL', () => {
    it('should use correct API base URL', () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      fetchUserData('1');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://api.example.com')
      );
    });

    it('should construct URLs correctly for all endpoints', () => {
      mockedAxios.get.mockResolvedValue({ data: {} });
      mockedAxios.patch.mockResolvedValue({ data: {} });
      mockedAxios.delete.mockResolvedValue({ data: {} });

      fetchUserData('1');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users/1');

      updateUserProfile('1', {});
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        {}
      );

      deleteUser('1');
      expect(mockedAxios.delete).toHaveBeenCalledWith('https://api.example.com/users/1');
    });
  });
});
