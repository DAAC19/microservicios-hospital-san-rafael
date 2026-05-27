import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDevices, deleteDevice, getDeviceTypes } from "../services/deviceService";
import { logout, getUserProfile } from "../services/authService";
import { getLocations } from "../services/locationService";
import { getAlerts } from "../services/alertService";
import { getMetrics, getMetricTypes } from "../services/metricsService";
import DeviceDetailsModal from "../components/DeviceDetailsModal";
import type { Device, DeviceType } from "../types/device";
import type { User, RolePermissions } from "../types/auth";
import type { HospitalLocation } from "../types/location";
import type { Alert } from "../types/alert";
import type { Metric, MetricType } from "../types/metric";
import { roleInfo, rolePermissionsMap } from "../utils/permissions";
import logoHSF from "../assets/logoHSF.jpg";
import "./management.css";
import Chart from "chart.js/auto";

const CHART_COLORS = ["#378ADD", "#1D9E75", "#BA7517", "#D4537E", "#7F77DD", "#D85A30"];

function MetricsCharts({ metrics, metricTypes }: { metrics: Metric[]; metricTypes: MetricType[] }) {
  const barRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const barChart = useRef<Chart | null>(null);
  const lineChart = useRef<Chart | null>(null);

  const groupedData = useMemo(() => {
    const typeNames = new Map<string, string>();
    metricTypes.forEach((type) => {
      typeNames.set(String(type.id), type.name);
    });

    const grouped: Record<string, { values: number[]; unit: string }> = {};
    metrics.forEach((metric) => {
      const fallbackName = `Type ${metric.metric_type_id}`;
      const key = metric.metric_type || typeNames.get(String(metric.metric_type_id)) || fallbackName;
      if (!grouped[key]) {
        grouped[key] = { values: [], unit: metric.unit || "" };
      }
      grouped[key].values.push(metric.value);
    });

    const types = Object.keys(grouped);
    const averages = types.map((type) =>
      parseFloat((grouped[type].values.reduce((acc, value) => acc + value, 0) / grouped[type].values.length).toFixed(1))
    );
    const maxSeriesLength = types.length ? Math.max(...types.map((type) => grouped[type].values.length)) : 0;
    const lineLabels = Array.from({ length: maxSeriesLength }, (_, index) => `#${index + 1}`);

    return { grouped, types, averages, lineLabels };
  }, [metrics, metricTypes]);

  const { grouped, types, averages, lineLabels } = groupedData;

  useEffect(() => {
    if (!barRef.current) return;
    if (!barChart.current) {
      barChart.current = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: [],
          datasets: [{
            label: "Average",
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1.5,
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: "rgba(128,128,128,0.1)" }, ticks: { font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 }, autoSkip: false } },
          },
        },
      });
    }

    const chart = barChart.current;
    chart.data.labels = types;
    chart.data.datasets[0].data = averages;
    chart.data.datasets[0].backgroundColor = types.map((_, index) => CHART_COLORS[index % CHART_COLORS.length] + "cc");
    chart.data.datasets[0].borderColor = types.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]);
    chart.update();
  }, [types, averages]);

  useEffect(() => {
    if (!lineRef.current) return;
    if (!lineChart.current) {
      lineChart.current = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: [],
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: "rgba(128,128,128,0.1)" }, ticks: { font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          },
        },
      });
    }

    const chart = lineChart.current;
    chart.data.labels = lineLabels;
    chart.data.datasets = types.slice(0, 4).map((type, index) => ({
      label: type,
      data: grouped[type].values,
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      backgroundColor: "transparent",
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: CHART_COLORS[index % CHART_COLORS.length],
      borderWidth: 2,
      borderDash: index === 1 ? [5, 3] : index === 2 ? [2, 2] : [],
    }));
    chart.update();
  }, [types, grouped, lineLabels]);

  useEffect(() => {
    return () => {
      barChart.current?.destroy();
      barChart.current = null;
      lineChart.current?.destroy();
      lineChart.current = null;
    };
  }, []);

  if (!types.length) return null;

  return (
    <div className="db-card" style={{ marginTop: "1.75rem" }}>
      <div className="db-card-head">
        <div>
          <div className="db-card-title">System metrics</div>
          <div className="db-card-sub">Latest readings by metric type</div>
        </div>
      </div>
      <div style={{ padding: "1.25rem" }}>
        {/* Metric summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
          {types.map((t, i) => {
            const avg = (grouped[t].values.reduce((a, b) => a + b, 0) / grouped[t].values.length).toFixed(1);
            return (
              <div key={t} style={{ background: "#f8fafc", borderRadius: 10, padding: "1rem", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length] }}>
                  {avg}
                  <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>{grouped[t].unit}</span>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{grouped[t].values.length} readings</div>
              </div>
            );
          })}
        </div>

        {/* Bar chart */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
            Average by type
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
            {types.map((t, i) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], display: "inline-block" }} />
                {t}
              </span>
            ))}
          </div>
          <div style={{ position: "relative", width: "100%", height: 220 }}>
            <canvas ref={barRef} role="img" aria-label="Bar chart showing average by metric type">Average by metric type.</canvas>
          </div>
        </div>

        {/* Line chart */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.25rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
            Reading trends
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
            {types.slice(0, 4).map((t, i) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                <span style={{ width: 16, height: 3, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], display: "inline-block" }} />
                {t}
              </span>
            ))}
          </div>
          <div style={{ position: "relative", width: "100%", height: 220 }}>
            <canvas ref={lineRef} role="img" aria-label="Line chart showing metric reading trends">Latest metric reading trends.</canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [locations, setLocations] = useState<HospitalLocation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricTypes, setMetricTypes] = useState<MetricType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [detailDevice, setDetailDevice] = useState<Device | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUserProfile(userData);
        setPermissions(rolePermissionsMap[userData.role]);
      } catch {
        logout();
        navigate("/login");
      }
    };
    loadUserProfile();
  }, [navigate]);

  const fetchAllData = useCallback(
    async (isMounted: { current: boolean }) => {
      try {
        setLoading(true);
        setError("");

        const safeRequest = async <T,>(request: Promise<T>, fallback: T, label: string): Promise<T> => {
          try {
            return await request;
          } catch (requestError) {
            console.warn(label, requestError);
            return fallback;
          }
        };

        const [
          devicesData,
          typesData,
          locationsData,
          metricsData,
          metricTypesData,
          alertsData,
        ] = await Promise.all([
          getDevices(),
          safeRequest(getDeviceTypes(), [] as DeviceType[], "Device types"),
          safeRequest(getLocations(), [] as HospitalLocation[], "Locations"),
          safeRequest(getMetrics(), [] as Metric[], "Metrics"),
          safeRequest(getMetricTypes(), [] as MetricType[], "Metric types"),
          permissions?.canViewAlerts
            ? safeRequest(getAlerts(), [] as Alert[], "Alerts")
            : Promise.resolve([] as Alert[]),
        ]);

        if (isMounted.current) {
          setDevices(devicesData);
          setDeviceTypes(typesData);
          setLocations(locationsData);
          setMetrics(metricsData);
          setMetricTypes(metricTypesData);
          setAlerts(alertsData);
        }
      } catch (e) {
        if (isMounted.current) setError("Error loading data. Please try again.");
        console.warn("General error", e);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [permissions]
  );

  useEffect(() => {
    const isMounted = { current: true };
    if (userProfile && permissions) {
      Promise.resolve().then(() => {
        if (isMounted.current) void fetchAllData(isMounted);
      });
    }
    return () => { isMounted.current = false; };
  }, [userProfile, permissions, fetchAllData]);

  const locationMap = useMemo(
    () => new Map(locations.map((location) => [String(location.id), location.name])),
    [locations]
  );

  const deviceTypeMap = useMemo(
    () => new Map(deviceTypes.map((type) => [String(type.id), type.name])),
    [deviceTypes]
  );

  const filteredDevices = useMemo(() => {
    let nextDevices = [...devices];
    if (userProfile?.role === "technician") {
      nextDevices = nextDevices.filter(
        (device) =>
          !device.assigned_user_id || String(device.assigned_user_id) === String(userProfile.id)
      );
    }
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      nextDevices = nextDevices.filter((device) => {
        const name = device.name || device.nombre || "";
        return name.toLowerCase().includes(query) || String(device.id).includes(query);
      });
    }
    if (selectedStatus !== "all") {
      nextDevices = nextDevices.filter(
        (device) =>
          (device.status || device.estado || "").toLowerCase() === selectedStatus.toLowerCase()
      );
    }
    if (selectedLocation !== "all") {
      nextDevices = nextDevices.filter(
        (device) => String(device.location_id) === String(selectedLocation)
      );
    }
    return nextDevices;
  }, [devices, userProfile, searchTerm, selectedStatus, selectedLocation]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");
      const [devicesData, alertsData] = await Promise.all([
        getDevices(),
        permissions?.canViewAlerts
          ? getAlerts().catch((refreshError) => {
              console.warn("Alerts refresh", refreshError);
              return [] as Alert[];
            })
          : Promise.resolve([] as Alert[]),
      ]);

      setDevices(devicesData);
      if (permissions?.canViewAlerts) {
        setAlerts(alertsData);
      }
    } catch (e) {
      console.warn("Refresh", e);
      setError("Could not refresh devices.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { setShowLogoutModal(true); };
  const confirmLogout = () => { logout(); navigate("/login"); };

  const handleDeleteDevice = async (deviceId: string | number) => {
    if (!permissions?.canDelete) return;
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await deleteDevice(deviceId);
      setDevices((prev) => prev.filter((d) => String(d.id) !== String(deviceId)));
    } catch {
      setError("Error deleting device.");
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
    if (!locationId) return "No location";
    return locationMap.get(String(locationId)) || `Location ${locationId}`;
  };

  const getTypeName = (typeId?: string | number) => {
    if (!typeId) return "No type";
    return deviceTypeMap.get(String(typeId)) || `Type ${typeId}`;
  };

  const stats = useMemo(
    () =>
      [
        {
          label: "Devices",
          value: filteredDevices.length,
          icon: "ti-stethoscope",
          color: "#3b82f6",
          bg: "#eff6ff",
          visible: true,
        },
        {
          label: "Critical alerts",
          value: alerts.filter((a) => a.severity?.toLowerCase() === "critical").length,
          icon: "ti-alert-triangle",
          color: "#f59e0b",
          bg: "#fffbeb",
          visible: permissions?.canViewAlerts === true,
        },
        {
          label: "Active",
          value: filteredDevices.filter((d) => String(d.status || d.estado || "").toLowerCase().includes("activo")).length,
          icon: "ti-chart-bar",
          color: "#10b981",
          bg: "#ecfdf5",
          visible: true,
        },
        {
          label: "Locations",
          value: locations.length,
          icon: "ti-map-pin",
          color: "#8b5cf6",
          bg: "#f5f3ff",
          visible: permissions?.canViewAll === true,
        },
      ].filter((stat) => stat.visible),
    [filteredDevices, alerts, locations.length, permissions]
  );

  if (!userProfile || !permissions) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748b", fontFamily: "system-ui" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-root">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,700;0,800;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .db-root { min-height: 100vh; background: #f1f5f9; font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; }
        .db-nav { background: #0f172a; padding: 0 2rem; position: sticky; top: 0; z-index: 200; display: flex; align-items: center; justify-content: space-between; height: 60px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .db-nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .db-nav-brand-icon { width: 40px; height: 40px; border-radius: 4px; display: block; object-fit: contain; background: #fff; flex-shrink: 0; }
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
        .db-page-header { margin-bottom: 2rem; }
        .db-page-title { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
        .db-page-sub { color: #64748b; font-size: 0.9rem; }
        .db-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.75rem; }
        .db-stat { background: #fff; border-radius: 12px; padding: 1.25rem 1.5rem; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 1rem; transition: box-shadow 0.2s, transform 0.2s; }
        .db-stat:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .db-stat-icon { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
        .db-stat-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8; margin-bottom: 3px; }
        .db-stat-value { font-family: 'Fraunces', serif; font-size: 1.75rem; font-weight: 800; line-height: 1; }
        .db-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; }
        .db-card-head { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .db-card-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .db-card-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
        .db-card-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .db-input { padding: 7px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; color: #0f172a; background: #f8fafc; outline: none; transition: border-color 0.15s; font-family: 'DM Sans', sans-serif; min-width: 180px; }
        .db-input:focus { border-color: #3b82f6; background: #fff; }
        .db-select { padding: 7px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; color: #0f172a; background: #f8fafc; outline: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: border-color 0.15s; }
        .db-select:focus { border-color: #3b82f6; }
        .db-btn-primary { background: #3b82f6; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; }
        .db-btn-primary:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
        .db-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-table-wrap { overflow-x: auto; }
        .db-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .db-table thead { background: #f8fafc; }
        .db-table th { padding: 10px 16px; text-align: left; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .db-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: middle; }
        .db-table tbody tr:last-child td { border-bottom: none; }
        .db-table tbody tr:hover td { background: #f8fafc; }
        .db-device-name { font-weight: 600; color: #1e293b; }
        .db-device-id { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #94a3b8; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; }
        .db-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
        .db-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; }
        .db-badge-active { background: #dcfce7; color: #166534; }
        .db-badge-active::before { background: #22c55e; }
        .db-badge-inactive { background: #fee2e2; color: #991b1b; }
        .db-badge-inactive::before { background: #ef4444; }
        .db-badge-maintenance { background: #fef9c3; color: #854d0e; }
        .db-badge-maintenance::before { background: #eab308; }
        .db-loc-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #475569; }
        .db-action-btns { display: flex; gap: 6px; }
        .db-btn-edit { background: #eff6ff; color: #1d4ed8; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 5px; }
        .db-btn-edit:hover { background: #dbeafe; }
        .db-btn-del { background: #fff1f2; color: #be123c; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 5px; }
        .db-btn-del:hover { background: #ffe4e6; }
        .db-empty { text-align: center; padding: 3rem 2rem; color: #94a3b8; }
        .db-empty-icon { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.4; color: #94a3b8; }
        .db-empty-title { font-weight: 700; color: #475569; margin-bottom: 4px; font-size: 0.95rem; }
        .db-error { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; padding: 12px 16px; border-radius: 8px; margin: 1rem 1.5rem; font-size: 0.875rem; display: flex; align-items: center; gap: 8px; }
        .db-spinner-wrap { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.875rem; }
        .db-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .db-footer { background: #0f172a; border-top: 1px solid rgba(255,255,255,0.06); padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .db-footer-brand { font-family: 'Fraunces', serif; font-size: 0.875rem; font-weight: 700; color: #e2e8f0; }
        .db-footer-text { font-size: 0.75rem; color: #475569; }
        .db-footer-links { display: flex; gap: 16px; }
        .db-footer-link { font-size: 0.75rem; color: #475569; cursor: pointer; text-decoration: none; transition: color 0.15s; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .db-footer-link:hover { color: #94a3b8; }
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

      {/* NAVBAR */}
      <nav className="db-nav">
        <div className="db-nav-brand">
          <img className="db-nav-brand-icon" src={logoHSF} alt="Hospital San Rafael" />
          <span className="db-nav-brand-text">Hospital San Rafael</span>
        </div>
        <ul className="db-nav-links">
          <li><button className="db-nav-link active" onClick={() => navigate("/dashboard")}>Dashboard</button></li>
          <li><button className="db-nav-link" onClick={() => navigate("/devices")}>Devices</button></li>
          {permissions.canViewAll && <li><button className="db-nav-link" onClick={() => navigate("/locations")}>Locations</button></li>}
          {permissions.canViewAll && <li><button className="db-nav-link" onClick={() => navigate("/metrics")}>Metrics</button></li>}
          {permissions.canViewAlerts && <li><button className="db-nav-link" onClick={() => navigate("/alerts")}>Alerts</button></li>}
          {permissions.canViewReports && <li><button className="db-nav-link" onClick={() => navigate("/reports")}>Reports</button></li>}
          {permissions.canManageUsers && <li><button className="db-nav-link" onClick={() => navigate("/users")}>Users</button></li>}
        </ul>
        <div className="db-nav-right">
          <div className="db-nav-user">
            <div className="db-nav-avatar">{roleInfo[userProfile.role].icon}</div>
            <div>
              <div className="db-nav-username">{userProfile.username}</div>
              <span className="db-role-pill" style={{ backgroundColor: roleInfo[userProfile.role].color }}>{roleInfo[userProfile.role].label}</span>
            </div>
          </div>
          <button className="db-btn-ghost" onClick={() => navigate("/profile")}>Profile</button>
          <button className="db-btn-ghost" onClick={() => navigate("/")}>Home</button>
          <button className="db-btn-ghost" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="db-main">
        <div className="db-page-header">
          <h1 className="db-page-title">Dashboard</h1>
          <p className="db-page-sub">
            Medical device monitoring panel
            {userProfile.role === "technician" && " · Assigned devices"}
          </p>
        </div>

        {/* Stats */}
        <div className="db-stats">
          {stats.map((s) => (
            <div className="db-stat" key={s.label}>
              <div className="db-stat-icon" style={{ background: s.bg, color: s.color }}>
                <i className={`ti ${s.icon}`} aria-hidden="true" />
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
              <div className="db-card-title">Registered devices</div>
              <div className="db-card-sub">
                {userProfile.role === "technician" ? "Devices assigned to your account" : "System device list"}
              </div>
            </div>
            <div className="db-card-actions">
              {permissions.canViewAll && (
                <>
                  <input type="text" className="db-input" placeholder="Search device..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <select className="db-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="all">All statuses</option>
                    <option value="activo">Active</option>
                    <option value="inactivo">Inactive</option>
                    <option value="mantenimiento">Maintenance</option>
                  </select>
                  {locations.length > 0 && (
                    <select className="db-select" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                      <option value="all">All locations</option>
                      {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  )}
                </>
              )}
              <button className="db-btn-primary" onClick={handleRefresh} disabled={loading}>
                <i className="ti ti-refresh" aria-hidden="true" />
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="db-spinner-wrap">
              <div className="db-spinner" />
              <p>Loading devices...</p>
            </div>
          )}

          {error && (
            <div className="db-error">
              <i className="ti ti-x" aria-hidden="true" />
              {error}
            </div>
          )}

          {!loading && !error && filteredDevices.length === 0 && devices.length === 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">
                <i className="ti ti-inbox" aria-hidden="true" />
              </div>
              <div className="db-empty-title">No devices</div>
              <p style={{ fontSize: "0.8rem" }}>Devices will appear here once they are registered.</p>
            </div>
          )}

          {!loading && !error && filteredDevices.length === 0 && devices.length > 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">
                <i className="ti ti-search" aria-hidden="true" />
              </div>
              <div className="db-empty-title">No results</div>
              <p style={{ fontSize: "0.8rem" }}>Try different search terms or filters.</p>
            </div>
          )}

          {!loading && !error && filteredDevices.length > 0 && (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => {
                    const status = device.status || device.estado;
                    const statusClass = normalizeStatusClass(status);
                    return (
                      <tr key={device.id}>
                        <td><span className="db-device-id">{device.id}</span></td>
                        <td><span className="db-device-name">{device.name || device.nombre || "Unnamed"}</span></td>
                        <td><span className={`db-badge db-badge-${statusClass}`}>{status || "No status"}</span></td>
                        <td>
                          <span className="db-loc-tag">
                            <i className="ti ti-map-pin" aria-hidden="true" style={{ fontSize: "0.9rem" }} />
                            {getLocationName(device.location_id)}
                          </span>
                        </td>
                        <td>{getTypeName(device.device_type_id)}</td>
                        <td>
                          <div className="db-action-btns">
                            <button className="db-btn-edit" onClick={() => setDetailDevice(device)}>
                              <i className="ti ti-eye" aria-hidden="true" />
                              View
                            </button>
                            {permissions.canDelete && (
                              <button className="db-btn-del" onClick={() => handleDeleteDevice(device.id)}>
                                <i className="ti ti-trash" aria-hidden="true" />
                                Delete
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

        {/* Metrics charts */}
        {metrics.length > 0 && (
          <MetricsCharts metrics={metrics} metricTypes={metricTypes} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="db-footer">
        <div>
          <div className="db-footer-brand">Hospital San Rafael</div>
          <div className="db-footer-text">Microservices platform · Hospital monitoring system</div>
        </div>
        <div className="db-footer-links">
          <button className="db-footer-link" onClick={() => navigate("/dashboard")}>Dashboard</button>
          {permissions.canViewAll && <button className="db-footer-link" onClick={() => navigate("/locations")}>Locations</button>}
          {permissions.canViewAll && <button className="db-footer-link" onClick={() => navigate("/metrics")}>Metrics</button>}
          <button className="db-footer-link" onClick={handleLogout}>Sign out</button>
        </div>
      </footer>

      {showLogoutModal && (
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
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem", fontSize: 26, color: "#64748b",
            }}>
              <i className="ti ti-logout" aria-hidden="true" />
            </div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 8 }}>
              Sign out?
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem", textAlign: "center", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Your current session will be closed. You will need to sign in again to access the system.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1, padding: "0.7rem", borderRadius: 8, border: "1.5px solid #e2e8f0",
                  background: "#f8fafc", color: "#475569", fontWeight: 600,
                  cursor: "pointer", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  flex: 1, padding: "0.7rem", borderRadius: 8, border: "none",
                  background: "#ef4444", color: "#fff", fontWeight: 700,
                  cursor: "pointer", fontSize: "0.875rem", fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <i className="ti ti-logout" aria-hidden="true" />
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <DeviceDetailsModal
        device={detailDevice}
        deviceTypes={deviceTypes}
        locations={locations}
        onClose={() => setDetailDevice(null)}
      />
    </div>
  );
}

export default Dashboard;