import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDevices, deleteDevice } from "../services/deviceService";
import { logout, getUserProfile } from "../services/authService";
import { getLocations } from "../services/locationService";
import { getAlerts } from "../services/alertService";
import type { Device } from "../types/device";
import type { User, RolePermissions } from "../types/auth";
import type { HospitalLocation } from "../types/location";
import type { Alert } from "../types/alert";
import { roleInfo, rolePermissionsMap } from "../utils/permissions";

function Dashboard() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState<Device[]>([]);
  const [locations, setLocations] = useState<HospitalLocation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
 

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
        setPermissions(rolePermissionsMap[userData.role]);
      } catch {
        logout();
        navigate("/login");
      }
    };
    loadUserProfile();
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError("");
        const devicesData = await getDevices();
        if (isMounted) setDevices(devicesData);
        try {
          const locationsData = await getLocations();
          if (isMounted) setLocations(locationsData);
        } catch {}
        if (permissions?.canViewAlerts) {
          try {
            const alertsData = await getAlerts();
            if (isMounted) setAlerts(alertsData);
          } catch {}
        }
      } catch {
        if (isMounted) setError("Error al cargar los datos. Por favor, intenta de nuevo.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (user && permissions) fetchAllData();
    return () => { isMounted = false; };
  }, [user, permissions]);

  let filteredDevices = [...devices];
  if (user?.role === "technician") {
    filteredDevices = filteredDevices.filter((d) =>
      !d.assigned_user_id || String(d.assigned_user_id) === String(user.id)
    );
  }
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filteredDevices = filteredDevices.filter((d) => {
      const name = d.name || d.nombre || "";
      return name.toLowerCase().includes(q) || String(d.id).includes(q);
    });
  }
  if (selectedStatus !== "all") {
    filteredDevices = filteredDevices.filter((d) =>
      (d.status || d.estado || "").toLowerCase() === selectedStatus.toLowerCase()
    );
  }
  if (selectedLocation !== "all") {
    filteredDevices = filteredDevices.filter(
      (d) => String(d.location_id) === String(selectedLocation)
    );
  }

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDevices();
      setDevices(data);
      if (permissions?.canViewAlerts) {
        try { setAlerts(await getAlerts()); } catch {}
      }
    } catch {
      setError("No se pudieron actualizar los dispositivos.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleDeleteDevice = async (deviceId: string | number) => {
    if (!permissions?.canDelete) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este dispositivo?")) return;
    try {
      await deleteDevice(deviceId);
      setDevices((prev) => prev.filter((d) => String(d.id) !== String(deviceId)));
    } catch {
      setError("Error al eliminar el dispositivo.");
    }
  };

  const normalizeStatusClass = (status?: string) => {
    const v = String(status || "inactive").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (v.includes("activo")) return "active";
    if (v.includes("inactivo")) return "inactive";
    if (v.includes("mantenimiento")) return "maintenance";
    return "inactive";
  };

  const getLocationName = (locationId?: string | number) => {
    if (!locationId) return "Sin ubicación";
    const loc = locations.find((l) => String(l.id) === String(locationId));
    return loc?.name || `Ubicación ${locationId}`;
  };

  const stats = [
    { label: "Dispositivos", value: filteredDevices.length, icon: "🩺", color: "#3b82f6", bg: "#eff6ff", visible: true },
    { label: "Alertas críticas", value: alerts.filter((a) => a.severity?.toLowerCase() === "critical").length, icon: "⚠️", color: "#f59e0b", bg: "#fffbeb", visible: permissions?.canViewAlerts === true },
    { label: "Activos", value: filteredDevices.filter((d) => String(d.status || d.estado || "").toLowerCase().includes("activo")).length, icon: "📊", color: "#10b981", bg: "#ecfdf5", visible: true },
    { label: "Ubicaciones", value: locations.length, icon: "📍", color: "#8b5cf6", bg: "#f5f3ff", visible: permissions?.canViewAll === true },
  ].filter((s) => s.visible);

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

        .db-root {
          min-height: 100vh;
          background: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── NAVBAR ── */
        .db-nav {
          background: #0f172a;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .db-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .db-nav-brand-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .db-nav-brand-text {
          font-family: 'Fraunces', serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
          white-space: nowrap;
        }

        .db-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0 auto 0 2rem;
        }

        .db-nav-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.15s;
          cursor: pointer;
          background: none;
          border: none;
        }

        .db-nav-link:hover, .db-nav-link.active {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        .db-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .db-nav-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 6px 12px;
        }

        .db-nav-avatar {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .db-nav-username {
          font-size: 0.8rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .db-role-pill {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #fff;
        }

        .db-btn-ghost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1;
          padding: 6px 14px;
          border-radius: 7px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .db-btn-ghost:hover { background: rgba(255,255,255,0.12); color: #fff; }

        /* ── MAIN ── */
        .db-main {
          flex: 1;
          max-width: 1380px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem 2rem 3rem;
        }

        /* ── PAGE HEADER ── */
        .db-page-header {
          margin-bottom: 2rem;
        }

        .db-page-title {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .db-page-sub {
          color: #64748b;
          font-size: 0.9rem;
        }

        /* ── STATS ── */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .db-stat {
          background: #fff;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: box-shadow 0.2s, transform 0.2s;
        }

        .db-stat:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }

        .db-stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }

        .db-stat-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        .db-stat-value {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1;
        }

        /* ── CARD ── */
        .db-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .db-card-head {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .db-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .db-card-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .db-card-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .db-input {
          padding: 7px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.15s;
          font-family: 'DM Sans', sans-serif;
          min-width: 180px;
        }

        .db-input:focus { border-color: #3b82f6; background: #fff; }

        .db-select {
          padding: 7px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s;
        }

        .db-select:focus { border-color: #3b82f6; }

        .db-btn-primary {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .db-btn-primary:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
        .db-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── TABLE ── */
        .db-table-wrap { overflow-x: auto; }

        .db-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .db-table thead { background: #f8fafc; }

        .db-table th {
          padding: 10px 16px;
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        .db-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          vertical-align: middle;
        }

        .db-table tbody tr:last-child td { border-bottom: none; }
        .db-table tbody tr:hover td { background: #f8fafc; }

        .db-device-name { font-weight: 600; color: #1e293b; }

        .db-device-id {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: #94a3b8;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }

        .db-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .db-badge::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .db-badge-active { background: #dcfce7; color: #166534; }
        .db-badge-active::before { background: #22c55e; }
        .db-badge-inactive { background: #fee2e2; color: #991b1b; }
        .db-badge-inactive::before { background: #ef4444; }
        .db-badge-maintenance { background: #fef9c3; color: #854d0e; }
        .db-badge-maintenance::before { background: #eab308; }

        .db-loc-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: #475569;
        }

        .db-action-btns { display: flex; gap: 6px; }

        .db-btn-edit {
          background: #eff6ff;
          color: #1d4ed8;
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .db-btn-edit:hover { background: #dbeafe; }

        .db-btn-del {
          background: #fff1f2;
          color: #be123c;
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .db-btn-del:hover { background: #ffe4e6; }

        /* ── STATES ── */
        .db-empty {
          text-align: center;
          padding: 3rem 2rem;
          color: #94a3b8;
        }

        .db-empty-icon { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5; }
        .db-empty-title { font-weight: 700; color: #475569; margin-bottom: 4px; font-size: 0.95rem; }

        .db-error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 1rem 1.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .db-spinner-wrap { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.875rem; }

        .db-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── FOOTER ── */
        .db-footer {
          background: #0f172a;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 1.25rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .db-footer-brand {
          font-family: 'Fraunces', serif;
          font-size: 0.875rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        .db-footer-text {
          font-size: 0.75rem;
          color: #475569;
        }

        .db-footer-links {
          display: flex;
          gap: 16px;
        }

        .db-footer-link {
          font-size: 0.75rem;
          color: #475569;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.15s;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }

        .db-footer-link:hover { color: #94a3b8; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .db-nav-links { display: none; }
          .db-main { padding: 1.25rem 1rem 2rem; }
          .db-card-head { flex-direction: column; align-items: stretch; }
          .db-card-actions { flex-direction: column; }
          .db-input, .db-select, .db-btn-primary { width: 100%; }
          .db-stats { grid-template-columns: 1fr 1fr; }
          .db-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="db-nav">
        <div className="db-nav-brand">
          <div className="db-nav-brand-icon">🏥</div>
          <span className="db-nav-brand-text">Hospital San Rafael</span>
        </div>

        <ul className="db-nav-links">
          <li>
            <button className="db-nav-link active" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          </li>
          {permissions.canViewAll && (
            <li>
              <button className="db-nav-link" onClick={() => navigate("/locations")}>
                Ubicaciones
              </button>
            </li>
          )}
          {permissions.canViewAll && (
            <li>
               <button className="db-nav-link" onClick={() => navigate("/metrics")}>
                 Métricas
               </button>
            </li>
)}
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

      {/* ── MAIN ── */}
      <main className="db-main">
        <div className="db-page-header">
          <h1 className="db-page-title">Dashboard</h1>
          <p className="db-page-sub">
            Panel de monitoreo de dispositivos médicos
            {user.role === "technician" && " · Dispositivos asignados"}
          </p>
        </div>

        {/* Stats */}
        <div className="db-stats">
          {stats.map((s) => (
            <div className="db-stat" key={s.label}>
              <div className="db-stat-icon" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div>
                <div className="db-stat-label">{s.label}</div>
                <div className="db-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Devices card */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Dispositivos registrados</div>
              <div className="db-card-sub">
                {user.role === "technician" ? "Dispositivos asignados a tu usuario" : "Listado de dispositivos del sistema"}
              </div>
            </div>

            <div className="db-card-actions">
              {permissions.canViewAll && (
                <>
                  <input
                    type="text"
                    className="db-input"
                    placeholder="Buscar dispositivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select className="db-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="all">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                  {locations.length > 0 && (
                    <select className="db-select" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                      <option value="all">Todas las ubicaciones</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  )}
                </>
              )}
              <button className="db-btn-primary" onClick={handleRefresh} disabled={loading}>
                {loading ? "⟳ Cargando..." : "⟳ Actualizar"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="db-spinner-wrap">
              <div className="db-spinner" />
              <p>Cargando dispositivos...</p>
            </div>
          )}

          {error && <div className="db-error">✕ {error}</div>}

          {!loading && !error && filteredDevices.length === 0 && devices.length === 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">📭</div>
              <div className="db-empty-title">No hay dispositivos</div>
              <p style={{ fontSize: "0.8rem" }}>Cuando existan dispositivos, aparecerán aquí.</p>
            </div>
          )}

          {!loading && !error && filteredDevices.length === 0 && devices.length > 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">🔍</div>
              <div className="db-empty-title">Sin resultados</div>
              <p style={{ fontSize: "0.8rem" }}>Intenta con otros términos o filtros.</p>
            </div>
          )}

          {!loading && !error && filteredDevices.length > 0 && (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Ubicación</th>
                    {permissions.canEdit && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => {
                    const status = device.status || device.estado;
                    const statusClass = normalizeStatusClass(status);
                    return (
                      <tr key={device.id}>
                        <td><span className="db-device-id">{device.id}</span></td>
                        <td><span className="db-device-name">{device.name || device.nombre || "Sin nombre"}</span></td>
                        <td>
                          <span className={`db-badge db-badge-${statusClass}`}>
                            {status || "Sin estado"}
                          </span>
                        </td>
                        <td>
                          <span className="db-loc-tag">
                            📍 {getLocationName(device.location_id)}
                          </span>
                        </td>
                        {permissions.canEdit && (
                          <td>
                            <div className="db-action-btns">
                              <button className="db-btn-edit" onClick={() => alert(`Editar dispositivo ${device.id}`)}>
                                ✏️ Editar
                              </button>
                              {permissions.canDelete && (
                                <button className="db-btn-del" onClick={() => handleDeleteDevice(device.id)}>
                                  🗑️ Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="db-footer">
        <div>
          <div className="db-footer-brand">🏥 Hospital San Rafael</div>
          <div className="db-footer-text">Plataforma de microservicios · Sistema de monitoreo hospitalario</div>
        </div>

        <div className="db-footer-links">
          <button className="db-footer-link" onClick={() => navigate("/dashboard")}>Dashboard</button>
          {permissions.canViewAll && (
            <button className="db-footer-link" onClick={() => navigate("/locations")}>Ubicaciones</button>
          )}
          {permissions.canViewAll && (
            <button className="db-footer-link" onClick={() => navigate("/metrics")}>Métricas</button>
          )}
          <button className="db-footer-link" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;