import api from "../api/api";
import type { Device } from "../types/device";

export const getDevices = async (): Promise<Device[]> => {
  const response = await api.get<Device[]>("/devices");
  return response.data;
};

export const getDeviceById = async (
  id: string | number
): Promise<Device> => {
  const response = await api.get<Device>(`/devices/${id}`);
  return response.data;
};

export const createDevice = async (
  device: Partial<Device>
): Promise<Device> => {
  const response = await api.post<Device>("/devices", device);
  return response.data;
};

export const updateDevice = async (
  id: string | number,
  device: Partial<Device>
): Promise<Device> => {
  const response = await api.put<Device>(`/devices/${id}`, device);
  return response.data;
};

export const deleteDevice = async (
  id: string | number
): Promise<void> => {
  await api.delete(`/devices/${id}`);
};