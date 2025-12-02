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
    it('should call axios.delete with correct URL', async () => {
      mockedAxios.delete.mockResolvedValue({});
      await deleteUser('1');
      expect(mockedAxios.delete).toHaveBeenCalledWith('https://api.example.com/users/1');
    });
  });

  describe('fetchUsers', () => {
    it('should fetch users without params', async () => {
      const mockResponse = { users: [], total: 0 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });
      const result = await fetchUsers();
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', { params: undefined });
    });

    it('should fetch users with params', async () => {
      const mockResponse = { users: [{ id: '1' } as any], total: 1 };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });
      const params = { page: 2, limit: 10, search: 'john' };
      const result = await fetchUsers(params);
      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.example.com/users', { params });
    });
  });
});
