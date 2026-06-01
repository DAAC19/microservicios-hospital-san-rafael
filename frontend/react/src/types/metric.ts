export interface MetricType {
  id: string | number;
  name: string;
  unit?: string;
  description?: string;
  created_at?: string;
}

export interface Metric {
  id: string | number;
  device_id: string | number;
  metric_type_id: string | number;
  metric_type?: string;
  unit?: string;
  value: number;
  recorded_at?: string;
  created_at?: string;
}