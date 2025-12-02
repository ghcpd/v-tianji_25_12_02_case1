import axios from 'axios';

const API_BASE_URL = 'https://api.example.com';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'suspended';
  metadata?: {
    lastLogin?: string;
    preferences?: Record<string, unknown>;
  };
}

export const fetchUserData = async (userId: string): Promise<User> => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<User> => {
  const response = await axios.patch(`${API_BASE_URL}/users/${userId}`, data);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/users/${userId}`);
};

export const fetchUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ users: User[]; total: number }> => {
  const response = await axios.get(`${API_BASE_URL}/users`, { params });
  return response.data;
};
