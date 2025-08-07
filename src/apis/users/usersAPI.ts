import apiClient from '../../apis/apiClient';
import { type UserModel } from '../../services/apiModel';

export const getAllUsers = async (): Promise<UserModel[]> => {
  const response = await apiClient.get<UserModel[]>('/users');
  return response.data;
};

export const getUserByEmail = async (email: string): Promise<UserModel> => {
  const response = await apiClient.get<UserModel>(`/users/by-email/${email}`);
  return response.data;
};
