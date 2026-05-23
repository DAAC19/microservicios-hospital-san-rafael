import api from "../api/api";
import type { Metric, MetricType } from "../types/metric";

// ── Metric Types ─────────────────────────────────────────
export const getMetricTypes = async (): Promise<MetricType[]> => {
  const response = await api.get<MetricType[]>("/metric-types");
  return response.data;
};

export const createMetricType = async (
  data: Partial<MetricType>
): Promise<MetricType> => {
  const response = await api.post<MetricType>("/metric-types", data);
  return response.data;
};

export const deleteMetricType = async (id: string | number): Promise<void> => {
  await api.delete(`/metric-types/${id}`);
};

// ── Metrics ──────────────────────────────────────────────
export const getMetrics = async (filters?: {
  device_id?: string | number;
  metric_type_id?: string | number;
}): Promise<Metric[]> => {
  const params = new URLSearchParams();
  if (filters?.device_id) params.append("device_id", String(filters.device_id));
  if (filters?.metric_type_id) params.append("metric_type_id", String(filters.metric_type_id));
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get<Metric[]>(`/metrics${query}`);
  return response.data;
};

export const getMetricById = async (id: string | number): Promise<Metric> => {
  const response = await api.get<Metric>(`/metrics/${id}`);
  return response.data;
};

export const createMetric = async (data: Partial<Metric>): Promise<Metric> => {
  const response = await api.post<Metric>("/metrics", data);
  return response.data;
};

export const deleteMetric = async (id: string | number): Promise<void> => {
  await api.delete(`/metrics/${id}`);
};