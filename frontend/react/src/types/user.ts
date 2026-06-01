import type { BackendRoleName, UserRole } from "./auth";

export interface UserData {
  id: string | number;
  first_name?: string;
  last_name?: string;
  document?: string;
  phone?: string;
  username?: string;
  email?: string;
  role?: UserRole;
  role_name?: BackendRoleName;
  created_at?: string;
}
