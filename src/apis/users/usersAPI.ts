import apiClient from "../../apis/apiClient";
import { type UserModel, type UserModelCreate } from "../../services/apiModel";

export const getAllUsers = async (): Promise<UserModel[]> => {
  const response = await apiClient.get<UserModel[]>("/users");
  return response.data;
};

export const getUserByEmail = async (email: string): Promise<UserModel> => {
  const response = await apiClient.get<UserModel>(`/users/by-email/${email}`);
  return response.data;
};

export const createUser = async (user: UserModelCreate): Promise<UserModel> => {
  const response = await apiClient.post<UserModel>("/users", user);
  return response.data;
};

export const updateUser = async (
  user_id: number,
  user: UserModelCreate
): Promise<UserModel> => {
  const response = await apiClient.put<UserModel>(`/users/${user_id}`, user);
  return response.data;
};
