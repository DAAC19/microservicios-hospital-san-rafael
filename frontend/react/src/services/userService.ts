import api from "../api/api";
import type { UserData } from "../types/user";

type UsersListResponse = UserData[] | [UserData[], number];
type UserWriteResponse = UserData | [UserData, unknown] | [UserData, unknown, number];

const unwrapUsers = (data: UsersListResponse): UserData[] => {
  return Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data as UserData[];
};

const unwrapUser = (data: UserWriteResponse): UserData => {
  return Array.isArray(data) ? data[0] : data;
};

export const getUsers = async (): Promise<UserData[]> => {
  const response = await api.get<UsersListResponse>("/users");
  return unwrapUsers(response.data);
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
  const response = await api.post<UserWriteResponse>("/users", user);
  return unwrapUser(response.data);
};

export const updateUser = async (
  id: string | number,
  user: Partial<UserData>
): Promise<UserData> => {
  const response = await api.put<UserWriteResponse>(`/users/${id}`, user);
  return unwrapUser(response.data);
};

export const deleteUser = async (
  id: string | number
): Promise<void> => {
  await api.delete(`/users/${id}`);
};
