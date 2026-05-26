import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";

interface Props {
  onCancel: () => void;
}

export default function LogoutModal({ onCancel }: Props) {
  const navigate = useNavigate();

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "2rem",
        width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        fontFamily: "'DM Sans', sans-serif", margin: "0 1rem",
      }}>
        <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: "1rem" }}>👋</div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 8 }}>
          ¿Cerrar sesión?
        </h3>
        <p style={{ color: "#64748b", fontSize: "0.875rem", textAlign: "center", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Tu sesión actual se cerrará. Tendrás que iniciar sesión de nuevo para acceder al sistema.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "0.7rem", borderRadius: 8, border: "1.5px solid #e2e8f0",
            background: "#f8fafc", color: "#475569", fontWeight: 600,
            cursor: "pointer", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif",
          }}>
            Cancelar
          </button>
          <button onClick={confirmLogout} style={{
            flex: 1, padding: "0.7rem", borderRadius: 8, border: "none",
            background: "#ef4444", color: "#fff", fontWeight: 700,
            cursor: "pointer", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif",
          }}>
            Sí, cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}