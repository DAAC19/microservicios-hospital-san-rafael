import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports } from "../services/reportsService";
import { logout, getUserProfile } from "../services/authService";
import { rolePermissionsMap } from "../utils/permissions";
import type { User, RolePermissions } from "../types/auth";
import Navbar from "../components/Navbar";
import LogoutModal from "../components/LogoutModal";


const REPORT_TYPES = [
  { value: "general", label: "General del sistema", icon: "📊", color: "#5b21b6", bg: "#f5f3ff" },
  { value: "alerts", label: "Alertas", icon: "🚨", color: "#991b1b", bg: "#fef2f2" },
  { value: "metrics", label: "Métricas por dispositivo", icon: "📈", color: "#1e40af", bg: "#eff6ff" },
  { value: "devices", label: "Dispositivos", icon: "🖥️", color: "#166534", bg: "#f0fdf4" },
  { value: "last_24h", label: "Últimas 24 horas", icon: "⏱️", color: "#92400e", bg: "#fffbeb" },
];

// Filtros que aparecen según el tipo seleccionado
const FILTERS_BY_TYPE: Record<string, { key: string; label: string; type: "select" | "date" | "text"; options?: { value: string; label: string }[] }[]> = {
  general: [
    { key: "date_from", label: "Desde", type: "date" },
    { key: "date_to", label: "Hasta", type: "date" },
  ],
  alerts: [
    {
      key: "severity", label: "Severidad", type: "select", options: [
        { value: "", label: "Todas" },
        { value: "CRITICAL", label: "CRITICAL" },
        { value: "WARNING", label: "WARNING" },
        { value: "INFO", label: "INFO" },
      ]
    },
    {
      key: "status", label: "Estado", type: "select", options: [
        { value: "", label: "Todos" },
        { value: "open", label: "Abierta" },
        { value: "resolved", label: "Resuelta" },
      ]
    },
    { key: "date_from", label: "Desde", type: "date" },
    { key: "date_to", label: "Hasta", type: "date" },
  ],
  metrics: [
    { key: "device_id", label: "ID Dispositivo", type: "text" },
    {
      key: "metric", label: "Métrica", type: "select", options: [
        { value: "", label: "Todas" },
        { value: "temperature", label: "Temperatura" },
        { value: "pressure", label: "Presión" },
        { value: "humidity", label: "Humedad" },
        { value: "heartrate", label: "Ritmo cardíaco" },
      ]
    },
    { key: "date_from", label: "Desde", type: "date" },
    { key: "date_to", label: "Hasta", type: "date" },
  ],
  devices: [
    { key: "date_from", label: "Desde", type: "date" },
    { key: "date_to", label: "Hasta", type: "date" },
  ],
  last_24h: [],
};

// ── Helpers para renderizar la vista previa ───────────────────────────────────
function isArray(v: unknown): v is unknown[] { return Array.isArray(v); }
function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function flattenForTable(arr: unknown[]): { keys: string[]; rows: Record<string, string>[] } {
  const keys = Array.from(new Set(arr.flatMap((item) => isObject(item) ? Object.keys(item) : [])));
  const rows = arr.map((item) => {
    if (!isObject(item)) return { value: String(item) };
    const row: Record<string, string> = {};
    keys.forEach((k) => { row[k] = String(item[k] ?? "—"); });
    return row;
  });
  return { keys, rows };
}

// ── Generador de PDF en el cliente usando jsPDF (CDN) ────────────────────────
async function generatePDF(
  typeLabel: string,
  typeIcon: string,
  filters: Record<string, string>,
  data: Record<string, unknown>,
  username: string
) {
  // Carga dinámica de jsPDF desde CDN (evita instalar dependencia)
  if (!(window as any).jspdf) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("No se pudo cargar jsPDF"));
      document.head.appendChild(s);
    });
  }

  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; // A4 width mm
  const margin = 18;
  let y = 0;

  // ── Encabezado azul oscuro ──────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, W, 42, "F");

  // Logo / nombre hospital
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Hospital San Rafael", margin, 17);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Plataforma de microservicios · Sistema de monitoreo hospitalario", margin, 24);

  // Título del reporte
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Reporte: ${typeLabel}`, margin, 35);

  y = 52;

  // ── Metadatos del reporte ───────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500

  const now = new Date().toLocaleString("es-CO");
  const metaItems = [
    ["Generado", now],
    ["Usuario", username],
    ["Tipo", typeLabel],
    ...Object.entries(filters).filter(([, v]) => v).map(([k, v]) => [k, v]),
  ];

  const colW = (W - margin * 2) / Math.min(metaItems.length, 4);
  metaItems.slice(0, 4).forEach(([label, value], i) => {
    const x = margin + 6 + i * colW;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(label, x, y + 10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(String(value).substring(0, 22), x, y + 18);
    doc.setFontSize(8);
  });

  y += 36;

  // ── Línea separadora ────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 8;

  // ── Contenido dinámico ──────────────────────────────────────────────────────
  function addSectionTitle(title: string) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, y);
    y += 2;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + doc.getTextWidth(title), y);
    doc.setLineWidth(0.3);
    y += 7;
  }

  function addTable(keys: string[], rows: Record<string, string>[]) {
    if (keys.length === 0 || rows.length === 0) return;
    const maxCols = Math.min(keys.length, 6);
    const usedKeys = keys.slice(0, maxCols);
    const colWidth = (W - margin * 2) / maxCols;
    const rowH = 7;
    const headerH = 9;

    // Encabezado tabla
    doc.setFillColor(30, 64, 175); // blue-800
    doc.rect(margin, y, W - margin * 2, headerH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    usedKeys.forEach((k, i) => {
      doc.text(k.toUpperCase().replace(/_/g, " "), margin + 3 + i * colWidth, y + 6);
    });
    y += headerH;

    // Filas
    rows.forEach((row, ri) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const bg = ri % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(margin, y, W - margin * 2, rowH, "F");
      doc.setDrawColor(241, 245, 249);
      doc.rect(margin, y, W - margin * 2, rowH, "S");
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      usedKeys.forEach((k, i) => {
        const val = String(row[k] ?? "—").substring(0, 24);
        doc.text(val, margin + 3 + i * colWidth, y + 5);
      });
      y += rowH;
    });
    y += 6;
  }

  function addKeyValue(obj: Record<string, unknown>, depth = 0) {
    Object.entries(obj).forEach(([key, val]) => {
      if (y > 270) { doc.addPage(); y = 20; }
      if (
        isArray(val) &&
        val.length > 0 &&
        isObject(val[0]) &&
        key !== "by_severity" &&
        key !== "by_status"
      ) {
        addSectionTitle(key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
        const { keys, rows } = flattenForTable(val);
        addTable(keys, rows);
      } else if (isObject(val)) {
        addSectionTitle(key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
        addKeyValue(val, depth + 1);
      } else if (isArray(val)) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(key + ":", margin + depth * 4, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(val.join(", ").substring(0, 80), margin + depth * 4 + 30, y);
        y += 6;
      } else {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) + ":";
        doc.text(label, margin + depth * 4, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(String(val ?? "—").substring(0, 100), margin + depth * 4 + 44, y);
        y += 6;
      }
    });
  }

  // Primero intentamos buscar arrays de primer nivel para tablas principales
  const topArrays = Object.entries(data).filter(([, v]) => isArray(v) && (v as unknown[]).length > 0 && isObject((v as unknown[])[0]));
  const topObjects = Object.entries(data).filter(([, v]) => isObject(v));
  const topPrimitives = Object.entries(data).filter(([, v]) => !isArray(v) && !isObject(v));

  // Primitivos (totales, conteos)
  if (topPrimitives.length > 0) {
    addSectionTitle("Resumen");
    const statsPerRow = Math.min(topPrimitives.length, 4);
    const statW = (W - margin * 2) / statsPerRow;
    topPrimitives.slice(0, 4).forEach(([k, v], i) => {
      const x = margin + i * statW;
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(x, y, statW - 3, 20, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 64, 175);
      doc.text(k.replace(/_/g, " ").toUpperCase(), x + 3, y + 7);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(String(v), x + 3, y + 17);
    });
    y += 27;
  }

  // Objetos simples (ej: summary, stats anidados)
  topObjects.forEach(([k, v]) => {
    addSectionTitle(k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
    addKeyValue(v as Record<string, unknown>, 0);
  });

  // Arrays como tablas
  topArrays.forEach(([k, v]) => {
    addSectionTitle(k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
    const { keys, rows } = flattenForTable(v as unknown[]);
    addTable(keys, rows);
  });

  // ── Pie de página en todas las páginas ─────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 287, W, 10, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Hospital San Rafael · Documento confidencial", margin, 293);
    doc.text(`Página ${p} de ${totalPages}`, W - margin - 18, 293);
  }

  doc.save(`reporte_${typeLabel.toLowerCase().replace(/ /g, "_")}_${Date.now()}.pdf`);
}

// ── Componente principal ──────────────────────────────────────────────────────
function Reports() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [genType, setGenType] = useState("general");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentType = REPORT_TYPES.find(t => t.value === genType)!;
  const currentFilters = FILTERS_BY_TYPE[genType] ?? [];

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
    if (!permissions.canViewReports) navigate("/dashboard");
  }, [user, permissions, navigate]);

  const handleTypeChange = (t: string) => {
    setGenType(t);
    setFilters({});
    setReportData(null);
    setError("");
    setSuccess("");
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const buildQuery = () => {
    const params = new URLSearchParams({ type: genType });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return params.toString();
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setReportData(null);
      const data = await getReports(buildQuery());
      setReportData(data as Record<string, unknown>);
      setSuccess("Reporte generado correctamente.");
    } catch {
      setError("Error al generar el reporte. Verifica que el servicio esté activo.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData || !user) return;
    try {
      setExporting(true);
      setError("");
      await generatePDF(currentType.label, currentType.icon, filters, reportData, user.username);
    } catch (e) {
      setError("Error al generar el PDF. Intenta de nuevo.");
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

 const [showLogoutModal, setShowLogoutModal] = useState(false);
const handleLogout = () => { setShowLogoutModal(true); };
  // ── Vista previa de datos ─────────────────────────────────────────────────
  const renderPreview = (data: Record<string, unknown>) => {
    const entries = Object.entries(data).filter(
      ([key]) => key !== "alerts" && key !== "devices"
    );
    return (
      <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: 20 }}>
        {entries.map(([key, val]) => {
          const title = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

          // Array de objetos → tabla
          if (isArray(val) && val.length > 0 && isObject(val[0])) {
            const { keys, rows } = flattenForTable(val as unknown[]);
            const maxCols = Math.min(keys.length, 7);
            return (
              <div key={key}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
                  {title} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({rows.length})</span>
                </div>
                <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                    <thead>
                      <tr style={{ background: "#1e40af" }}>
                        {keys.slice(0, maxCols).map(k => (
                          <th key={k} style={{ padding: "8px 12px", textAlign: "left", color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                            {k.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 50).map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          {keys.slice(0, maxCols).map(k => (
                            <td key={k} style={{ padding: "8px 12px", color: "#1e293b", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                              {renderCell(k, row[k])}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {rows.length > 50 && (
                        <tr><td colSpan={maxCols} style={{ padding: "8px 12px", color: "#94a3b8", fontSize: "0.75rem", textAlign: "center" }}>
                          ... y {rows.length - 50} registros más en el PDF
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          // Array primitivo
          if (isArray(val)) {
            return (
              <div key={key}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>{title}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(val as unknown[]).map((v, i) => (
                    <span key={i} style={{ background: "#f1f5f9", borderRadius: 6, padding: "3px 10px", fontSize: "0.78rem", color: "#475569" }}>{String(v)}</span>
                  ))}
                </div>
              </div>
            );
          }

          // Objeto anidado → tarjetas stat o key-value
          if (isObject(val)) {
            const subEntries = Object.entries(val);
            const allPrimitive = subEntries.every(([, v]) => !isObject(v) && !isArray(v));
            if (allPrimitive) {
              return (
                <div key={key}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>{title}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                    {subEntries.map(([k, v]) => (
                      <div key={k} style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 14px", border: "1px solid #bfdbfe" }}>
                        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                          {k.replace(/_/g, " ")}
                        </div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>{String(v)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            // Objeto complejo → recursivo simplificado
            return (
              <div key={key}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>{title}</div>
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                  {subEntries.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: "0.82rem" }}>
                      <span style={{ color: "#64748b", fontWeight: 600, minWidth: 140 }}>{k.replace(/_/g, " ")}:</span>
                      <span style={{ color: "#0f172a" }}>{isObject(v) || isArray(v) ? JSON.stringify(v).substring(0, 80) : String(v ?? "—")}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // Primitivo simple → stat card
          return (
            <div key={key} style={{ display: "inline-flex", flexDirection: "column", background: "#eff6ff", borderRadius: 10, padding: "12px 20px", border: "1px solid #bfdbfe", alignSelf: "flex-start" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{String(val)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCell = (key: string, val: string) => {
    const lk = key.toLowerCase();
    if (lk === "status" || lk === "estado") {
      const isRes = val.toLowerCase().includes("resolv") || val.toLowerCase() === "resolved";
      return (
        <span style={{ background: isRes ? "#f0fdf4" : "#fff1f2", color: isRes ? "#166534" : "#be123c", borderRadius: 20, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
          {val}
        </span>
      );
    }
    if (lk === "severity" || lk === "severidad") {
      const colors: Record<string, [string, string]> = {
        CRITICAL: ["#fef2f2", "#991b1b"],
        WARNING: ["#fffbeb", "#92400e"],
        INFO: ["#eff6ff", "#1e40af"],
      };
      const [bg, color] = colors[val?.toUpperCase()] ?? ["#f1f5f9", "#475569"];
      return <span style={{ background: bg, color, borderRadius: 20, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700 }}>{val}</span>;
    }
    return val;
  };

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
        .db-nav-brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .db-nav-brand-text { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
        .db-nav-links { display: flex; align-items: center; gap: 4px; list-style: none; margin: 0 auto 0 2rem; }
        .db-nav-link { color: #94a3b8; font-size: 0.875rem; font-weight: 500; padding: 6px 12px; border-radius: 6px; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .db-nav-link:hover, .db-nav-link.active { color: #fff; background: rgba(255,255,255,0.08); }
        .db-nav-right { display: flex; align-items: center; gap: 10px; }
        .db-nav-user { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px 12px; }
        .db-nav-avatar { width: 28px; height: 28px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .db-nav-username { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; }
        .db-role-pill { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; }
        .db-btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 6px 14px; border-radius: 7px; font-size: 0.8rem; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-btn-ghost:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .db-main { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 2rem 3rem; }
        .db-page-title { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
        .db-page-sub { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }
        .db-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 1.25rem; }
        .db-card-head { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .db-card-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .db-card-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
        .db-types-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; padding: 1.25rem 1.5rem; }
        .db-type-card { border: 2px solid #e2e8f0; border-radius: 10px; padding: 1rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 10px; }
        .db-type-card:hover { border-color: #3b82f6; background: #eff6ff; }
        .db-type-card.selected { border-color: #3b82f6; background: #eff6ff; }
        .db-type-label { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
        .db-filters-row { display: flex; flex-wrap: wrap; gap: 12px; padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; align-items: flex-end; }
        .db-filter-group { display: flex; flex-direction: column; gap: 4px; }
        .db-filter-label { font-size: 0.72rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
        .db-filter-inp { padding: 7px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.84rem; color: #0f172a; background: #fff; outline: none; font-family: 'DM Sans', sans-serif; min-width: 140px; }
        .db-filter-inp:focus { border-color: #3b82f6; }
        .db-actions-row { display: flex; gap: 10px; padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; align-items: center; flex-wrap: wrap; }
        .db-selected-label { font-size: 0.82rem; color: #64748b; }
        .db-selected-type { font-weight: 700; font-size: 0.9rem; }
        .db-btn-primary { background: #3b82f6; color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; transition: background 0.15s; }
        .db-btn-primary:hover:not(:disabled) { background: #2563eb; }
        .db-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-btn-pdf { background: #dc2626; color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; transition: background 0.15s; display: flex; align-items: center; gap: 7px; }
        .db-btn-pdf:hover:not(:disabled) { background: #b91c1c; }
        .db-btn-pdf:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-error { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; padding: 12px 16px; border-radius: 8px; margin: 0 1.5rem 1rem; font-size: 0.875rem; }
        .db-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 10px 16px; border-radius: 8px; margin: 0 1.5rem 0; font-size: 0.84rem; display: flex; align-items: center; gap: 6px; }
        .db-spinner-wrap { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.875rem; }
        .db-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
        .db-result-head { display: flex; align-items: center; gap: 14px; padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .db-result-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
        .db-result-title { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
        .db-result-sub { font-size: 0.76rem; color: #94a3b8; margin-top: 2px; }
        .db-footer { background: #0f172a; border-top: 1px solid rgba(255,255,255,0.06); padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .db-footer-brand { font-family: 'Fraunces', serif; font-size: 0.875rem; font-weight: 700; color: #e2e8f0; }
        .db-footer-text { font-size: 0.75rem; color: #475569; }
        .db-footer-links { display: flex; gap: 16px; }
        .db-footer-link { font-size: 0.75rem; color: #475569; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .db-footer-link:hover { color: #94a3b8; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Navbar
        user={user}
        permissions={permissions}
        activePage="reports"
        onLogout={handleLogout}
      />

      {/* MAIN */}
      <main className="db-main">
        <h1 className="db-page-title">Reportes</h1>
        <p className="db-page-sub">Consulta y descarga reportes del sistema hospitalario</p>

        {/* ── Selector de tipo + filtros ── */}
        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">Configurar reporte</div>
            <div className="db-card-sub">Selecciona el tipo y aplica los filtros que necesites</div>
          </div>

          {/* Tipos */}
          <div className="db-types-grid">
            {REPORT_TYPES.map((t) => (
              <div
                key={t.value}
                className={`db-type-card ${genType === t.value ? "selected" : ""}`}
                onClick={() => handleTypeChange(t.value)}
              >
                <div style={{ width: 36, height: 36, background: t.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                  {t.icon}
                </div>
                <span className="db-type-label">{t.label}</span>
              </div>
            ))}
          </div>

          {/* Filtros dinámicos */}
          {currentFilters.length > 0 && (
            <div className="db-filters-row">
              {currentFilters.map((f) => (
                <div key={f.key} className="db-filter-group">
                  <label className="db-filter-label">{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      className="db-filter-inp"
                      value={filters[f.key] ?? ""}
                      onChange={(e) => handleFilterChange(f.key, e.target.value)}
                    >
                      {f.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      className="db-filter-inp"
                      type={f.type}
                      value={filters[f.key] ?? ""}
                      onChange={(e) => handleFilterChange(f.key, e.target.value)}
                      placeholder={f.type === "text" ? "Ej: 4" : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="db-actions-row">
            <span className="db-selected-label">Tipo seleccionado:</span>
            <span className="db-selected-type" style={{ color: currentType.color }}>
              {currentType.icon} {currentType.label}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              {reportData && (
                <button className="db-btn-pdf" onClick={handleExportPDF} disabled={exporting}>
                  {exporting ? "Generando PDF..." : "📄 Descargar PDF"}
                </button>
              )}
              <button className="db-btn-primary" onClick={handleGenerate} disabled={loading}>
                {loading ? "Generando..." : "🔍 Ver reporte"}
              </button>
            </div>
          </div>

          {error && <div className="db-error">✕ {error}</div>}
          {success && <div className="db-success">✅ {success}</div>}
        </div>

        {/* ── Spinner ── */}
        {loading && (
          <div className="db-card" style={{ padding: "3rem", textAlign: "center" }}>
            <div className="db-spinner" />
            <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Generando reporte...</p>
          </div>
        )}

        {/* ── Vista previa del reporte ── */}
        {!loading && reportData && (
          <div className="db-card">
            <div className="db-result-head">
              <div className="db-result-icon" style={{ background: currentType.bg }}>
                {currentType.icon}
              </div>
              <div>
                <div className="db-result-title">{currentType.label}</div>
                <div className="db-result-sub">
                  Vista previa · {new Date().toLocaleString("es-CO")} · generado por {user.username}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button className="db-btn-pdf" onClick={handleExportPDF} disabled={exporting}>
                  {exporting ? "Generando..." : "📄 Descargar PDF"}
                </button>
              </div>
            </div>
            {renderPreview(reportData)}
          </div>
        )}
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
      {showLogoutModal && <LogoutModal onCancel={() => setShowLogoutModal(false)} />}
    </div>
  );
}

export default Reports;