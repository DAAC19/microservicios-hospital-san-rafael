export interface Report {
  id: string | number;
  title: string;
  description?: string;
  type: string;
  data?: unknown;
  created_at?: string;
}