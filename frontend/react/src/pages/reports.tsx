import {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports } from "../services/reportsService";
import { logout, getUserProfile } from "../services/authService";
import { rolePermissionsMap } from "../utils/permissions";
import type { User, RolePermissions } from "../types/auth";
import Navbar from "../components/Navbar";
import LogoutModal from "../components/LogoutModal";


// ── Tabler outline icons ──────────────────────────────────────────────────────
const IconChartBar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M4 20l14 0"/>
  </svg>
);
const IconAlertTriangle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>
  </svg>
);
const IconTrendingUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 17l4 -4l4 4l4 -4l4 4"/><path d="M3 7l4 -4l4 4l4 -4l4 4"/>
  </svg>
);
const IconDeviceDesktop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z"/><path d="M7 20h10"/><path d="M9 16v4"/><path d="M15 16v4"/>
  </svg>
);
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>
  </svg>
);
const IconFileDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M12 17v-6"/><path d="M9.5 14.5l2.5 2.5l2.5 -2.5"/>
  </svg>
);
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>
  </svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12"/><path d="M6 6l12 12"/>
  </svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/>
  </svg>
);
const IconBuildingHospital = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21l18 0"/><path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4"/><path d="M10 9l4 0"/><path d="M12 7l0 4"/>
  </svg>
);


const REPORT_TYPES = [
  { value: "general",  label: "System Overview",       Icon: IconChartBar,      color: "#5b21b6", bg: "#f5f3ff" },
  { value: "alerts",   label: "Alerts",                Icon: IconAlertTriangle, color: "#991b1b", bg: "#fef2f2" },
  { value: "metrics",  label: "Metrics by Device",     Icon: IconTrendingUp,    color: "#1e40af", bg: "#eff6ff" },
  { value: "devices",  label: "Devices",               Icon: IconDeviceDesktop, color: "#166534", bg: "#f0fdf4" },
  { value: "last_24h", label: "Last 24 Hours",         Icon: IconClock,         color: "#92400e", bg: "#fffbeb" },
];

const FILTERS_BY_TYPE: Record<string, { key: string; label: string; type: "select" | "date" | "text"; options?: { value: string; label: string }[] }[]> = {
  general: [
    { key: "date_from", label: "From", type: "date" },
    { key: "date_to",   label: "To",   type: "date" },
  ],
  alerts: [
    {
      key: "severity", label: "Severity", type: "select", options: [
        { value: "",         label: "All"      },
        { value: "CRITICAL", label: "CRITICAL" },
        { value: "WARNING",  label: "WARNING"  },
        { value: "INFO",     label: "INFO"     },
      ]
    },
    {
      key: "status", label: "Status", type: "select", options: [
        { value: "",         label: "All"      },
        { value: "open",     label: "Open"     },
        { value: "resolved", label: "Resolved" },
      ]
    },
    { key: "date_from", label: "From", type: "date" },
    { key: "date_to",   label: "To",   type: "date" },
  ],
  metrics: [
    { key: "device_id", label: "Device ID", type: "text" },
    {
      key: "metric", label: "Metric", type: "select", options: [
        { value: "",            label: "All"         },
        { value: "temperature", label: "Temperature" },
        { value: "pressure",    label: "Pressure"    },
        { value: "humidity",    label: "Humidity"    },
        { value: "heartrate",   label: "Heart Rate"  },
      ]
    },
    { key: "date_from", label: "From", type: "date" },
    { key: "date_to",   label: "To",   type: "date" },
  ],
  devices: [
    { key: "date_from", label: "From", type: "date" },
    { key: "date_to",   label: "To",   type: "date" },
  ],
  last_24h: [],
};

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

async function generatePDF(
  typeLabel: string,
  filters: Record<string, string>,
  data: Record<string, unknown>,
  username: string
) {
  if (!(window as any).jspdf) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load jsPDF"));
      document.head.appendChild(s);
    });
  }

  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  let y = 0;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("San Rafael Hospital", margin, 17);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Microservices Platform · Hospital Monitoring System", margin, 24);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Report: ${typeLabel}`, margin, 35);
  y = 52;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const now = new Date().toLocaleString("en-US");
  const metaItems = [
    ["Generated", now],
    ["User", username],
    ["Type", typeLabel],
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

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 8;

  function addSectionTitle(title: string) {
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(title, margin, y); y += 2;
    doc.setDrawColor(59, 130, 246); doc.setLineWidth(0.8);
    doc.line(margin, y, margin + doc.getTextWidth(title), y);
    doc.setLineWidth(0.3); y += 7;
  }

  function addTable(keys: string[], rows: Record<string, string>[]) {
    if (keys.length === 0 || rows.length === 0) return;
    const maxCols = Math.min(keys.length, 6);
    const usedKeys = keys.slice(0, maxCols);
    const colWidth = (W - margin * 2) / maxCols;
    const rowH = 7; const headerH = 9;
    doc.setFillColor(30, 64, 175); doc.rect(margin, y, W - margin * 2, headerH, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    usedKeys.forEach((k, i) => { doc.text(k.toUpperCase().replace(/_/g, " "), margin + 3 + i * colWidth, y + 6); });
    y += headerH;
    rows.forEach((row, ri) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const bg = ri % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(margin, y, W - margin * 2, rowH, "F");
      doc.setDrawColor(241, 245, 249); doc.rect(margin, y, W - margin * 2, rowH, "S");
      doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      usedKeys.forEach((k, i) => { doc.text(String(row[k] ?? "—").substring(0, 24), margin + 3 + i * colWidth, y + 5); });
      y += rowH;
    });
    y += 6;
  }

  function addKeyValue(obj: Record<string, unknown>, depth = 0) {
    Object.entries(obj).forEach(([key, val]) => {
      if (y > 270) { doc.addPage(); y = 20; }
      if (isArray(val) && val.length > 0 && isObject(val[0]) && key !== "by_severity" && key !== "by_status") {
        addSectionTitle(key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
        const { keys, rows } = flattenForTable(val); addTable(keys, rows);
      } else if (isObject(val)) {
        addSectionTitle(key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
        addKeyValue(val, depth + 1);
      } else if (isArray(val)) {
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
        doc.text(key + ":", margin + depth * 4, y); doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
        doc.text((val as unknown[]).join(", ").substring(0, 80), margin + depth * 4 + 30, y); y += 6;
      } else {
        doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
        doc.text(key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) + ":", margin + depth * 4, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
        doc.text(String(val ?? "—").substring(0, 100), margin + depth * 4 + 44, y); y += 6;
      }
    });
  }

  const topArrays    = Object.entries(data).filter(([, v]) => isArray(v) && (v as unknown[]).length > 0 && isObject((v as unknown[])[0]));
  const topObjects   = Object.entries(data).filter(([, v]) => isObject(v));
  const topPrimitives = Object.entries(data).filter(([, v]) => !isArray(v) && !isObject(v));

  if (topPrimitives.length > 0) {
    addSectionTitle("Summary");
    const statsPerRow = Math.min(topPrimitives.length, 4);
    const statW = (W - margin * 2) / statsPerRow;
    topPrimitives.slice(0, 4).forEach(([k, v], i) => {
      const x = margin + i * statW;
      doc.setFillColor(239, 246, 255); doc.roundedRect(x, y, statW - 3, 20, 2, 2, "F");
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(30, 64, 175);
      doc.text(k.replace(/_/g, " ").toUpperCase(), x + 3, y + 7);
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
      doc.text(String(v), x + 3, y + 17);
    });
    y += 27;
  }

  topObjects.forEach(([k, v]) => {
    addSectionTitle(k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
    addKeyValue(v as Record<string, unknown>, 0);
  });
  topArrays.forEach(([k, v]) => {
    addSectionTitle(k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
    const { keys, rows } = flattenForTable(v as unknown[]);
    addTable(keys, rows);
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(15, 23, 42); doc.rect(0, 287, W, 10, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
    doc.text("San Rafael Hospital · Confidential document", margin, 293);
    doc.text(`Page ${p} of ${totalPages}`, W - margin - 18, 293);
  }

  doc.save(`report_${typeLabel.toLowerCase().replace(/ /g, "_")}_${Date.now()}.pdf`);
}

// ── Main component ────────────────────────────────────────────────────────────
function Reports() {
  const navigate = useNavigate();
  const [user, setUser]             = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [genType, setGenType]       = useState("general");
  const [filters, setFilters]       = useState<Record<string, string>>({});
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading]       = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentType    = REPORT_TYPES.find(t => t.value === genType)!;
  const currentFilters = FILTERS_BY_TYPE[genType] ?? [];

  useEffect(() => {
    (async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
        setPermissions(rolePermissionsMap[userData.role]);
      } catch {
        logout(); navigate("/login");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!user || !permissions) return;
    if (!permissions.canViewReports) navigate("/dashboard");
  }, [user, permissions, navigate]);

  const handleTypeChange = (t: string) => {
    setGenType(t); setFilters({}); setReportData(null); setError(""); setSuccess("");
  };
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  const buildQuery = (): string => {
    // El tipo de reporte debe ser currentType.value o genType
    const reportType = genType; // ej: "last_24h"
    
    // Construir query string solo con filtros adicionales
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });

    const queryString = params.toString();
    return queryString ? `${reportType}?${queryString}` : reportType;
  };

  const handleGenerate = async () => {
    try {
      setLoading(true); setError(""); setSuccess(""); setReportData(null);
      const data = await getReports(buildQuery());
      setReportData(data as Record<string, unknown>);
      setSuccess("Report generated successfully.");
    } catch {
      setError("Error generating the report. Please verify the service is active.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData || !user) return;
    try {
      setExporting(true); setError("");
      await generatePDF(currentType.label, filters, reportData, user.username);
    } catch (e) {
      setError("Error generating PDF. Please try again."); console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const renderCell = (key: string, val: string) => {
    const lk = key.toLowerCase();
    if (lk === "status") {
      const isRes = val.toLowerCase().includes("resolv") || val.toLowerCase() === "resolved";
      return (
        <span style={{ background: isRes ? "#f0fdf4" : "#fff1f2", color: isRes ? "#166534" : "#be123c", borderRadius: 20, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
          {val}
        </span>
      );
    }
    if (lk === "severity") {
      const colors: Record<string, [string, string]> = {
        CRITICAL: ["#fef2f2", "#991b1b"],
        WARNING:  ["#fffbeb", "#92400e"],
        INFO:     ["#eff6ff", "#1e40af"],
      };
      const [bg, color] = colors[val?.toUpperCase()] ?? ["#f1f5f9", "#475569"];
      return <span style={{ background: bg, color, borderRadius: 20, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700 }}>{val}</span>;
    }
    return val;
  };

  const renderPreview = (data: Record<string, unknown>) => {
    const entries = Object.entries(data).filter(([key]) => key !== "alerts" && key !== "devices");
    return (
      <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: 20 }}>
        {entries.map(([key, val]) => {
          const title = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

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
                        <tr>
                          <td colSpan={maxCols} style={{ padding: "8px 12px", color: "#94a3b8", fontSize: "0.75rem", textAlign: "center" }}>
                            ... and {rows.length - 50} more records in the PDF
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

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

  if (!user || !permissions) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
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
        .db-main { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 2rem 3rem; }
        .db-page-title { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
        .db-page-sub { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }
        .db-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 1.25rem; }
        .db-card-head { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .db-card-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .db-card-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
        .db-types-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; padding: 1.25rem 1.5rem; }
        .db-type-card { border: 2px solid #e2e8f0; border-radius: 10px; padding: 1rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 10px; }
        .db-type-card:hover, .db-type-card.selected { border-color: #3b82f6; background: #eff6ff; }
        .db-type-label { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
        .db-filters-row { display: flex; flex-wrap: wrap; gap: 12px; padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; align-items: flex-end; }
        .db-filter-group { display: flex; flex-direction: column; gap: 4px; }
        .db-filter-label { font-size: 0.72rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
        .db-filter-inp { padding: 7px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.84rem; color: #0f172a; background: #fff; outline: none; font-family: 'DM Sans', sans-serif; min-width: 140px; }
        .db-filter-inp:focus { border-color: #3b82f6; }
        .db-actions-row { display: flex; gap: 10px; padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; align-items: center; flex-wrap: wrap; }
        .db-selected-label { font-size: 0.82rem; color: #64748b; }
        .db-selected-type { font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; }
        .db-btn-primary { background: #3b82f6; color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; transition: background 0.15s; display: flex; align-items: center; gap: 7px; }
        .db-btn-primary:hover:not(:disabled) { background: #2563eb; }
        .db-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-btn-pdf { background: #dc2626; color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; transition: background 0.15s; display: flex; align-items: center; gap: 7px; }
        .db-btn-pdf:hover:not(:disabled) { background: #b91c1c; }
        .db-btn-pdf:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-error { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; padding: 12px 16px; border-radius: 8px; margin: 0 1.5rem 1rem; font-size: 0.875rem; display: flex; align-items: center; gap: 6px; }
        .db-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 10px 16px; border-radius: 8px; margin: 0 1.5rem 0; font-size: 0.84rem; display: flex; align-items: center; gap: 6px; }
        .db-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
        .db-result-head { display: flex; align-items: center; gap: 14px; padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .db-result-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .db-result-title { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
        .db-result-sub { font-size: 0.76rem; color: #94a3b8; margin-top: 2px; }
        .db-footer { background: #0f172a; border-top: 1px solid rgba(255,255,255,0.06); padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .db-footer-brand { font-family: 'Fraunces', serif; font-size: 0.875rem; font-weight: 700; color: #e2e8f0; display: flex; align-items: center; gap: 6px; }
        .db-footer-text { font-size: 0.75rem; color: #475569; }
        .db-footer-links { display: flex; gap: 16px; }
        .db-footer-link { font-size: 0.75rem; color: #475569; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .db-footer-link:hover { color: #94a3b8; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Navbar user={user} permissions={permissions} activePage="reports" onLogout={() => setShowLogoutModal(true)} />

      <main className="db-main">
        <h1 className="db-page-title">Reports</h1>
        <p className="db-page-sub">Query and download reports from the hospital system</p>

        <div className="db-card">
          <div className="db-card-head">
            <div className="db-card-title">Configure report</div>
            <div className="db-card-sub">Select the type and apply the filters you need</div>
          </div>

          {/* Type selector */}
          <div className="db-types-grid">
            {REPORT_TYPES.map((t) => (
              <div
                key={t.value}
                className={`db-type-card ${genType === t.value ? "selected" : ""}`}
                onClick={() => handleTypeChange(t.value)}
              >
                <div style={{ width: 36, height: 36, background: t.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: t.color, flexShrink: 0 }}>
                  <t.Icon />
                </div>
                <span className="db-type-label">{t.label}</span>
              </div>
            ))}
          </div>

          {/* Dynamic filters */}
          {currentFilters.length > 0 && (
            <div className="db-filters-row">
              {currentFilters.map((f) => (
                <div key={f.key} className="db-filter-group">
                  <label className="db-filter-label">{f.label}</label>
                  {f.type === "select" ? (
                    <select className="db-filter-inp" value={filters[f.key] ?? ""} onChange={(e) => handleFilterChange(f.key, e.target.value)}>
                      {f.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      className="db-filter-inp"
                      type={f.type}
                      value={filters[f.key] ?? ""}
                      onChange={(e) => handleFilterChange(f.key, e.target.value)}
                      placeholder={f.type === "text" ? "e.g. 4" : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="db-actions-row">
            <span className="db-selected-label">Selected type:</span>
            <span className="db-selected-type" style={{ color: currentType.color }}>
              <currentType.Icon /> {currentType.label}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              {reportData && (
                <button className="db-btn-pdf" onClick={handleExportPDF} disabled={exporting}>
                  <IconFileDownload /> {exporting ? "Generating PDF..." : "Download PDF"}
                </button>
              )}
              <button className="db-btn-primary" onClick={handleGenerate} disabled={loading}>
                <IconSearch /> {loading ? "Generating..." : "View report"}
              </button>
            </div>
          </div>

          {error   && <div className="db-error">  <IconX />     {error}   </div>}
          {success && <div className="db-success"> <IconCheck /> {success} </div>}
        </div>

        {/* Spinner */}
        {loading && (
          <div className="db-card" style={{ padding: "3rem", textAlign: "center" }}>
            <div className="db-spinner" />
            <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Generating report...</p>
          </div>
        )}

        {/* Report preview */}
        {!loading && reportData && (
          <div className="db-card">
            <div className="db-result-head">
              <div className="db-result-icon" style={{ background: currentType.bg, color: currentType.color }}>
                <currentType.Icon />
              </div>
              <div>
                <div className="db-result-title">{currentType.label}</div>
                <div className="db-result-sub">
                  Preview · {new Date().toLocaleString("en-US")} · generated by {user.username}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button className="db-btn-pdf" onClick={handleExportPDF} disabled={exporting}>
                  <IconFileDownload /> {exporting ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
            {renderPreview(reportData)}
          </div>
        )}
      </main>

      <footer className="db-footer">
        <div>
          <div className="db-footer-brand"><IconBuildingHospital /> San Rafael Hospital</div>
          <div className="db-footer-text">Microservices Platform · Hospital Monitoring System</div>
        </div>
        <div className="db-footer-links">
          <button className="db-footer-link" onClick={() => navigate("/dashboard")}>Dashboard</button>
          {permissions.canViewAlerts  && <button className="db-footer-link" onClick={() => navigate("/alerts")}>Alerts</button>}
          {permissions.canViewReports && <button className="db-footer-link" onClick={() => navigate("/reports")}>Reports</button>}
          <button className="db-footer-link" onClick={() => setShowLogoutModal(true)}>Sign out</button>
        </div>
      </footer>

      {showLogoutModal && <LogoutModal onCancel={() => setShowLogoutModal(false)} />}
    </div>
  );
}

export default Reports;