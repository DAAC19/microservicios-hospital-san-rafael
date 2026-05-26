import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { logout } from "../services/authService";
import type { User } from "../types/auth";
import { roleInfo, rolePermissionsMap } from "../utils/permissions";
import logoHSF from "../assets/logoHSF.jpg";
import "./appChrome.css";

interface AppChromeProps {
  user: User;
  active?: "dashboard" | "devices" | "locations" | "metrics" | "alerts" | "reports" | "users" | "profile";
  children: ReactNode;
}

export default function AppChrome({ user, active, children }: AppChromeProps) {
  const navigate = useNavigate();
  const permissions = rolePermissionsMap[user.role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { key: "dashboard", label: "Dashboard", path: "/dashboard", visible: true },
    { key: "devices", label: "Dispositivos", path: "/devices", visible: true },
    { key: "locations", label: "Ubicaciones", path: "/locations", visible: true },
    { key: "metrics", label: "Métricas", path: "/metrics", visible: true },
    { key: "alerts", label: "Alertas", path: "/alerts", visible: permissions.canViewAlerts },
    { key: "reports", label: "Reportes", path: "/reports", visible: permissions.canViewReports },
    { key: "users", label: "Usuarios", path: "/users", visible: permissions.canManageUsers },
  ];

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <button className="app-brand" onClick={() => navigate("/dashboard")} type="button">
          <img className="app-brand-logo" src={logoHSF} alt="Hospital San Rafael" />
          <span className="app-brand-text">Hospital San Rafael</span>
        </button>

        <ul className="app-nav-links">
          {links.filter((link) => link.visible).map((link) => (
            <li key={link.key}>
              <button
                className={`app-nav-link ${active === link.key ? "active" : ""}`}
                onClick={() => navigate(link.path)}
                type="button"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="app-nav-right">
          <button className="app-nav-user" onClick={() => navigate("/profile")} type="button">
            <span className="app-nav-avatar">{roleInfo[user.role].icon}</span>
            <span>
              <span className="app-nav-username">{user.username}</span>
              <span className="app-role-pill" style={{ backgroundColor: roleInfo[user.role].color }}>
                {roleInfo[user.role].label}
              </span>
            </span>
          </button>
          <button className="app-btn-ghost" onClick={() => navigate("/")} type="button">Home</button>
          <button className="app-btn-ghost" onClick={handleLogout} type="button">Cerrar sesión</button>
        </div>
      </nav>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <div>
          <div className="app-footer-brand">
            <img className="app-footer-logo" src={logoHSF} alt="" />
            Hospital San Rafael
          </div>
          <div className="app-footer-text">Plataforma de microservicios - Sistema de monitoreo hospitalario</div>
        </div>
        <div className="app-footer-links">
          {links.filter((link) => link.visible).slice(0, 6).map((link) => (
            <button key={link.key} className="app-footer-link" onClick={() => navigate(link.path)} type="button">
              {link.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
