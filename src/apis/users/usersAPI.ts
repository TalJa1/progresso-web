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

export const createUser = async (user: UserModel): Promise<UserModel> => {
  const response = await apiClient.post<UserModel>('/users', user);
  return response.data;
};
