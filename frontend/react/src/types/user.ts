import type { BackendRoleName, UserRole } from "./auth";

export interface UserData {
  id: string | number;
  username: string;
  email?: string;
  role?: UserRole;
  role_name?: BackendRoleName;
  created_at?: string;
}