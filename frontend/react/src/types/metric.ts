export interface Metric {
  id: string | number;
  device_id: string | number;
  type: string;
  value: number;
  unit: string;
  created_at?: string;
}