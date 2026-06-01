export type BackendRoleName = "ADMIN" | "USER" | "SUPERVISOR" | "TECHNICIAN";

export type UserRole = "admin" | "user" | "supervisor" | "technician";

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id: string | number;
  credential_id?: string | number;
  username: string;
  email?: string;
  role: UserRole;
  role_name?: BackendRoleName;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface RolePermissions {
  canViewAll: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAlerts: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canExport: boolean;
}
