import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import logoHSF from "../assets/logoHSF.jpg";
import type { User, RolePermissions } from "../types/auth";
import { roleInfo } from "../utils/permissions";

type NavbarPageKey =
  | "dashboard"
  | "devices"
  | "locations"
  | "metrics"
  | "alerts"
  | "reports"
  | "users";

interface NavbarProps {
  user: User;
  permissions: RolePermissions;
  activePage: NavbarPageKey;
  onLogout: () => void;
}

const NAV_LINKS: Array<{
  key: NavbarPageKey;
  label: string;
  path: string;
  visible: (permissions: RolePermissions) => boolean;
}> = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", visible: () => true },
  { key: "devices", label: "Devices", path: "/devices", visible: () => true },
  { key: "locations", label: "Locations", path: "/locations", visible: (perm) => perm.canViewAll },
  { key: "metrics", label: "Metrics", path: "/metrics", visible: (perm) => perm.canViewAll },
  { key: "alerts", label: "Alerts", path: "/alerts", visible: (perm) => perm.canViewAlerts },
  { key: "reports", label: "Reports", path: "/reports", visible: (perm) => perm.canViewReports },
  { key: "users", label: "Users", path: "/users", visible: (perm) => perm.canManageUsers },
];

const Navbar = ({ user, permissions, activePage, onLogout }: NavbarProps) => {
  const navigate = useNavigate();

  const visibleLinks = useMemo(
    () => NAV_LINKS.filter((link) => link.visible(permissions)),
    [permissions]
  );

  const role = roleInfo[user.role] ?? { icon: "👤", label: String(user.role), color: "#64748b" };

  const styles = {
    nav: {
      background: "#0f172a",
      padding: "0 2rem",
      position: "sticky",
      top: 0,
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 60,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }as const,
    brand: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      textDecoration: "none",
    },
    brandIcon: {
      width: 40,
      height: 40,
      borderRadius: 4,
      objectFit: "contain" as const,
      background: "#fff",
      flexShrink: 0,
    },
    brandText: {
      fontFamily: "Fraunces, serif",
      fontSize: "1.05rem",
      fontWeight: 700,
      color: "#fff",
      letterSpacing: "-0.3px",
      whiteSpace: "nowrap" as const,
    },
    links: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      listStyle: "none" as const,
      margin: 0,
      padding: 0,
    },
    linkButton: {
      color: "#94a3b8",
      textDecoration: "none",
      fontSize: "0.875rem",
      fontWeight: 500,
      padding: "6px 12px",
      borderRadius: 6,
      transition: "all 0.15s",
      cursor: "pointer",
      background: "none",
      border: "none",
    },
    activeLink: {
      color: "#fff",
      background: "rgba(255,255,255,0.08)",
    },
    navRight: {
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    userBox: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      padding: "6px 12px",
    },
    avatar: {
      width: 28,
      height: 28,
      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
    },
    username: {
      fontSize: "0.8rem",
      fontWeight: 600,
      color: "#e2e8f0",
    },
    rolePill: {
      display: "inline-block",
      fontSize: "0.65rem",
      fontWeight: 700,
      padding: "2px 8px",
      borderRadius: 20,
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      color: "#fff",
    },
    ghostButton: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#cbd5e1",
      padding: "6px 14px",
      borderRadius: 7,
      fontSize: "0.8rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.15s",
      fontFamily: "DM Sans, sans-serif",
      whiteSpace: "nowrap" as const,
    },
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <img style={styles.brandIcon} src={logoHSF} alt="Hospital San Rafael" />
        <span style={styles.brandText}>Hospital San Rafael</span>
      </div>

      <ul style={styles.links}>
        {visibleLinks.map((link) => {
          const isActive = activePage === link.key;
          return (
            <li key={link.key}>
              <button
                type="button"
                style={{
                  ...styles.linkButton,
                  ...(isActive ? styles.activeLink : {}),
                }}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div style={styles.navRight}>
        <div style={styles.userBox}>
          <div style={styles.avatar}>{role.icon}</div>
          <div>
            <div style={styles.username}>{user.username}</div>
            <span style={{ ...styles.rolePill, backgroundColor: role.color }}>
              {role.label}
            </span>
          </div>
        </div>

        <button type="button" style={styles.ghostButton} onClick={() => navigate("/profile")}>Profile</button>
        <button type="button" style={styles.ghostButton} onClick={() => navigate("/")}>Home</button>
        <button type="button" style={styles.ghostButton} onClick={onLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
