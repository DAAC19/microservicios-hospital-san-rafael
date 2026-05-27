import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { HospitalLocation } from "../types/location";
import AppChrome from "../components/AppChrome";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../services/locationService";
import { logout, getUserProfile } from "../services/authService";
import { rolePermissionsMap } from "../utils/permissions";
import type { User } from "../types/auth";

type ModalMode = "create" | "edit" | null;

interface FormState {
  name: string;
  description: string;
  building: string;
  floor: string;
  room: string;
}

const EMPTY_FORM: FormState = { name: "", description: "", building: "", floor: "", room: "" };

function locationToForm(loc: HospitalLocation): FormState {
  return {
    name: loc.name ?? "",
    description: loc.description ?? "",
    building: loc.building ?? "",
    floor: loc.floor ?? "",
    room: loc.room ?? "",
  };
}

export default function Locations() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<HospitalLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<HospitalLocation | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<HospitalLocation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    getUserProfile().then(setUser).catch(() => { logout(); navigate("/login"); });
  }, [navigate]);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLocations(await getLocations());
    } catch (e: unknown) {
      console.warn("Could not load locations", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      void fetchLocations();
    });
  }, [fetchLocations]);

  const openCreate = () => { setSelected(null); setForm(EMPTY_FORM); setFormError(null); setModalMode("create"); };
  const openEdit = (loc: HospitalLocation) => { setSelected(loc); setForm(locationToForm(loc)); setFormError(null); setModalMode("edit"); };
  const closeModal = () => { setModalMode(null); setSelected(null); setForm(EMPTY_FORM); setFormError(null); };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    setSaving(true); setFormError(null);
    try {
      const payload: Partial<HospitalLocation> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        building: form.building.trim() || undefined,
        floor: form.floor.trim() || undefined,
        room: form.room.trim() || undefined,
      };
      if (modalMode === "create") {
        const created = await createLocation(payload);
        setLocations((prev) => [created, ...prev]);
      } else if (modalMode === "edit" && selected) {
        const updated = await updateLocation(selected.id, payload);
        setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      }
      closeModal();
    } catch (e: unknown) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteLocation(deleteTarget.id);
      setLocations((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = locations.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.description ?? "").toLowerCase().includes(q) ||
      (l.building ?? "").toLowerCase().includes(q) ||
      (l.floor ?? "").toLowerCase().includes(q) ||
      (l.room ?? "").toLowerCase().includes(q)
    );
  });

  const formatDate = (val?: string) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  const permissions = user ? rolePermissionsMap[user.role] : null;

  if (!user) return <div className="mg-loading">Loading...</div>;

  return (
    <AppChrome user={user} active="locations">
      <div className="lc-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,700;0,800;1,700&display=swap');
          @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .lc-root {
            min-height: auto;
            background: transparent;
            font-family: 'DM Sans', sans-serif;
            display: flex;
            flex-direction: column;
          }

          .lc-main {
            flex: 1;
            max-width: 1380px;
            width: 100%;
            margin: 0 auto;
            padding: 2rem 2rem 3rem;
          }

          .lc-page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.75rem;
            flex-wrap: wrap;
            gap: 12px;
          }

          .lc-page-header-left {}

          .lc-page-title {
            font-family: 'Fraunces', serif;
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
            display: flex;
            align-items: baseline;
            gap: 12px;
          }

          .lc-count-pill {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.75rem;
            font-weight: 700;
            background: #e0f2fe;
            color: #0284c7;
            padding: 3px 10px;
            border-radius: 20px;
            letter-spacing: 0.3px;
          }

          .lc-page-sub { color: #64748b; font-size: 0.875rem; margin-top: 4px; }

          .lc-btn-primary {
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
          .lc-btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
          .lc-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

          .lc-search-wrap {
            display: flex;
            align-items: center;
            background: #fff;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            padding: 0 14px;
            gap: 10px;
            margin-bottom: 1.25rem;
            transition: border-color 0.2s;
            max-width: 480px;
          }
          .lc-search-wrap:focus-within { border-color: #3b82f6; }

          .lc-search-icon { color: #94a3b8; font-size: 16px; display: flex; align-items: center; }

          .lc-search-input {
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px 0;
            font-size: 0.875rem;
            color: #0f172a;
            outline: none;
            font-family: 'DM Sans', sans-serif;
          }

          .lc-search-clear {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 16px;
            padding: 2px;
            line-height: 1;
            display: flex;
            align-items: center;
          }
          .lc-search-clear:hover { color: #475569; }

          .lc-card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
          }

          .lc-table-wrap { overflow-x: auto; }

          .lc-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }

          .lc-table thead { background: #f8fafc; }

          .lc-table th {
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

          .lc-table td {
            padding: 13px 16px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
            vertical-align: middle;
          }

          .lc-table tbody tr:last-child td { border-bottom: none; }
          .lc-table tbody tr:hover td { background: #f8fafc; }

          .lc-td-num {
            color: #94a3b8;
            font-family: 'DM Mono', monospace;
            font-size: 0.75rem;
            width: 48px;
          }

          .lc-td-name { font-weight: 600; color: #0f172a; }
          .lc-td-desc { color: #64748b; max-width: 240px; }

          .lc-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: #f1f5f9;
            color: #475569;
            font-size: 0.75rem;
            font-weight: 500;
            padding: 3px 8px;
            border-radius: 6px;
          }

          .lc-tag i { font-size: 13px; }

          .lc-td-date {
            font-size: 0.78rem;
            color: #94a3b8;
            white-space: nowrap;
            font-family: 'DM Mono', monospace;
          }

          .lc-td-actions { text-align: right; width: 90px; }
          .lc-action-btns { display: flex; gap: 6px; justify-content: flex-end; }

          .lc-btn-edit {
            background: #eff6ff;
            color: #1d4ed8;
            border: none;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;
            font-family: 'DM Sans', sans-serif;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .lc-btn-edit:hover { background: #dbeafe; }

          .lc-btn-del {
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
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .lc-btn-del:hover { background: #ffe4e6; }

          .lc-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #94a3b8;
          }

          .lc-state-icon { font-size: 2.2rem; color: #cbd5e1; margin-bottom: 10px; }
          .lc-state-title { font-weight: 700; color: #475569; font-size: 0.95rem; margin-bottom: 4px; }
          .lc-state-sub { font-size: 0.8rem; }

          .lc-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: lc-spin 0.7s linear infinite;
            margin: 0 auto 12px;
          }

          @keyframes lc-spin { to { transform: rotate(360deg); } }

          .lc-error-box {
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

          .lc-error-box-inner { display: flex; align-items: center; gap: 8px; }

          .lc-retry {
            background: #fff;
            border: 1px solid #fecdd3;
            color: #be123c;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .lc-overlay {
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

          .lc-modal {
            background: #fff;
            border-radius: 16px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 24px 64px rgba(0,0,0,0.18);
            animation: lc-modal-in 0.18s ease;
          }

          .lc-modal-sm { max-width: 420px; }

          @keyframes lc-modal-in {
            from { opacity: 0; transform: translateY(16px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          .lc-modal-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px 0;
          }

          .lc-modal-title {
            font-family: 'Fraunces', serif;
            font-size: 1.15rem;
            font-weight: 700;
            color: #0f172a;
          }

          .lc-modal-close {
            background: #f1f5f9;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            cursor: pointer;
            color: #64748b;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
          }
          .lc-modal-close:hover { background: #e2e8f0; color: #0f172a; }

          .lc-modal-body {
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .lc-modal-body label {
            display: flex;
            flex-direction: column;
            gap: 5px;
            font-size: 0.8rem;
            font-weight: 600;
            color: #374151;
          }

          .lc-modal-body input,
          .lc-modal-body textarea {
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.875rem;
            color: #0f172a;
            font-family: 'DM Sans', sans-serif;
            outline: none;
            transition: border-color 0.15s;
            resize: vertical;
            background: #f8fafc;
          }

          .lc-modal-body input:focus,
          .lc-modal-body textarea:focus { border-color: #3b82f6; background: #fff; }

          .lc-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .lc-req { color: #ef4444; }

          .lc-form-error {
            background: #fff1f2;
            border: 1px solid #fecdd3;
            color: #be123c;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .lc-modal-foot {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 0 24px 20px;
          }

          .lc-btn-cancel {
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
          .lc-btn-cancel:hover { background: #e2e8f0; }
          .lc-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

          .lc-btn-danger {
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
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .lc-btn-danger:hover { background: #dc2626; }
          .lc-btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

          @media (max-width: 768px) {
            .lc-main { padding: 1.25rem 1rem 2rem; }
            .lc-page-header { flex-direction: column; align-items: stretch; }
            .lc-form-row { grid-template-columns: 1fr; }
            .lc-table th:nth-child(3),
            .lc-table td:nth-child(3),
            .lc-table th:nth-child(7),
            .lc-table td:nth-child(7) { display: none; }
          }
        `}</style>

        {/* ── MAIN ── */}
        <main className="lc-main">
          {/* Page header */}
          <div className="lc-page-header">
            <div className="lc-page-header-left">
              <h1 className="lc-page-title">
                Locations
                <span className="lc-count-pill">{locations.length} registered</span>
              </h1>
              <p className="lc-page-sub">Manage hospital locations</p>
            </div>
            {permissions?.canEdit && (
              <button className="lc-btn-primary" onClick={openCreate}>
                <i className="ti ti-plus" aria-hidden="true"></i>
                New location
              </button>
            )}
          </div>

          {/* Search */}
          <div className="lc-search-wrap">
            <span className="lc-search-icon">
              <i className="ti ti-search" aria-hidden="true"></i>
            </span>
            <input
              className="lc-search-input"
              type="text"
              placeholder="Search by name, building, floor or room…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="lc-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                <i className="ti ti-x" aria-hidden="true"></i>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="lc-card">
            {loading ? (
              <div className="lc-state">
                <div className="lc-spinner" />
                <p className="lc-state-sub">Loading locations…</p>
              </div>
            ) : error ? (
              <div className="lc-error-box">
                <span className="lc-error-box-inner">
                  <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                  {error}
                </span>
                <button className="lc-retry" onClick={fetchLocations}>
                  <i className="ti ti-refresh" aria-hidden="true"></i>
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="lc-state">
                <div className="lc-state-icon">
                  <i className="ti ti-map-pin-off" aria-hidden="true"></i>
                </div>
                <div className="lc-state-title">
                  {search ? "No results found" : "No locations yet"}
                </div>
                <p className="lc-state-sub">
                  {search
                    ? "Try different search terms."
                    : "Create the first location using the button above."}
                </p>
              </div>
            ) : (
              <div className="lc-table-wrap">
                <table className="lc-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Building</th>
                      <th>Floor</th>
                      <th>Room</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((loc, i) => (
                      <tr key={loc.id}>
                        <td className="lc-td-num">{String(i + 1).padStart(2, "0")}</td>
                        <td className="lc-td-name">{loc.name}</td>
                        <td className="lc-td-desc">
                          {loc.description || <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td>
                          {loc.building
                            ? <span className="lc-tag"><i className="ti ti-building" aria-hidden="true"></i>{loc.building}</span>
                            : <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td>
                          {loc.floor
                            ? <span className="lc-tag"><i className="ti ti-stairs-up" aria-hidden="true"></i>{loc.floor}</span>
                            : <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td>
                          {loc.room
                            ? <span className="lc-tag"><i className="ti ti-door" aria-hidden="true"></i>{loc.room}</span>
                            : <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td className="lc-td-date">{formatDate(loc.created_at)}</td>
                        <td className="lc-td-actions">
                          <div className="lc-action-btns">
                            {permissions?.canEdit && (
                              <button className="lc-btn-edit" onClick={() => openEdit(loc)} title="Edit">
                                <i className="ti ti-pencil" aria-hidden="true"></i>
                                Edit
                              </button>
                            )}
                            {permissions?.canDelete && (
                              <button className="lc-btn-del" onClick={() => setDeleteTarget(loc)} title="Delete">
                                <i className="ti ti-trash" aria-hidden="true"></i>
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* ── CREATE / EDIT MODAL ── */}
        {modalMode && (
          <div className="lc-overlay" onClick={closeModal}>
            <div className="lc-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lc-modal-head">
                <h2 className="lc-modal-title">
                  {modalMode === "create" ? "New location" : "Edit location"}
                </h2>
                <button className="lc-modal-close" onClick={closeModal} aria-label="Close">
                  <i className="ti ti-x" aria-hidden="true"></i>
                </button>
              </div>

              <div className="lc-modal-body">
                {formError && (
                  <p className="lc-form-error">
                    <i className="ti ti-alert-circle" aria-hidden="true"></i>
                    {formError}
                  </p>
                )}

                <label>
                  Name <span className="lc-req">*</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Emergency Room"
                    autoFocus
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description…"
                    rows={2}
                  />
                </label>

                <div className="lc-form-row">
                  <label>
                    Building
                    <input
                      type="text"
                      value={form.building}
                      onChange={(e) => setForm({ ...form, building: e.target.value })}
                      placeholder="e.g. Tower A"
                    />
                  </label>
                  <label>
                    Floor
                    <input
                      type="text"
                      value={form.floor}
                      onChange={(e) => setForm({ ...form, floor: e.target.value })}
                      placeholder="e.g. 3"
                    />
                  </label>
                </div>

                <label>
                  Room
                  <input
                    type="text"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    placeholder="e.g. 302-B"
                  />
                </label>
              </div>

              <div className="lc-modal-foot">
                <button className="lc-btn-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
                <button className="lc-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><i className="ti ti-loader-2" aria-hidden="true"></i> Saving…</>
                    : modalMode === "create"
                      ? <><i className="ti ti-map-pin-plus" aria-hidden="true"></i> Create location</>
                      : <><i className="ti ti-device-floppy" aria-hidden="true"></i> Save changes</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM MODAL ── */}
        {deleteTarget && (
          <div className="lc-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="lc-modal lc-modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="lc-modal-head">
                <h2 className="lc-modal-title">Delete location</h2>
                <button className="lc-modal-close" onClick={() => setDeleteTarget(null)} aria-label="Close">
                  <i className="ti ti-x" aria-hidden="true"></i>
                </button>
              </div>
              <div className="lc-modal-body">
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6 }}>
                  Are you sure you want to delete{" "}
                  <strong style={{ color: "#0f172a" }}>{deleteTarget.name}</strong>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="lc-modal-foot">
                <button className="lc-btn-cancel" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  Cancel
                </button>
                <button className="lc-btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting
                    ? <><i className="ti ti-loader-2" aria-hidden="true"></i> Deleting…</>
                    : <><i className="ti ti-trash" aria-hidden="true"></i> Yes, delete</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppChrome>
  );
}