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
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updatedData = { name: 'Jane' };
      const mockResponse = { id: '1', ...updatedData };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateUserProfile('1', updatedData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteUser', () => {
    it('should call delete endpoint', async () => {
      mockedAxios.delete.mockResolvedValue({ status: 204 });
      await expect(deleteUser('1')).resolves.toBeUndefined();
      expect(mockedAxios.delete).toHaveBeenCalledWith('https://api.example.com/users/1');
    });

    it('should bubble errors from delete', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('del fail'));
      await expect(deleteUser('1')).rejects.toThrow('del fail');
    });
  });

  describe('fetchUsers', () => {
    it('should fetch users with params', async () => {
      const mockResp = { users: [{ id: '1', name: 'A' }], total: 1 };
      mockedAxios.get.mockResolvedValue({ data: mockResp });

      const res = await fetchUsers({ page: 1, limit: 10, search: 'a' });
      expect(res).toEqual(mockResp);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', { params: { page: 1, limit: 10, search: 'a' } });
    });
  });
});
