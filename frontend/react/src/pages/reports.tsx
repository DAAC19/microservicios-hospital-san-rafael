import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports, generateReport, downloadReport } from "../services/reportsService";
import { logout, getUserProfile } from "../services/authService";
import { roleInfo, rolePermissionsMap } from "../utils/permissions";
import type { Report } from "../types/report";
import type { User, RolePermissions } from "../types/auth";

const REPORT_TYPES = [
  { value: "general", label: "General del sistema" },
  { value: "alerts", label: "Alertas" },
  { value: "metrics", label: "Métricas por dispositivo" },
  { value: "devices", label: "Dispositivos" },
  { value: "last_24h", label: "Últimas 24 horas" },
];

const typeColor: Record<string, { bg: string; color: string; icon: string }> = {
  alerts:   { bg: "#fef2f2", color: "#991b1b", icon: "🚨" },
  metrics:  { bg: "#eff6ff", color: "#1e40af", icon: "📈" },
  devices:  { bg: "#f0fdf4", color: "#166534", icon: "🖥️" },
  general:  { bg: "#f5f3ff", color: "#5b21b6", icon: "📊" },
  last_24h: { bg: "#fffbeb", color: "#92400e", icon: "⏱️" },
};

const typeBadgeClass: Record<string, string> = {
  alerts:   "db-badge-rtype-alerts",
  metrics:  "db-badge-rtype-metrics",
  devices:  "db-badge-rtype-devices",
  general:  "db-badge-rtype-general",
  last_24h: "db-badge-rtype-24h",
};

function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [genType, setGenType] = useState("general");
  const [genFrom, setGenFrom] = useState("");
  const [genTo, setGenTo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genSuccess, setGenSuccess] = useState("");

  const [downloading, setDownloading] = useState<string | null>(null);

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
    if (!permissions.canViewReports) {
      navigate("/dashboard");
      return;
    }
    fetchReports();
  }, [user, permissions]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getReports();
      setReports(data);
    } catch {
      setError("No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setGenError("");
      setGenSuccess("");
      const created = await generateReport({
        type: genType,
        title: REPORT_TYPES.find((t) => t.value === genType)?.label ?? genType,
        description: genFrom && genTo ? `Desde ${genFrom} hasta ${genTo}` : undefined,
      });
      setReports((prev) => [created, ...prev]);
      setGenSuccess("✅ Reporte generado correctamente.");
    } catch {
      setGenError("Error al generar el reporte. Intenta de nuevo.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id: string | number, title: string) => {
    try {
      setDownloading(String(id));
      const blob = await downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${title.replace(/\s+/g, "_").toLowerCase()}_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(`No se pudo descargar el reporte #${id}.`);
    } finally {
      setDownloading(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  let filtered = [...reports];
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        String(r.id).includes(q) ||
        String(r.type).toLowerCase().includes(q)
    );
  }
  if (filterType !== "all") {
    filtered = filtered.filter((r) => r.type === filterType);
  }

  const getTypeStyle = (type: string) =>
    typeColor[type] ?? { bg: "#f1f5f9", color: "#475569", icon: "📋" };

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
        .db-nav-brand { display: flex; align-items: center; gap: 10px; }
        .db-nav-brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .db-nav-brand-text { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
        .db-nav-links { display: flex; align-items: center; gap: 4px; list-style: none; margin: 0 auto 0 2rem; }
        .db-nav-link { color: #94a3b8; font-size: 0.875rem; font-weight: 500; padding: 6px 12px; border-radius: 6px; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .db-nav-link:hover, .db-nav-link.active { color: #fff; background: rgba(255,255,255,0.08); }
        .db-nav-right { display: flex; align-items: center; gap: 10px; }
        .db-nav-user { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px 12px; }
        .db-nav-avatar { width: 28px; height: 28px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .db-nav-username { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; }
        .db-role-pill { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; }
        .db-btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 6px 14px; border-radius: 7px; font-size: 0.8rem; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
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
        .db-input { padding: 7px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; color: #0f172a; background: #f8fafc; outline: none; font-family: 'DM Sans', sans-serif; min-width: 180px; }
        .db-input:focus { border-color: #3b82f6; background: #fff; }
        .db-select { padding: 7px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; color: #0f172a; background: #f8fafc; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-btn-primary { background: #3b82f6; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .db-btn-primary:hover:not(:disabled) { background: #2563eb; }
        .db-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-btn-outline { background: #f8fafc; color: #1d4ed8; border: 1.5px solid #bfdbfe; padding: 5px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-btn-outline:hover { background: #eff6ff; }
        .db-generate-row { padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .db-gen-label { font-size: 0.82rem; font-weight: 600; color: #475569; white-space: nowrap; }
        .db-rpt-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
        .db-rpt-item:last-child { border-bottom: none; }
        .db-rpt-item:hover { background: #f8fafc; }
        .db-rpt-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
        .db-rpt-info { flex: 1; margin: 0 14px; }
        .db-rpt-title { font-weight: 600; font-size: 0.9rem; color: #1e293b; margin-bottom: 3px; }
        .db-rpt-meta { font-size: 0.75rem; color: #94a3b8; }
        .db-rpt-actions { display: flex; gap: 8px; }
        .db-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
        .db-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; }
        .db-badge-rtype-alerts  { background: #fef2f2; color: #991b1b; } .db-badge-rtype-alerts::before  { background: #ef4444; }
        .db-badge-rtype-metrics { background: #eff6ff; color: #1e40af; } .db-badge-rtype-metrics::before { background: #3b82f6; }
        .db-badge-rtype-devices { background: #f0fdf4; color: #166534; } .db-badge-rtype-devices::before { background: #22c55e; }
        .db-badge-rtype-general { background: #f5f3ff; color: #5b21b6; } .db-badge-rtype-general::before { background: #8b5cf6; }
        .db-badge-rtype-24h     { background: #fffbeb; color: #92400e; } .db-badge-rtype-24h::before     { background: #f59e0b; }
        .db-mono { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #94a3b8; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; }
        .db-error { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; padding: 12px 16px; border-radius: 8px; margin: 1rem 1.5rem; font-size: 0.875rem; }
        .db-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 12px 16px; border-radius: 8px; margin: 0 1.5rem 1rem; font-size: 0.875rem; }
        .db-spinner-wrap { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.875rem; }
        .db-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
        .db-empty { text-align: center; padding: 3rem 2rem; color: #94a3b8; }
        .db-empty-icon { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5; }
        .db-empty-title { font-weight: 700; color: #475569; margin-bottom: 4px; font-size: 0.95rem; }
        .db-footer { background: #0f172a; border-top: 1px solid rgba(255,255,255,0.06); padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .db-footer-brand { font-family: 'Fraunces', serif; font-size: 0.875rem; font-weight: 700; color: #e2e8f0; }
        .db-footer-text { font-size: 0.75rem; color: #475569; }
        .db-footer-links { display: flex; gap: 16px; }
        .db-footer-link { font-size: 0.75rem; color: #475569; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .db-footer-link:hover { color: #94a3b8; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

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
          {permissions.canViewAlerts && <li><button className="db-nav-link" onClick={() => navigate("/alerts")}>Alertas</button></li>}
          {permissions.canViewReports && <li><button className="db-nav-link active">Reportes</button></li>}
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
        <h1 className="db-page-title">Reportes</h1>
        <p className="db-page-sub">Generación y descarga de reportes del sistema</p>

        {/* Stats */}
        <div className="db-stats">
          <div className="db-stat">
            <div className="db-stat-icon" style={{ background: "#f5f3ff" }}>📊</div>
            <div>
              <div className="db-stat-label">Total reportes</div>
              <div className="db-stat-value" style={{ color: "#7c3aed" }}>{reports.length}</div>
            </div>
          </div>
          <div className="db-stat">
            <div className="db-stat-icon" style={{ background: "#fef2f2" }}>🚨</div>
            <div>
              <div className="db-stat-label">De alertas</div>
              <div className="db-stat-value" style={{ color: "#be123c" }}>
                {reports.filter((r) => r.type === "alerts").length}
              </div>
            </div>
          </div>
          <div className="db-stat">
            <div className="db-stat-icon" style={{ background: "#eff6ff" }}>📈</div>
            <div>
              <div className="db-stat-label">De métricas</div>
              <div className="db-stat-value" style={{ color: "#1d4ed8" }}>
                {reports.filter((r) => r.type === "metrics").length}
              </div>
            </div>
          </div>
          <div className="db-stat">
            <div className="db-stat-icon" style={{ background: "#f0fdf4" }}>🖥️</div>
            <div>
              <div className="db-stat-label">De dispositivos</div>
              <div className="db-stat-value" style={{ color: "#15803d" }}>
                {reports.filter((r) => r.type === "devices").length}
              </div>
            </div>
          </div>
        </div>

        {/* Generar reporte */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Generar reporte</div>
              <div className="db-card-sub">Exportar datos del sistema por tipo</div>
            </div>
          </div>
          <div className="db-generate-row">
            <span className="db-gen-label">Tipo:</span>
            <select className="db-select" value={genType} onChange={(e) => setGenType(e.target.value)}>
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <span className="db-gen-label">Desde:</span>
            <input className="db-input" type="date" value={genFrom} onChange={(e) => setGenFrom(e.target.value)} style={{ minWidth: 140 }} />
            <span className="db-gen-label">Hasta:</span>
            <input className="db-input" type="date" value={genTo} onChange={(e) => setGenTo(e.target.value)} style={{ minWidth: 140 }} />
            <button className="db-btn-primary" style={{ marginLeft: "auto" }} onClick={handleGenerate} disabled={generating}>
              {generating ? "Generando..." : "📥 Generar y descargar"}
            </button>
          </div>
          {genError && <div className="db-error" style={{ margin: "0 1.5rem 1rem" }}>✕ {genError}</div>}
          {genSuccess && <div className="db-success">{genSuccess}</div>}
        </div>

        {/* Historial de reportes */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Historial de reportes</div>
              <div className="db-card-sub">Reportes generados anteriormente</div>
            </div>
            <div className="db-card-actions">
              <input
                className="db-input"
                type="text"
                placeholder="Buscar reporte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="db-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">Todos los tipos</option>
                {REPORT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button className="db-btn-primary" onClick={fetchReports} disabled={loading}>
                {loading ? "⟳ Cargando..." : "⟳ Actualizar"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="db-spinner-wrap">
              <div className="db-spinner" />
              <p>Cargando reportes...</p>
            </div>
          )}

          {error && <div className="db-error">✕ {error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">📋</div>
              <div className="db-empty-title">No hay reportes</div>
              <p style={{ fontSize: "0.8rem" }}>Genera tu primer reporte usando el panel de arriba.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 &&
            filtered.map((report) => {
              const ts = getTypeStyle(report.type);
              const badgeClass = typeBadgeClass[report.type] ?? "db-badge-rtype-general";
              const typeLabel = REPORT_TYPES.find((t) => t.value === report.type)?.label ?? report.type;
              return (
                <div className="db-rpt-item" key={report.id}>
                  <div className="db-rpt-icon" style={{ background: ts.bg }}>{ts.icon}</div>
                  <div className="db-rpt-info">
                    <div className="db-rpt-title">{report.title}</div>
                    <div className="db-rpt-meta">
                      <span className="db-mono">#{report.id}</span>
                      {" · "}
                      <span className={`db-badge ${badgeClass}`} style={{ fontSize: "0.65rem" }}>
                        {typeLabel}
                      </span>
                      {report.created_at && (
                        <> · {new Date(report.created_at).toLocaleString("es-CO")}</>
                      )}
                      {report.description && <> · {report.description}</>}
                    </div>
                  </div>
                  <div className="db-rpt-actions">
                    <button
                      className="db-btn-outline"
                      onClick={() => alert(`Vista previa del reporte #${report.id} no disponible en este entorno.`)}
                    >
                      👁️ Ver
                    </button>
                    <button
                      className="db-btn-primary"
                      onClick={() => handleDownload(report.id, report.title)}
                      disabled={downloading === String(report.id)}
                    >
                      {downloading === String(report.id) ? "Descargando..." : "📥 Descargar"}
                    </button>
                  </div>
                </div>
              );
            })
          }
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

export default Reports;