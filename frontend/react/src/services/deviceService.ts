import api from "../api/api";
import type { Device, DeviceType } from "../types/device";

type DeviceResponse = Device | { device: Device };
type DeviceTypeResponse = DeviceType | { device_type: DeviceType };

const unwrapDevice = (data: DeviceResponse): Device => {
  return "device" in data ? data.device : data;
};

const unwrapDeviceType = (data: DeviceTypeResponse): DeviceType => {
  return "device_type" in data ? data.device_type : data;
};

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
  const response = await api.post<DeviceResponse>("/devices", device);
  return unwrapDevice(response.data);
};

export const updateDevice = async (
  id: string | number,
  device: Partial<Device>
): Promise<Device> => {
  const response = await api.put<DeviceResponse>(`/devices/${id}`, device);
  return unwrapDevice(response.data);
};

export const deleteDevice = async (
  id: string | number
): Promise<void> => {
  await api.delete(`/devices/${id}`);
};

export const getDeviceTypes = async (): Promise<DeviceType[]> => {
  const response = await api.get<DeviceType[]>("/device-types");
  return response.data;
};

export const createDeviceType = async (
  deviceType: Partial<DeviceType>
): Promise<DeviceType> => {
  const response = await api.post<DeviceTypeResponse>("/device-types", deviceType);
  return unwrapDeviceType(response.data);
};

export const updateDeviceType = async (
  id: string | number,
  deviceType: Partial<DeviceType>
): Promise<DeviceType> => {
  const response = await api.put<DeviceTypeResponse>(`/device-types/${id}`, deviceType);
  return unwrapDeviceType(response.data);
};

export const deleteDeviceType = async (
  id: string | number
): Promise<void> => {
  await api.delete(`/device-types/${id}`);
};
