import api from "../api/api";
import type { Metric } from "../types/metric";

export const getMetrics = async (
  deviceId: string | number
): Promise<Metric[]> => {
  const response = await api.get<Metric[]>(`/metrics?device_id=${deviceId}`);
  return response.data;
};

export const recordMetric = async (
  metric: Partial<Metric>
): Promise<Metric> => {
  const response = await api.post<Metric>("/metrics", metric);
  return response.data;
};