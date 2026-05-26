import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAlerts, createAlert, resolveAlert } from "../services/alertService";
import { logout, getUserProfile } from "../services/authService";
import { roleInfo, rolePermissionsMap } from "../utils/permissions";
import type { Alert } from "../types/alert";
import type { User, RolePermissions } from "../types/auth";

function Alerts() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const [newDeviceId, setNewDeviceId] = useState("");
  const [newSeverityId, setNewSeverityId] = useState("1");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ── Modal de confirmación ──────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState<string | number | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
        setPermissions(rolePermissionsMap[userData.role]);
      } catch {
        logout();
        navigate("/login");
      }
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    if (!user || !permissions) return;
    if (!permissions.canViewAlerts) {
      navigate("/dashboard");
      return;
    }
    fetchAlerts();
  }, [user, permissions]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAlerts();
      setAlerts(data);
    } catch {
      setError("No se pudieron cargar las alertas.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string | number) => {
    try {
      await resolveAlert(id);
      setAlerts((prev) =>
        prev.map((a) =>
          String(a.id) === String(id)
            ? { ...a, status: "resolved", resolved: true }
            : a
        )
      );
    } catch {
      setError("No se pudo resolver la alerta.");
    }
  };

  const handleCreate = async () => {
    if (!newDeviceId || !newMessage) {
      setCreateError("Completa todos los campos.");
      return;
    }
    try {
      setCreating(true);
      setCreateError("");
      const created = await createAlert({
        device_id: Number(newDeviceId),
        severity_id: Number(newSeverityId),
        message: newMessage,
      } as any);
      setAlerts((prev) => [created, ...prev]);
      setNewDeviceId("");
      setNewSeverityId("1");
      setNewMessage("");
    } catch {
      setCreateError("Error al crear la alerta.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isResolved = (a: Alert) =>
    String(a.status).toLowerCase() === "resolved" ||
    (a as unknown as { resolved?: boolean }).resolved === true;

  const getSeverityLabel = (a: Alert): string => {
    const s = String(a.severity || "").toUpperCase();
    return s || "INFO";
  };

  let filtered = [...alerts];
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        String(a.id).includes(q) ||
        String(a.device_id).includes(q) ||
        a.message.toLowerCase().includes(q)
    );
  }
  if (filterStatus !== "all") {
    filtered = filtered.filter((a) =>
      filterStatus === "resolved" ? isResolved(a) : !isResolved(a)
    );
  }
  if (filterSeverity !== "all") {
    filtered = filtered.filter(
      (a) => getSeverityLabel(a) === filterSeverity.toUpperCase()
    );
  }

  const total = alerts.length;
  const critical = alerts.filter((a) => getSeverityLabel(a) === "CRITICAL").length;
  const open = alerts.filter((a) => !isResolved(a)).length;
  const resolved = alerts.filter((a) => isResolved(a)).length;

  const canCreate =
    permissions?.canEdit &&
    (user?.role === "admin" || user?.role === "technician");
  const canDelete = permissions?.canDelete;

  if (!user || !permissions) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontFamily: "system-ui" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,700;0,800;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .db-root { min-height: 100vh; background: #f1f5f9; font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; }
        .db-nav { background: #0f172a; padding: 0 2rem; position: sticky; top: 0; z-index: 200; display: flex; align-items: center; justify-content: space-between; height: 60px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .db-nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .db-nav-brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .db-nav-brand-text { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 700; color: #fff; letter-spacing: -0.3px; white-space: nowrap; }
        .db-nav-links { display: flex; align-items: center; gap: 4px; list-style: none; margin: 0 auto 0 2rem; }
        .db-nav-link { color: #94a3b8; text-decoration: none; font-size: 0.875rem; font-weight: 500; padding: 6px 12px; border-radius: 6px; transition: all 0.15s; cursor: pointer; background: none; border: none; }
        .db-nav-link:hover, .db-nav-link.active { color: #fff; background: rgba(255,255,255,0.08); }
        .db-nav-right { display: flex; align-items: center; gap: 10px; }
        .db-nav-user { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px 12px; }
        .db-nav-avatar { width: 28px; height: 28px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .db-nav-username { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; }
        .db-role-pill { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; }
        .db-btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 6px 14px; border-radius: 7px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .db-btn-ghost:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .db-main { flex: 1; max-width: 1380px; width: 100%; margin: 0 auto; padding: 2rem 2rem 3rem; }
        .db-page-title { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
        .db-page-sub { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }
        .db-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.75rem; }
        .db-stat { background: #fff; border-radius: 12px; padding: 1.25rem 1.5rem; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 1rem; }
        .db-stat-icon { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
        .db-stat-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8; margin-bottom: 3px; }
        .db-stat-value { font-family: 'Fraunces', serif; font-size: 1.75rem; font-weight: 800; line-height: 1; }
        .db-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 1.25rem; }
        .db-card-head { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .db-card-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .db-card-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
        .db-card-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .db-input { padding: 7px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; color: #0f172a; background: #f8fafc; outline: none; transition: border-color 0.15s; font-family: 'DM Sans', sans-serif; min-width: 180px; }
        .db-input:focus { border-color: #3b82f6; background: #fff; }
        .db-select { padding: 7px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; color: #0f172a; background: #f8fafc; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-btn-primary { background: #3b82f6; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .db-btn-primary:hover:not(:disabled) { background: #2563eb; }
        .db-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-btn-success { background: #f0fdf4; color: #15803d; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-btn-success:hover { background: #dcfce7; }
        .db-btn-success:disabled { opacity: 0.4; cursor: not-allowed; }
        .db-btn-del { background: #fff1f2; color: #be123c; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-btn-del:hover { background: #ffe4e6; }
        .db-table-wrap { overflow-x: auto; }
        .db-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .db-table thead { background: #f8fafc; }
        .db-table th { padding: 10px 16px; text-align: left; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .db-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: middle; }
        .db-table tbody tr:last-child td { border-bottom: none; }
        .db-table tbody tr:hover td { background: #f8fafc; }
        .db-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
        .db-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; }
        .db-badge-critical { background: #fef2f2; color: #991b1b; } .db-badge-critical::before { background: #ef4444; }
        .db-badge-warning  { background: #fffbeb; color: #92400e; } .db-badge-warning::before  { background: #f59e0b; }
        .db-badge-info     { background: #eff6ff; color: #1e40af; } .db-badge-info::before     { background: #3b82f6; }
        .db-badge-open     { background: #fff1f2; color: #be123c; } .db-badge-open::before     { background: #f43f5e; }
        .db-badge-resolved { background: #f0fdf4; color: #166534; } .db-badge-resolved::before { background: #22c55e; }
        .db-mono { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #94a3b8; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; }
        .db-msg { max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #475569; font-size: 0.82rem; }
        .db-error { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; padding: 12px 16px; border-radius: 8px; margin: 1rem 1.5rem; font-size: 0.875rem; }
        .db-spinner-wrap { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.875rem; }
        .db-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
        .db-empty { text-align: center; padding: 3rem 2rem; color: #94a3b8; }
        .db-empty-icon { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5; }
        .db-empty-title { font-weight: 700; color: #475569; margin-bottom: 4px; font-size: 0.95rem; }
        .db-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9; }
        .db-form-group { display: flex; flex-direction: column; gap: 5px; }
        .db-form-label { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px; }
        .db-form-inp { padding: 7px 10px; border: 1.5px solid #e2e8f0; border-radius: 7px; font-size: 0.85rem; color: #0f172a; background: #f8fafc; outline: none; font-family: 'DM Sans', sans-serif; }
        .db-form-inp:focus { border-color: #3b82f6; background: #fff; }
        .db-form-footer { padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 8px; }
        .db-actions { display: flex; gap: 6px; }
        .db-footer { background: #0f172a; border-top: 1px solid rgba(255,255,255,0.06); padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .db-footer-brand { font-family: 'Fraunces', serif; font-size: 0.875rem; font-weight: 700; color: #e2e8f0; }
        .db-footer-text { font-size: 0.75rem; color: #475569; }
        .db-footer-links { display: flex; gap: 16px; }
        .db-footer-link { font-size: 0.75rem; color: #475569; cursor: pointer; text-decoration: none; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .db-footer-link:hover { color: #94a3b8; }

        /* ── Modal overlay ───────────────────────────────────────────────── */
        .db-modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.5);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.15s ease;
        }
        .db-modal {
          background: #fff; border-radius: 18px; padding: 2rem 2rem 1.75rem;
          width: 380px; max-width: calc(100vw - 2rem); text-align: center;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
          animation: slideUp 0.2s ease;
        }
        .db-modal-icon {
          width: 56px; height: 56px; border-radius: 50%; background: #fef2f2;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.1rem; font-size: 24px;
        }
        .db-modal-title {
          font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 800;
          color: #0f172a; margin-bottom: 8px;
        }
        .db-modal-body {
          font-size: 0.875rem; color: #64748b; line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .db-modal-actions { display: flex; gap: 10px; }
        .db-modal-cancel {
          flex: 1; padding: 10px 0; border-radius: 9px; font-size: 0.875rem;
          font-weight: 600; cursor: pointer; border: 1.5px solid #e2e8f0;
          background: #fff; color: #475569; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .db-modal-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
        .db-modal-confirm {
          flex: 1; padding: 10px 0; border-radius: 9px; font-size: 0.875rem;
          font-weight: 700; cursor: pointer; border: none;
          background: #dc2626; color: #fff; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .db-modal-confirm:hover { background: #b91c1c; }

        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── MODAL DE CONFIRMACIÓN ──────────────────────────────────────────── */}
      {confirmDelete !== null && (
        <div
          className="db-modal-overlay"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="db-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="db-modal-icon">🗑️</div>
            <div className="db-modal-title" id="modal-title">
              ¿Eliminar esta alerta?
            </div>
            <p className="db-modal-body">
              Esta acción <strong>no se puede deshacer</strong>. La alerta será
              eliminada permanentemente del sistema.
            </p>
            <div className="db-modal-actions">
              <button
                className="db-modal-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                className="db-modal-confirm"
                onClick={() => {
                  setAlerts((prev) =>
                    prev.filter((a) => String(a.id) !== String(confirmDelete))
                  );
                  setConfirmDelete(null);
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="db-nav">
        <div className="db-nav-brand">
          <div className="db-nav-brand-icon">🏥</div>
          <span className="db-nav-brand-text">Hospital San Rafael</span>
        </div>
        <ul className="db-nav-links">
          <li><button className="db-nav-link" onClick={() => navigate("/dashboard")}>Dashboard</button></li>
          {permissions.canViewAll && <li><button className="db-nav-link" onClick={() => navigate("/locations")}>Ubicaciones</button></li>}
          {permissions.canViewAll && <li><button className="db-nav-link" onClick={() => navigate("/metrics")}>Métricas</button></li>}
          {permissions.canViewAlerts && <li><button className="db-nav-link active">Alertas</button></li>}
          {permissions.canViewReports && <li><button className="db-nav-link" onClick={() => navigate("/reports")}>Reportes</button></li>}
        </ul>
        <div className="db-nav-right">
          <div className="db-nav-user">
            <div className="db-nav-avatar">{roleInfo[user.role].icon}</div>
            <div>
              <div className="db-nav-username">{user.username}</div>
              <span className="db-role-pill" style={{ backgroundColor: roleInfo[user.role].color }}>
                {roleInfo[user.role].label}
              </span>
            </div>
          </div>
          <button className="db-btn-ghost" onClick={() => navigate("/")}>← Home</button>
          <button className="db-btn-ghost" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="db-main">
        <h1 className="db-page-title">Alertas</h1>
        <p className="db-page-sub">Monitoreo de alertas del sistema hospitalario</p>

        {/* Stats */}
        <div className="db-stats">
          <div className="db-stat">
            <div className="db-stat-icon" style={{ background: "#fef2f2" }}>🚨</div>
            <div>
              <div className="db-stat-label">Total alertas</div>
              <div className="db-stat-value" style={{ color: "#ef4444" }}>{total}</div>
            </div>
          </div>
          <div className="db-stat">
            <div className="db-stat-icon" style={{ background: "#fff1f2" }}>⚠️</div>
            <div>
              <div className="db-stat-label">Críticas</div>
              <div className="db-stat-value" style={{ color: "#be123c" }}>{critical}</div>
            </div>
          </div>
          <div className="db-stat">
            <div className="db-stat-icon" style={{ background: "#fffbeb" }}>🔶</div>
            <div>
              <div className="db-stat-label">Abiertas</div>
              <div className="db-stat-value" style={{ color: "#d97706" }}>{open}</div>
            </div>
          </div>
          <div className="db-stat">
            <div className="db-stat-icon" style={{ background: "#f0fdf4" }}>✅</div>
            <div>
              <div className="db-stat-label">Resueltas</div>
              <div className="db-stat-value" style={{ color: "#15803d" }}>{resolved}</div>
            </div>
          </div>
        </div>

        {/* Formulario nueva alerta */}
        {canCreate && (
          <div className="db-card">
            <div className="db-card-head">
              <div>
                <div className="db-card-title">Nueva alerta</div>
                <div className="db-card-sub">Registrar alerta manualmente</div>
              </div>
            </div>
            <div className="db-form-row">
              <div className="db-form-group">
                <label className="db-form-label">ID Dispositivo</label>
                <input
                  className="db-form-inp"
                  type="number"
                  placeholder="Ej: 4"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Severidad</label>
                <select
                  className="db-form-inp"
                  value={newSeverityId}
                  onChange={(e) => setNewSeverityId(e.target.value)}
                >
                  <option value="1">CRITICAL</option>
                  <option value="2">WARNING</option>
                  <option value="3">INFO</option>
                </select>
              </div>
              <div className="db-form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="db-form-label">Mensaje</label>
                <input
                  className="db-form-inp"
                  type="text"
                  placeholder="Descripción de la alerta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </div>
            </div>
            {createError && (
              <div className="db-error" style={{ margin: "0 1.5rem 1rem" }}>
                ✕ {createError}
              </div>
            )}
            <div className="db-form-footer">
              <button
                className="db-btn-primary"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? "Creando..." : "+ Crear alerta"}
              </button>
            </div>
          </div>
        )}

        {/* Tabla alertas */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Listado de alertas</div>
              <div className="db-card-sub">Todas las alertas registradas en el sistema</div>
            </div>
            <div className="db-card-actions">
              <input
                className="db-input"
                type="text"
                placeholder="Buscar alerta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="db-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="open">Abierta</option>
                <option value="resolved">Resuelta</option>
              </select>
              <select className="db-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option value="all">Todas las severidades</option>
                <option value="critical">CRITICAL</option>
                <option value="warning">WARNING</option>
                <option value="info">INFO</option>
              </select>
              <button className="db-btn-primary" onClick={fetchAlerts} disabled={loading}>
                {loading ? "⟳ Cargando..." : "⟳ Actualizar"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="db-spinner-wrap">
              <div className="db-spinner" />
              <p>Cargando alertas...</p>
            </div>
          )}

          {error && <div className="db-error">✕ {error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">🔔</div>
              <div className="db-empty-title">No hay alertas</div>
              <p style={{ fontSize: "0.8rem" }}>No se encontraron alertas con los filtros aplicados.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Dispositivo</th>
                    <th>Severidad</th>
                    <th>Mensaje</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((alert) => {
                    const sev = getSeverityLabel(alert).toLowerCase();
                    const alertResolved = isResolved(alert);
                    return (
                      <tr key={alert.id}>
                        <td><span className="db-mono">{alert.id}</span></td>
                        <td><strong>Disp. #{alert.device_id}</strong></td>
                        <td>
                          <span className={`db-badge db-badge-${sev}`}>
                            {getSeverityLabel(alert)}
                          </span>
                        </td>
                        <td><span className="db-msg">{alert.message}</span></td>
                        <td>
                          <span className={`db-badge ${alertResolved ? "db-badge-resolved" : "db-badge-open"}`}>
                            {alertResolved ? "Resuelta" : "Abierta"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          {alert.created_at
                            ? new Date(alert.created_at).toLocaleString("es-CO")
                            : "—"}
                        </td>
                        <td>
                          <div className="db-actions">
                            <button
                              className="db-btn-success"
                              onClick={() => handleResolve(alert.id)}
                              disabled={alertResolved}
                              title={alertResolved ? "Ya resuelta" : "Marcar como resuelta"}
                            >
                              ✔ Resolver
                            </button>
                            {canDelete && (
                              <button
                                className="db-btn-del"
                                onClick={() => setConfirmDelete(alert.id)}
                                title="Eliminar alerta"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="db-footer">
        <div>
          <div className="db-footer-brand">🏥 Hospital San Rafael</div>
          <div className="db-footer-text">Plataforma de microservicios · Sistema de monitoreo hospitalario</div>
        </div>
        <div className="db-footer-links">
          <button className="db-footer-link" onClick={() => navigate("/dashboard")}>Dashboard</button>
          {permissions.canViewAlerts && <button className="db-footer-link" onClick={() => navigate("/alerts")}>Alertas</button>}
          {permissions.canViewReports && <button className="db-footer-link" onClick={() => navigate("/reports")}>Reportes</button>}
          <button className="db-footer-link" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </footer>
    </div>
  );
}

export default Alerts;