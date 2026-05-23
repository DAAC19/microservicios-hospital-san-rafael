export interface HospitalLocation {
  id: string | number;
  name: string;
  description?: string;
  building?: string;
  floor?: string;
  room?: string;
  created_at?: string;
  updated_at?: string;
}