import api from "../api/api";
import type { Alert } from "../types/alert";

export type CreateAlertPayload = {
  device_id: number;
  severity_id: number;
  message: string;
};

export const getAlerts = async (): Promise<Alert[]> => {
  const response = await api.get<Alert[]>("/alerts");
  return response.data;
};

export const getAlertsByDevice = async (
  deviceId: string | number
): Promise<Alert[]> => {
  const response = await api.get<Alert[]>(`/alerts?device_id=${deviceId}`);
  return response.data;
};

export const createAlert = async (
  alert: CreateAlertPayload
): Promise<Alert> => {
  const response = await api.post<Alert>("/alerts", alert);
  return response.data;
};

export const resolveAlert = async (
  id: string | number
): Promise<Alert> => {
  const response = await api.patch<Alert>(`/alerts/${id}/resolve`);
  return response.data;
};