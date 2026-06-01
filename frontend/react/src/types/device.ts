export interface Device {
  id: string | number;
  name?: string;
  nombre?: string;
  hostname?: string;
  ip_address?: string;
  serial_number?: string;
  brand?: string;
  model?: string;
  status?: string;
  estado?: string;
  description?: string;
  device_type_id?: string | number;
  location_id?: string | number;
  user_id?: string | number;
  assigned_user_id?: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceType {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
