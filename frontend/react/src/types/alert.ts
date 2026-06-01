export interface Alert {
  id: string | number;
  device_id?: string | number;
  severity: string;
  message: string;
  status?: string;
  created_at?: string;
  resolved_at?: string;
}