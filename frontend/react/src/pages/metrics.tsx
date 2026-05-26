import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppChrome from "../components/AppChrome";
import type { Metric, MetricType } from "../types/metric";
import {
  getMetrics,
  getMetricTypes,
  createMetric,
  createMetricType,
  deleteMetric,
  deleteMetricType,
} from "../services/metricsService";
import { logout, getUserProfile } from "../services/authService";
import { rolePermissionsMap } from "../utils/permissions";
import type { User } from "../types/auth";

type Tab = "metrics" | "types";

interface MetricForm {
  device_id: string;
  metric_type_id: string;
  value: string;
}

interface TypeForm {
  name: string;
  unit: string;
  description: string;
}

const EMPTY_METRIC_FORM: MetricForm = {
  device_id: "",
  metric_type_id: "",
  value: "",
};

const EMPTY_TYPE_FORM: TypeForm = {
  name: "",
  unit: "",
  description: "",
};

export default function Metrics() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("metrics");

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [filterDeviceId, setFilterDeviceId] = useState("");
  const [filterTypeId, setFilterTypeId] = useState("");

  const [types, setTypes] = useState<MetricType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState<string | null>(null);

  const [showMetricModal, setShowMetricModal] = useState(false);
  const [metricForm, setMetricForm] = useState<MetricForm>(EMPTY_METRIC_FORM);
  const [metricSaving, setMetricSaving] = useState(false);
  const [metricFormError, setMetricFormError] = useState<string | null>(null);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeForm, setTypeForm] = useState<TypeForm>(EMPTY_TYPE_FORM);
  const [typeSaving, setTypeSaving] = useState(false);
  const [typeFormError, setTypeFormError] = useState<string | null>(null);

  const [deleteMetricTarget, setDeleteMetricTarget] = useState<Metric | null>(null);
  const [deleteTypeTarget, setDeleteTypeTarget] = useState<MetricType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    getUserProfile()
      .then(setUser)
      .catch(() => {
        logout();
        navigate("/login");
      });
  }, [navigate]);

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);

    try {
      const filters: Record<string, string | number> = {};

      if (filterDeviceId.trim()) {
        filters.device_id = filterDeviceId.trim();
      }

      if (filterTypeId.trim()) {
        filters.metric_type_id = filterTypeId.trim();
      }

      const data = await getMetrics(filters);
      setMetrics(data);
    } catch (e: unknown) {
      console.warn("No se pudieron cargar las métricas", e);
      setMetricsError((e as Error).message);
    } finally {
      setMetricsLoading(false);
    }
  }, [filterDeviceId, filterTypeId]);

  const fetchTypes = useCallback(async () => {
    setTypesLoading(true);
    setTypesError(null);

    try {
      const data = await getMetricTypes();
      setTypes(data);
    } catch (e: unknown) {
      console.warn("No se pudieron cargar los tipos de métricas", e);
      setTypesError((e as Error).message);
    } finally {
      setTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (user && user.role !== "user") {
      void fetchTypes();
    }
  }, [user, fetchTypes]);

  const handleCreateMetric = async () => {
    if (
      !metricForm.device_id.trim() ||
      !metricForm.metric_type_id.trim() ||
      !metricForm.value.trim()
    ) {
      setMetricFormError("Todos los campos son obligatorios.");
      return;
    }

    if (isNaN(Number(metricForm.value))) {
      setMetricFormError("El valor debe ser un número.");
      return;
    }

    setMetricSaving(true);
    setMetricFormError(null);

    try {
      const created = await createMetric({
        device_id: Number(metricForm.device_id),
        metric_type_id: Number(metricForm.metric_type_id),
        value: Number(metricForm.value),
      });

      setMetrics((prev) => [created, ...prev]);
      setShowMetricModal(false);
      setMetricForm(EMPTY_METRIC_FORM);
    } catch (e: unknown) {
      setMetricFormError((e as Error).message);
    } finally {
      setMetricSaving(false);
    }
  };

  const handleDeleteMetric = async () => {
    if (!deleteMetricTarget) return;

    setDeleting(true);

    try {
      await deleteMetric(deleteMetricTarget.id);
      setMetrics((prev) => prev.filter((m) => m.id !== deleteMetricTarget.id));
      setDeleteMetricTarget(null);
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateType = async () => {
    if (!typeForm.name.trim()) {
      setTypeFormError("El nombre es obligatorio.");
      return;
    }

    setTypeSaving(true);
    setTypeFormError(null);

    try {
      const created = await createMetricType({
        name: typeForm.name.trim(),
        unit: typeForm.unit.trim() || undefined,
        description: typeForm.description.trim() || undefined,
      });

      setTypes((prev) => [created, ...prev]);
      setShowTypeModal(false);
      setTypeForm(EMPTY_TYPE_FORM);
    } catch (e: unknown) {
      setTypeFormError((e as Error).message);
    } finally {
      setTypeSaving(false);
    }
  };

  const handleDeleteType = async () => {
    if (!deleteTypeTarget) return;

    setDeleting(true);

    try {
      await deleteMetricType(deleteTypeTarget.id);
      setTypes((prev) => prev.filter((t) => t.id !== deleteTypeTarget.id));
      setDeleteTypeTarget(null);
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (val?: string) => {
    if (!val) return "—";

    return new Date(val).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeName = (id: string | number) => {
    const t = types.find((type) => String(type.id) === String(id));
    return t ? `${t.name}${t.unit ? ` (${t.unit})` : ""}` : `Tipo ${id}`;
  };

  const filteredMetrics = metrics.filter((m) => {
    const q = search.toLowerCase();

    return (
      String(m.device_id).includes(q) ||
      (m.metric_type ?? "").toLowerCase().includes(q) ||
      String(m.value).includes(q)
    );
  });

  const filteredTypes = types.filter((t) => {
    const q = search.toLowerCase();

    return (
      t.name.toLowerCase().includes(q) ||
      (t.unit ?? "").toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q)
    );
  });

  const permissions = user ? rolePermissionsMap[user.role] : null;

  if (!user) {
    return <div className="mg-loading">Cargando...</div>;
  }

  return (
    <AppChrome user={user} active="metrics">
      <div className="mx-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,700;0,800;1,700&display=swap');

          *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          .mx-root {
            min-height: auto;
            background: transparent;
            font-family: 'DM Sans', sans-serif;
            display: flex;
            flex-direction: column;
          }

          .mx-main {
            flex: 1;
            max-width: 1380px;
            width: 100%;
            margin: 0 auto;
            padding: 2rem 2rem 3rem;
          }

          .mx-page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 12px;
          }

          .mx-page-title {
            font-family: 'Fraunces', serif;
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
            display: flex;
            align-items: baseline;
            gap: 12px;
          }

          .mx-count-pill {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.75rem;
            font-weight: 700;
            background: #fef9c3;
            color: #854d0e;
            padding: 3px 10px;
            border-radius: 20px;
          }

          .mx-page-sub {
            color: #64748b;
            font-size: 0.875rem;
            margin-top: 4px;
          }

          .mx-tabs {
            display: flex;
            gap: 4px;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 4px;
            margin-bottom: 1.5rem;
            width: fit-content;
          }

          .mx-tab {
            padding: 7px 20px;
            border-radius: 7px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            background: none;
            font-family: 'DM Sans', sans-serif;
            color: #64748b;
            transition: all 0.15s;
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .mx-tab:hover {
            color: #0f172a;
          }

          .mx-tab.active {
            background: #0f172a;
            color: #fff;
          }

          .mx-tab-badge {
            background: rgba(255,255,255,0.2);
            font-size: 0.7rem;
            padding: 1px 7px;
            border-radius: 20px;
            font-weight: 700;
          }

          .mx-tab:not(.active) .mx-tab-badge {
            background: #f1f5f9;
            color: #64748b;
          }

          .mx-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 10px;
          }

          .mx-toolbar-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .mx-search-wrap {
            display: flex;
            align-items: center;
            background: #fff;
            border: 1.5px solid #e2e8f0;
            border-radius: 9px;
            padding: 0 12px;
            gap: 8px;
            transition: border-color 0.15s;
          }

          .mx-search-wrap:focus-within {
            border-color: #3b82f6;
          }

          .mx-search-input {
            border: none;
            background: transparent;
            padding: 8px 0;
            font-size: 0.85rem;
            color: #0f172a;
            outline: none;
            font-family: 'DM Sans', sans-serif;
            width: 200px;
          }

          .mx-search-clear {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 11px;
          }

          .mx-filter-input {
            padding: 8px 12px;
            border: 1.5px solid #e2e8f0;
            border-radius: 9px;
            font-size: 0.85rem;
            background: #fff;
            outline: none;
            font-family: 'DM Sans', sans-serif;
            color: #0f172a;
            transition: border-color 0.15s;
            width: 160px;
          }

          .mx-filter-input:focus {
            border-color: #3b82f6;
          }

          .mx-btn-filter {
            background: #f1f5f9;
            border: 1.5px solid #e2e8f0;
            color: #475569;
            padding: 8px 14px;
            border-radius: 9px;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            transition: all 0.15s;
          }

          .mx-btn-filter:hover {
            background: #e2e8f0;
          }

          .mx-btn-primary {
            background: #3b82f6;
            color: #fff;
            border: none;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s, transform 0.15s;
            font-family: 'DM Sans', sans-serif;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          }

          .mx-btn-primary:hover {
            background: #2563eb;
            transform: translateY(-1px);
          }

          .mx-btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .mx-card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
          }

          .mx-table-wrap {
            overflow-x: auto;
          }

          .mx-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }

          .mx-table thead {
            background: #f8fafc;
          }

          .mx-table th {
            padding: 10px 16px;
            text-align: left;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0;
            white-space: nowrap;
          }

          .mx-table td {
            padding: 13px 16px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
            vertical-align: middle;
          }

          .mx-table tbody tr:last-child td {
            border-bottom: none;
          }

          .mx-table tbody tr:hover td {
            background: #f8fafc;
          }

          .mx-td-num {
            color: #94a3b8;
            font-family: 'DM Mono', monospace;
            font-size: 0.75rem;
            width: 48px;
          }

          .mx-td-name {
            font-weight: 600;
            color: #0f172a;
          }

          .mx-td-date {
            font-size: 0.75rem;
            color: #94a3b8;
            white-space: nowrap;
            font-family: 'DM Mono', monospace;
          }

          .mx-value-chip {
            display: inline-flex;
            align-items: baseline;
            gap: 4px;
            background: #f0fdf4;
            color: #166534;
            font-family: 'DM Mono', monospace;
            font-size: 0.875rem;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 6px;
          }

          .mx-value-unit {
            font-size: 0.7rem;
            font-weight: 500;
            color: #4ade80;
          }

          .mx-type-chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: #eff6ff;
            color: #1d4ed8;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 6px;
          }

          .mx-unit-chip {
            display: inline-flex;
            align-items: center;
            background: #f5f3ff;
            color: #6d28d9;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 6px;
            font-family: 'DM Mono', monospace;
          }

          .mx-device-id {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: #f1f5f9;
            color: #475569;
            font-family: 'DM Mono', monospace;
            font-size: 0.75rem;
            padding: 3px 8px;
            border-radius: 6px;
          }

          .mx-td-actions {
            text-align: right;
            width: 60px;
          }

          .mx-btn-del {
            background: #fff1f2;
            color: #be123c;
            border: none;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;
            font-family: 'DM Sans', sans-serif;
          }

          .mx-btn-del:hover {
            background: #ffe4e6;
          }

          .mx-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #94a3b8;
          }

          .mx-state-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
            opacity: 0.5;
          }

          .mx-state-title {
            font-weight: 700;
            color: #475569;
            font-size: 0.95rem;
            margin-bottom: 4px;
          }

          .mx-state-sub {
            font-size: 0.8rem;
          }

          .mx-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: mx-spin 0.7s linear infinite;
            margin: 0 auto 12px;
          }

          @keyframes mx-spin {
            to {
              transform: rotate(360deg);
            }
          }

          .mx-error-box {
            background: #fff1f2;
            border: 1px solid #fecdd3;
            color: #be123c;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 1.5rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .mx-retry {
            background: #fff;
            border: 1px solid #fecdd3;
            color: #be123c;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
          }

          .mx-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15,23,42,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
            backdrop-filter: blur(2px);
          }

          .mx-modal {
            background: #fff;
            border-radius: 16px;
            width: 100%;
            max-width: 480px;
            box-shadow: 0 24px 64px rgba(0,0,0,0.18);
            animation: mx-modal-in 0.18s ease;
          }

          .mx-modal-sm {
            max-width: 420px;
          }

          @keyframes mx-modal-in {
            from {
              opacity: 0;
              transform: translateY(16px) scale(0.98);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .mx-modal-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px 0;
          }

          .mx-modal-title {
            font-family: 'Fraunces', serif;
            font-size: 1.15rem;
            font-weight: 700;
            color: #0f172a;
          }

          .mx-modal-close {
            background: #f1f5f9;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            cursor: pointer;
            color: #64748b;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
          }

          .mx-modal-close:hover {
            background: #e2e8f0;
            color: #0f172a;
          }

          .mx-modal-body {
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .mx-modal-body label {
            display: flex;
            flex-direction: column;
            gap: 5px;
            font-size: 0.8rem;
            font-weight: 600;
            color: #374151;
          }

          .mx-modal-body input,
          .mx-modal-body textarea,
          .mx-modal-body select {
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.875rem;
            color: #0f172a;
            font-family: 'DM Sans', sans-serif;
            outline: none;
            transition: border-color 0.15s;
            background: #f8fafc;
          }

          .mx-modal-body input:focus,
          .mx-modal-body textarea:focus,
          .mx-modal-body select:focus {
            border-color: #3b82f6;
            background: #fff;
          }

          .mx-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .mx-req {
            color: #ef4444;
          }

          .mx-form-error {
            background: #fff1f2;
            border: 1px solid #fecdd3;
            color: #be123c;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 0.8rem;
          }

          .mx-modal-foot {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 0 24px 20px;
          }

          .mx-btn-cancel {
            background: #f1f5f9;
            border: none;
            color: #475569;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            transition: background 0.15s;
          }

          .mx-btn-cancel:hover {
            background: #e2e8f0;
          }

          .mx-btn-cancel:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .mx-btn-danger {
            background: #ef4444;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            transition: background 0.15s;
          }

          .mx-btn-danger:hover {
            background: #dc2626;
          }

          .mx-btn-danger:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .mx-main {
              padding: 1.25rem 1rem 2rem;
            }

            .mx-page-header {
              flex-direction: column;
              align-items: stretch;
            }

            .mx-form-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <main className="mx-main">
          <div className="mx-page-header">
            <div>
              <h1 className="mx-page-title">
                Métricas
                <span className="mx-count-pill">
                  {tab === "metrics" ? metrics.length : types.length} registradas
                </span>
              </h1>
              <p className="mx-page-sub">
                Monitoreo y tipos de métricas de dispositivos
              </p>
            </div>

            <button
              className="mx-btn-primary"
              onClick={() =>
                tab === "metrics"
                  ? setShowMetricModal(true)
                  : setShowTypeModal(true)
              }
              disabled={
                tab === "metrics"
                  ? !permissions?.canEdit
                  : user.role !== "admin"
              }
            >
              + {tab === "metrics" ? "Registrar métrica" : "Nuevo tipo"}
            </button>
          </div>

          <div className="mx-tabs">
            <button
              className={`mx-tab ${tab === "metrics" ? "active" : ""}`}
              onClick={() => {
                setTab("metrics");
                setSearch("");
              }}
            >
              📊 Métricas <span className="mx-tab-badge">{metrics.length}</span>
            </button>

            {user.role !== "user" && (
              <button
                className={`mx-tab ${tab === "types" ? "active" : ""}`}
                onClick={() => {
                  setTab("types");
                  setSearch("");
                }}
              >
                🏷️ Tipos <span className="mx-tab-badge">{types.length}</span>
              </button>
            )}
          </div>

          <div className="mx-toolbar">
            <div className="mx-toolbar-left">
              <div className="mx-search-wrap">
                <span style={{ color: "#94a3b8", fontSize: 14 }}>🔍</span>
                <input
                  className="mx-search-input"
                  placeholder={
                    tab === "metrics"
                      ? "Buscar por dispositivo, tipo o valor…"
                      : "Buscar por nombre o unidad…"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="mx-search-clear"
                    onClick={() => setSearch("")}
                  >
                    ✕
                  </button>
                )}
              </div>

              {tab === "metrics" && (
                <>
                  <input
                    className="mx-filter-input"
                    placeholder="ID Dispositivo"
                    value={filterDeviceId}
                    onChange={(e) => setFilterDeviceId(e.target.value)}
                  />

                  <input
                    className="mx-filter-input"
                    placeholder="ID Tipo métrica"
                    value={filterTypeId}
                    onChange={(e) => setFilterTypeId(e.target.value)}
                  />

                  <button className="mx-btn-filter" onClick={fetchMetrics}>
                    Filtrar
                  </button>
                </>
              )}
            </div>
          </div>

          {tab === "metrics" && (
            <div className="mx-card">
              {metricsLoading ? (
                <div className="mx-state">
                  <div className="mx-spinner" />
                  <p className="mx-state-sub">Cargando métricas…</p>
                </div>
              ) : metricsError ? (
                <div className="mx-error-box">
                  <span>⚠ {metricsError}</span>
                  <button className="mx-retry" onClick={fetchMetrics}>
                    Reintentar
                  </button>
                </div>
              ) : filteredMetrics.length === 0 ? (
                <div className="mx-state">
                  <div className="mx-state-icon">📊</div>
                  <div className="mx-state-title">
                    {search ? "Sin resultados" : "No hay métricas"}
                  </div>
                  <p className="mx-state-sub">
                    {search
                      ? "Intenta con otros términos."
                      : "Registra la primera métrica."}
                  </p>
                </div>
              ) : (
                <div className="mx-table-wrap">
                  <table className="mx-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Dispositivo</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Registrado</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredMetrics.map((m, i) => (
                        <tr key={m.id}>
                          <td className="mx-td-num">
                            {String(i + 1).padStart(2, "0")}
                          </td>

                          <td>
                            <span className="mx-device-id">
                              🖥 {m.device_id}
                            </span>
                          </td>

                          <td>
                            <span className="mx-type-chip">
                              📌 {m.metric_type || getTypeName(m.metric_type_id)}
                            </span>
                          </td>

                          <td>
                            <span className="mx-value-chip">
                              {m.value}
                              {m.unit && (
                                <span className="mx-value-unit">{m.unit}</span>
                              )}
                            </span>
                          </td>

                          <td className="mx-td-date">
                            {formatDate(m.recorded_at || m.created_at)}
                          </td>

                          <td className="mx-td-actions">
                            {permissions?.canDelete && (
                              <button
                                className="mx-btn-del"
                                onClick={() => setDeleteMetricTarget(m)}
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "types" && (
            <div className="mx-card">
              {typesLoading ? (
                <div className="mx-state">
                  <div className="mx-spinner" />
                  <p className="mx-state-sub">Cargando tipos…</p>
                </div>
              ) : typesError ? (
                <div className="mx-error-box">
                  <span>⚠ {typesError}</span>
                  <button className="mx-retry" onClick={fetchTypes}>
                    Reintentar
                  </button>
                </div>
              ) : filteredTypes.length === 0 ? (
                <div className="mx-state">
                  <div className="mx-state-icon">🏷️</div>
                  <div className="mx-state-title">
                    {search ? "Sin resultados" : "No hay tipos de métrica"}
                  </div>
                  <p className="mx-state-sub">
                    {search
                      ? "Intenta con otros términos."
                      : "Crea el primer tipo."}
                  </p>
                </div>
              ) : (
                <div className="mx-table-wrap">
                  <table className="mx-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Unidad</th>
                        <th>Descripción</th>
                        <th>Creado</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTypes.map((t, i) => (
                        <tr key={t.id}>
                          <td className="mx-td-num">
                            {String(i + 1).padStart(2, "0")}
                          </td>

                          <td className="mx-td-name">{t.name}</td>

                          <td>
                            {t.unit ? (
                              <span className="mx-unit-chip">{t.unit}</span>
                            ) : (
                              <span style={{ color: "#cbd5e1" }}>—</span>
                            )}
                          </td>

                          <td style={{ color: "#64748b", maxWidth: 260 }}>
                            {t.description || (
                              <span style={{ color: "#cbd5e1" }}>—</span>
                            )}
                          </td>

                          <td className="mx-td-date">
                            {formatDate(t.created_at)}
                          </td>

                          <td className="mx-td-actions">
                            {user.role === "admin" && (
                              <button
                                className="mx-btn-del"
                                onClick={() => setDeleteTypeTarget(t)}
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {showMetricModal && (
          <div
            className="mx-overlay"
            onClick={() => setShowMetricModal(false)}
          >
            <div className="mx-modal" onClick={(e) => e.stopPropagation()}>
              <div className="mx-modal-head">
                <h2 className="mx-modal-title">Registrar métrica</h2>
                <button
                  className="mx-modal-close"
                  onClick={() => setShowMetricModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="mx-modal-body">
                {metricFormError && (
                  <p className="mx-form-error">⚠ {metricFormError}</p>
                )}

                <label>
                  ID Dispositivo <span className="mx-req">*</span>
                  <input
                    type="number"
                    value={metricForm.device_id}
                    onChange={(e) =>
                      setMetricForm({
                        ...metricForm,
                        device_id: e.target.value,
                      })
                    }
                    placeholder="Ej: 1"
                    autoFocus
                  />
                </label>

                <label>
                  Tipo de métrica <span className="mx-req">*</span>
                  <select
                    value={metricForm.metric_type_id}
                    onChange={(e) =>
                      setMetricForm({
                        ...metricForm,
                        metric_type_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar tipo…</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                        {t.unit ? ` (${t.unit})` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Valor <span className="mx-req">*</span>
                  <input
                    type="number"
                    step="any"
                    value={metricForm.value}
                    onChange={(e) =>
                      setMetricForm({
                        ...metricForm,
                        value: e.target.value,
                      })
                    }
                    placeholder="Ej: 98.6"
                  />
                </label>
              </div>

              <div className="mx-modal-foot">
                <button
                  className="mx-btn-cancel"
                  onClick={() => setShowMetricModal(false)}
                  disabled={metricSaving}
                >
                  Cancelar
                </button>

                <button
                  className="mx-btn-primary"
                  onClick={handleCreateMetric}
                  disabled={metricSaving}
                >
                  {metricSaving ? "Guardando…" : "Registrar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showTypeModal && (
          <div className="mx-overlay" onClick={() => setShowTypeModal(false)}>
            <div className="mx-modal" onClick={(e) => e.stopPropagation()}>
              <div className="mx-modal-head">
                <h2 className="mx-modal-title">Nuevo tipo de métrica</h2>
                <button
                  className="mx-modal-close"
                  onClick={() => setShowTypeModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="mx-modal-body">
                {typeFormError && (
                  <p className="mx-form-error">⚠ {typeFormError}</p>
                )}

                <label>
                  Nombre <span className="mx-req">*</span>
                  <input
                    type="text"
                    value={typeForm.name}
                    onChange={(e) =>
                      setTypeForm({
                        ...typeForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Ej: Temperatura"
                    autoFocus
                  />
                </label>

                <div className="mx-form-row">
                  <label>
                    Unidad
                    <input
                      type="text"
                      value={typeForm.unit}
                      onChange={(e) =>
                        setTypeForm({
                          ...typeForm,
                          unit: e.target.value,
                        })
                      }
                      placeholder="Ej: °C"
                    />
                  </label>
                </div>

                <label>
                  Descripción
                  <textarea
                    value={typeForm.description}
                    onChange={(e) =>
                      setTypeForm({
                        ...typeForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descripción opcional…"
                    rows={2}
                  />
                </label>
              </div>

              <div className="mx-modal-foot">
                <button
                  className="mx-btn-cancel"
                  onClick={() => setShowTypeModal(false)}
                  disabled={typeSaving}
                >
                  Cancelar
                </button>

                <button
                  className="mx-btn-primary"
                  onClick={handleCreateType}
                  disabled={typeSaving}
                >
                  {typeSaving ? "Creando…" : "Crear tipo"}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteMetricTarget && (
          <div
            className="mx-overlay"
            onClick={() => setDeleteMetricTarget(null)}
          >
            <div
              className="mx-modal mx-modal-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-modal-head">
                <h2 className="mx-modal-title">Eliminar métrica</h2>
                <button
                  className="mx-modal-close"
                  onClick={() => setDeleteMetricTarget(null)}
                >
                  ✕
                </button>
              </div>

              <div className="mx-modal-body">
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  ¿Confirmas eliminar la métrica{" "}
                  <strong style={{ color: "#0f172a" }}>
                    #{deleteMetricTarget.id}
                  </strong>{" "}
                  con valor{" "}
                  <strong style={{ color: "#0f172a" }}>
                    {deleteMetricTarget.value}
                    {deleteMetricTarget.unit
                      ? ` ${deleteMetricTarget.unit}`
                      : ""}
                  </strong>
                  ? Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="mx-modal-foot">
                <button
                  className="mx-btn-cancel"
                  onClick={() => setDeleteMetricTarget(null)}
                  disabled={deleting}
                >
                  Cancelar
                </button>

                <button
                  className="mx-btn-danger"
                  onClick={handleDeleteMetric}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando…" : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteTypeTarget && (
          <div className="mx-overlay" onClick={() => setDeleteTypeTarget(null)}>
            <div
              className="mx-modal mx-modal-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-modal-head">
                <h2 className="mx-modal-title">Eliminar tipo</h2>
                <button
                  className="mx-modal-close"
                  onClick={() => setDeleteTypeTarget(null)}
                >
                  ✕
                </button>
              </div>

              <div className="mx-modal-body">
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  ¿Confirmas eliminar el tipo{" "}
                  <strong style={{ color: "#0f172a" }}>
                    {deleteTypeTarget.name}
                  </strong>
                  ? Esto puede afectar métricas existentes asociadas.
                </p>
              </div>

              <div className="mx-modal-foot">
                <button
                  className="mx-btn-cancel"
                  onClick={() => setDeleteTypeTarget(null)}
                  disabled={deleting}
                >
                  Cancelar
                </button>

                <button
                  className="mx-btn-danger"
                  onClick={handleDeleteType}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando…" : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppChrome>
  );
}