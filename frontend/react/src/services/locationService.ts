import api from "../api/api";
import type { HospitalLocation } from "../types/location";

export const getLocations = async (): Promise<HospitalLocation[]> => {
  const response = await api.get<HospitalLocation[]>("/locations");
  return response.data;
};

export const getLocationById = async (
  id: string | number
): Promise<HospitalLocation> => {
  const response = await api.get<HospitalLocation>(`/locations/${id}`);
  return response.data;
};

export const createLocation = async (
  location: Partial<HospitalLocation>
): Promise<HospitalLocation> => {
  const response = await api.post<HospitalLocation>("/locations", location);
  return response.data;
};

export const updateLocation = async (
  id: string | number,
  location: Partial<HospitalLocation>
): Promise<HospitalLocation> => {
  const response = await api.put<HospitalLocation>(
    `/locations/${id}`,
    location
  );

  return response.data;
};

export const deleteLocation = async (
  id: string | number
): Promise<void> => {
  await api.delete(`/locations/${id}`);
};