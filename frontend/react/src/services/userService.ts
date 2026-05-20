import api from "../api/api";
import type { UserData } from "../types/user";

export const getUsers = async (): Promise<UserData[]> => {
  const response = await api.get<UserData[]>("/users");
  return response.data;
};

export const getUserById = async (
  id: string | number
): Promise<UserData> => {
  const response = await api.get<UserData>(`/users/${id}`);
  return response.data;
};

export const createUser = async (
  user: Partial<UserData>
): Promise<UserData> => {
  const response = await api.post<UserData>("/users", user);
  return response.data;
};

export const updateUser = async (
  id: string | number,
  user: Partial<UserData>
): Promise<UserData> => {
  const response = await api.put<UserData>(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (
  id: string | number
): Promise<void> => {
  await api.delete(`/users/${id}`);
};