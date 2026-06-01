import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppChrome from "../components/AppChrome";
import DeviceDetailsModal from "../components/DeviceDetailsModal";
import { getUserProfile, logout } from "../services/authService";
import {
  createDevice,
  createDeviceType,
  deleteDevice,
  deleteDeviceType,
  getDeviceTypes,
  getDevices,
  updateDevice,
  updateDeviceType,
} from "../services/deviceService";
import { getLocations } from "../services/locationService";
import { getUsers } from "../services/userService";
import type { User } from "../types/auth";
import type { Device, DeviceType } from "../types/device";
import type { HospitalLocation } from "../types/location";
import type { UserData } from "../types/user";
import { rolePermissionsMap } from "../utils/permissions";
import "./management.css";

type Tab = "types" | "devices";
type ModalMode = "create" | "edit" | null;

const emptyType: Partial<DeviceType> = { name: "", description: "", category: "", is_active: true };
const emptyDevice: Partial<Device> = {
  name: "",
  hostname: "",
  ip_address: "",
  serial_number: "",
  brand: "",
  model: "",
  status: "active",
  description: "",
  device_type_id: "",
  location_id: "",
  user_id: "",
};

export default function Devices() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("devices");
  const [devices, setDevices] = useState<Device[]>([]);
  const [types, setTypes] = useState<DeviceType[]>([]);
  const [locations, setLocations] = useState<HospitalLocation[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeMode, setTypeMode] = useState<ModalMode>(null);
  const [deviceMode, setDeviceMode] = useState<ModalMode>(null);
  const [selectedType, setSelectedType] = useState<DeviceType | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [detailDevice, setDetailDevice] = useState<Device | null>(null);
  const [typeForm, setTypeForm] = useState<Partial<DeviceType>>(emptyType);
  const [deviceForm, setDeviceForm] = useState<Partial<Device>>(emptyDevice);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserProfile().then(setUser).catch(() => { logout(); navigate("/login"); });
  }, [navigate]);

  const permissions = user ? rolePermissionsMap[user.role] : null;
  const canManageDevice = user?.role === "admin" || user?.role === "technician";
  const canDeleteDevice = user?.role === "admin";
  const canManageType = user?.role === "admin";

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [deviceData, typeData, locationData] = await Promise.all([
        getDevices(),
        getDeviceTypes(),
        getLocations().catch(() => []),
      ]);
      setDevices(deviceData);
      setTypes(typeData);
      setLocations(locationData);
      if (user?.role === "admin") {
        setUsers(await getUsers().catch(() => []));
      }
    } catch (err) {
      setError((err as Error).message || "Could not load devices.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        void loadData();
      });
    }
  }, [user, loadData]);

  const typeName = useCallback(
    (id?: string | number) => types.find((item) => String(item.id) === String(id))?.name || `Type ${id || "-"}`,
    [types]
  );

  const locationName = useCallback(
    (id?: string | number) => locations.find((item) => String(item.id) === String(id))?.name || (id ? `Location ${id}` : "-"),
    [locations]
  );

  const filteredTypes = useMemo(() => {
    const q = search.toLowerCase();
    return types.filter((item) => item.name.toLowerCase().includes(q) || (item.category || "").toLowerCase().includes(q));
  }, [search, types]);

  const filteredDevices = useMemo(() => {
    const q = search.toLowerCase();
    return devices.filter((item) =>
      [item.name, item.hostname, item.serial_number, item.brand, item.model, item.status, typeName(item.device_type_id), locationName(item.location_id)]
        .some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [devices, search, typeName, locationName]);

  const openTypeModal = (item?: DeviceType) => {
    setSelectedType(item || null);
    setTypeForm(item ? { ...item } : emptyType);
    setFormError("");
    setTypeMode(item ? "edit" : "create");
  };

  const openDeviceModal = (item?: Device) => {
    setSelectedDevice(item || null);
    setDeviceForm(item ? { ...item } : emptyDevice);
    setFormError("");
    setDeviceMode(item ? "edit" : "create");
  };

  const saveType = async () => {
    if (!typeForm.name?.trim()) return setFormError("Name is required.");
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        name: typeForm.name.trim(),
        description: typeForm.description?.trim() || undefined,
        category: typeForm.category?.trim() || undefined,
        is_active: typeForm.is_active !== false,
      };
      if (typeMode === "edit" && selectedType) {
        const updated = await updateDeviceType(selectedType.id, payload);
        setTypes((prev) => prev.map((item) => String(item.id) === String(updated.id) ? updated : item));
      } else {
        const created = await createDeviceType(payload);
        setTypes((prev) => [created, ...prev]);
      }
      setTypeMode(null);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveDevice = async () => {
    if (!deviceForm.name?.trim()) return setFormError("Name is required.");
    if (!deviceForm.device_type_id) return setFormError("Please select a device type.");
    setSaving(true);
    setFormError("");
    const payload: Partial<Device> = {
      name: deviceForm.name?.trim(),
      hostname: deviceForm.hostname?.trim() || undefined,
      ip_address: deviceForm.ip_address?.trim() || undefined,
      serial_number: deviceForm.serial_number?.trim() || undefined,
      brand: deviceForm.brand?.trim() || undefined,
      model: deviceForm.model?.trim() || undefined,
      status: deviceForm.status || "active",
      description: deviceForm.description?.trim() || undefined,
      device_type_id: Number(deviceForm.device_type_id),
      location_id: deviceForm.location_id ? Number(deviceForm.location_id) : undefined,
      user_id: deviceForm.user_id ? Number(deviceForm.user_id) : undefined,
    };
    try {
      if (deviceMode === "edit" && selectedDevice) {
        const updated = await updateDevice(selectedDevice.id, payload);
        setDevices((prev) => prev.map((item) => String(item.id) === String(updated.id) ? updated : item));
      } else {
        const created = await createDevice(payload);
        setDevices((prev) => [created, ...prev]);
      }
      setDeviceMode(null);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const removeType = async (item: DeviceType) => {
    if (!canManageType || !window.confirm(`Delete type ${item.name}?`)) return;
    await deleteDeviceType(item.id);
    setTypes((prev) => prev.filter((type) => String(type.id) !== String(item.id)));
  };

  const removeDevice = async (item: Device) => {
    if (!canDeleteDevice || !window.confirm(`Delete device ${item.name}?`)) return;
    await deleteDevice(item.id);
    setDevices((prev) => prev.filter((device) => String(device.id) !== String(item.id)));
  };

  if (!user || !permissions) return <div className="mg-loading">Loading...</div>;

  return (
    <AppChrome user={user} active="devices">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />

      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Devices</h1>
          <p className="mg-page-sub">Manage registered device types and medical equipment</p>
        </div>
        <button
          className="mg-btn-primary"
          onClick={() => tab === "types" ? openTypeModal() : openDeviceModal()}
          disabled={tab === "types" ? !canManageType : !canManageDevice}
        >
          <i className="ti ti-plus" aria-hidden="true" />
          {tab === "types" ? "New type" : "New device"}
        </button>
      </div>

      <div className="mg-tabs">
        <button
          className={`mg-tab ${tab === "devices" ? "active" : ""}`}
          onClick={() => { setTab("devices"); setSearch(""); }}
        >
          <i className="ti ti-device-desktop" aria-hidden="true" />
          Devices <span>{devices.length}</span>
        </button>
        <button
          className={`mg-tab ${tab === "types" ? "active" : ""}`}
          onClick={() => { setTab("types"); setSearch(""); }}
        >
          <i className="ti ti-category" aria-hidden="true" />
          Device types <span>{types.length}</span>
        </button>
      </div>

      <div className="mg-toolbar">
        <input
          className="mg-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search..."
        />
        <button className="mg-btn-secondary" onClick={loadData}>
          <i className="ti ti-refresh" aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="mg-card">
        {loading ? (
          <div className="mg-state">Loading devices...</div>
        ) : error ? (
          <div className="mg-error">
            <i className="ti ti-x" aria-hidden="true" />
            {error}
          </div>
        ) : tab === "types" ? (
          <div className="mg-table-wrap">
            <table className="mg-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTypes.map((item) => (
                  <tr key={item.id}>
                    <td className="mg-mono">{item.id}</td>
                    <td className="mg-name">{item.name}</td>
                    <td>{item.category || "-"}</td>
                    <td>
                      <span className={`mg-badge ${item.is_active === false ? "inactive" : "active"}`}>
                        {item.is_active === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td>{item.description || "-"}</td>
                    <td className="mg-actions">
                      {canManageType && (
                        <button className="mg-btn-edit" onClick={() => openTypeModal(item)}>
                          <i className="ti ti-pencil" aria-hidden="true" />
                          Edit
                        </button>
                      )}
                      {canManageType && (
                        <button className="mg-btn-danger" onClick={() => removeType(item)}>
                          <i className="ti ti-trash" aria-hidden="true" />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mg-table-wrap">
            <table className="mg-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Brand / Model</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((item) => (
                  <tr key={item.id}>
                    <td className="mg-mono">{item.id}</td>
                    <td className="mg-name">{item.name}</td>
                    <td>{typeName(item.device_type_id)}</td>
                    <td>
                      <span className={`mg-badge ${item.status === "active" ? "active" : "inactive"}`}>
                        {item.status || "-"}
                      </span>
                    </td>
                    <td>{[item.brand, item.model].filter(Boolean).join(" / ") || "-"}</td>
                    <td>{locationName(item.location_id)}</td>
                    <td className="mg-actions">
                      <button className="mg-btn-secondary" onClick={() => setDetailDevice(item)}>
                        <i className="ti ti-eye" aria-hidden="true" />
                        Details
                      </button>
                      {canManageDevice && (
                        <button className="mg-btn-edit" onClick={() => openDeviceModal(item)}>
                          <i className="ti ti-pencil" aria-hidden="true" />
                          Edit
                        </button>
                      )}
                      {canDeleteDevice && (
                        <button className="mg-btn-danger" onClick={() => removeDevice(item)}>
                          <i className="ti ti-trash" aria-hidden="true" />
                          Delete
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

      <DeviceDetailsModal
        device={detailDevice}
        deviceTypes={types}
        locations={locations}
        users={users}
        onClose={() => setDetailDevice(null)}
      />

      {/* Type modal */}
      {typeMode && (
        <div className="dev-overlay" onClick={() => setTypeMode(null)}>
          <div className="dev-modal" onClick={(event) => event.stopPropagation()}>
            <div className="dev-modal-head">
              <h2 className="dev-modal-title">
                {typeMode === "edit" ? "Edit type" : "New type"}
              </h2>
              <button className="dev-modal-close" onClick={() => setTypeMode(null)} aria-label="Close">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            <div className="dev-modal-body">
              {formError && (
                <p className="mg-error">
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  {formError}
                </p>
              )}
              <label>
                Name
                <input
                  value={typeForm.name || ""}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                />
              </label>
              <label>
                Category
                <input
                  value={typeForm.category || ""}
                  onChange={(e) => setTypeForm({ ...typeForm, category: e.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  value={typeForm.description || ""}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                />
              </label>
              <label className="mg-check">
                <input
                  type="checkbox"
                  checked={typeForm.is_active !== false}
                  onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="dev-modal-foot">
              <button className="mg-btn-secondary" onClick={() => setTypeMode(null)}>Cancel</button>
              <button className="mg-btn-primary" onClick={saveType} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device modal */}
      {deviceMode && (
        <div className="dev-overlay" onClick={() => setDeviceMode(null)}>
          <div className="dev-modal dev-modal-lg" onClick={(event) => event.stopPropagation()}>
            <div className="dev-modal-head">
              <h2 className="dev-modal-title">
                {deviceMode === "edit" ? "Edit device" : "New device"}
              </h2>
              <button className="dev-modal-close" onClick={() => setDeviceMode(null)} aria-label="Close">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            <div className="dev-modal-body dev-form-grid">
              {formError && (
                <p className="mg-error dev-span-2">
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  {formError}
                </p>
              )}
              <label>
                Name
                <input
                  value={deviceForm.name || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                />
              </label>
              <label>
                Type
                <select
                  value={deviceForm.device_type_id || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, device_type_id: e.target.value })}
                >
                  <option value="">Select...</option>
                  {types.filter((t) => t.is_active !== false).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={deviceForm.status || "active"}
                  onChange={(e) => setDeviceForm({ ...deviceForm, status: e.target.value })}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="maintenance">maintenance</option>
                  <option value="retired">retired</option>
                </select>
              </label>
              <label>
                Location
                <select
                  value={deviceForm.location_id || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, location_id: e.target.value })}
                >
                  <option value="">No location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Hostname
                <input
                  value={deviceForm.hostname || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, hostname: e.target.value })}
                />
              </label>
              <label>
                IP Address
                <input
                  value={deviceForm.ip_address || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, ip_address: e.target.value })}
                />
              </label>
              <label>
                Serial number
                <input
                  value={deviceForm.serial_number || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, serial_number: e.target.value })}
                />
              </label>
              <label>
                Brand
                <input
                  value={deviceForm.brand || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })}
                />
              </label>
              <label>
                Model
                <input
                  value={deviceForm.model || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })}
                />
              </label>
              <label>
                Assigned user
                <input
                  type="number"
                  value={deviceForm.user_id || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, user_id: e.target.value })}
                  placeholder="User ID"
                />
              </label>
              <label className="dev-span-2">
                Description
                <textarea
                  value={deviceForm.description || ""}
                  onChange={(e) => setDeviceForm({ ...deviceForm, description: e.target.value })}
                />
              </label>
            </div>
            <div className="dev-modal-foot">
              <button className="mg-btn-secondary" onClick={() => setDeviceMode(null)}>Cancel</button>
              <button className="mg-btn-primary" onClick={saveDevice} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppChrome>
  );
}