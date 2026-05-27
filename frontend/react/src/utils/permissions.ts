import type { RolePermissions, UserRole } from "../types/auth";

export const normalizeRole = (roleName?: string): UserRole => {
  const role = String(roleName || "USER").toUpperCase();

  if (role === "ADMIN") return "admin";
  if (role === "SUPERVISOR") return "supervisor";
  if (role === "TECHNICIAN") return "technician";
  if (role === "TECNICIAN") return "technician";
  if (role === "USER") return "user";

  return "user";
};

export const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAll: true,
    canEdit: true,
    canDelete: true,
    canViewAlerts: true,
    canViewReports: true,
    canManageUsers: true,
    canExport: true,
  },

  supervisor: {
    canViewAll: true,
    canEdit: false,
    canDelete: false,
    canViewAlerts: true,
    canViewReports: true,
    canManageUsers: false,
    canExport: true,
  },

  technician: {
    canViewAll: false,
    canEdit: true,
    canDelete: false,
    canViewAlerts: true,
    canViewReports: false,
    canManageUsers: false,
    canExport: false,
  },

  user: {
    canViewAll: true,
    canEdit: false,
    canDelete: false,
    canViewAlerts: false,
    canViewReports: false,
    canManageUsers: false,
    canExport: false,
  },
};

export const roleInfo: Record<
  UserRole,
  {
    label: string;
    color: string;
    icon: string;
  }
> = {
  admin: {
    label: "Administrator",
    color: "#ef4444",
    icon: "👨‍💼",
  },

  supervisor: {
    label: "Supervisor",
    color: "#f59e0b",
    icon: "👥",
  },

  technician: {
    label: "technical",
    color: "#3b82f6",
    icon: "🔧",
  },

  user: {
    label: "Usuario",
    color: "#6b7280",
    icon: "👁️",
  },
};
