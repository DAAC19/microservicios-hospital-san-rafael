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
      } catch (error) {
        console.error("Error loading user profile:", error);
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

        if (isMounted) {
          setDevices(devicesData);
        }

        try {
          const locationsData = await getLocations();

          if (isMounted) {
            setLocations(locationsData);
          }
        } catch (error) {
          console.error("Error loading locations:", error);
        }

        if (permissions?.canViewAlerts) {
          try {
            const alertsData = await getAlerts();

            if (isMounted) {
              setAlerts(alertsData);
            }
          } catch (error) {
            console.error("Error loading alerts:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        if (isMounted) {
          setError("Error al cargar los datos. Por favor, intenta de nuevo.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user && permissions) {
      fetchAllData();
    }

    return () => {
      isMounted = false;
    };
  }, [user, permissions]);

    let filteredDevices = [...devices];

    if (user?.role === "technician") {
    filteredDevices = filteredDevices.filter((device) => {
        if (!device.assigned_user_id) return true;

        return String(device.assigned_user_id) === String(user.id);
    });
    }

    if (searchTerm.trim()) {
    const search = searchTerm.toLowerCase();

    filteredDevices = filteredDevices.filter((device) => {
        const deviceName = device.name || device.nombre || "";
        const deviceId = String(device.id);

        return (
        deviceName.toLowerCase().includes(search) ||
        deviceId.toLowerCase().includes(search)
        );
    });
    }

    if (selectedStatus !== "all") {
    filteredDevices = filteredDevices.filter((device) => {
        const status = device.status || device.estado || "";
        return status.toLowerCase() === selectedStatus.toLowerCase();
    });
    }

    if (selectedLocation !== "all") {
    filteredDevices = filteredDevices.filter(
        (device) => String(device.location_id) === String(selectedLocation)
    );
    }

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDevices();
      setDevices(data);

      if (permissions?.canViewAlerts) {
        try {
          const alertsData = await getAlerts();
          setAlerts(alertsData);
        } catch (error) {
          console.error("Error refreshing alerts:", error);
        }
      }
    } catch (error) {
      console.error("Error refreshing devices:", error);
      setError("No se pudieron actualizar los dispositivos.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditDevice = (deviceId: string | number) => {
    if (!permissions?.canEdit) return;

    alert(`Editar dispositivo ${deviceId}. No disponible.`);
  };

  const handleDeleteDevice = async (deviceId: string | number) => {
    if (!permissions?.canDelete) return;

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este dispositivo?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDevice(deviceId);

      setDevices((prevDevices) =>
        prevDevices.filter((device) => String(device.id) !== String(deviceId))
      );
    } catch (error) {
      console.error("Error deleting device:", error);
      setError("Error al eliminar el dispositivo.");
    }
  };

  const normalizeStatusClass = (status?: string) => {
    const value = String(status || "inactive")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (value.includes("activo")) return "active";
    if (value.includes("inactivo")) return "inactive";
    if (value.includes("mantenimiento")) return "maintenance";

    return "inactive";
  };

  const getLocationName = (locationId?: string | number) => {
    if (!locationId) return "Sin ubicación";

    const location = locations.find(
      (item) => String(item.id) === String(locationId)
    );

    return location?.name || `Ubicación ${locationId}`;
  };

  const stats = [
    {
      label: "Dispositivos",
      value: filteredDevices.length,
      icon: "🩺",
      color: "#0d6efd",
      visible: permissions?.canViewAll !== false || user?.role === "technician",
    },
    {
      label: "Alertas críticas",
      value: alerts.filter(
        (alert) => alert.severity?.toLowerCase() === "critical"
      ).length,
      icon: "⚠️",
      color: "#f59e0b",
      visible: permissions?.canViewAlerts === true,
    },
    {
      label: "Activos",
      value: filteredDevices.filter((device) =>
        String(device.status || device.estado || "")
          .toLowerCase()
          .includes("activo")
      ).length,
      icon: "📊",
      color: "#10b981",
      visible: permissions?.canViewAll !== false || user?.role === "technician",
    },
    {
      label: "Ubicaciones",
      value: locations.length,
      icon: "📍",
      color: "#8b5cf6",
      visible: permissions?.canViewAll === true,
    },
  ];

  if (!user || !permissions) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", minHeight: "100vh" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⟳</div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Poppins:wght@600;700;800&display=swap');

        :root {
          --primary: #0d6efd;
          --primary-dark: #0b5ed7;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --dark: #1f2937;
          --light: #f9fafb;
          --gray: #6b7280;
        }

        * {
          font-family: 'Sora', sans-serif;
        }

        .navbar-custom {
          background: linear-gradient(135deg, #063b8f 0%, #052f73 55%, #03265c 100%);
          box-shadow: 0 4px 20px rgba(3, 38, 92, 0.22);
          padding: 1rem 2.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-brand {
          font-family: 'Poppins', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          color: white;
          margin: 0;
        }

        .navbar-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.15);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .role-badge {
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .btn-nav {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-nav:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2.5rem;
        }

        .dashboard-header {
          margin-bottom: 2.5rem;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dashboard-title {
          font-family: 'Poppins', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          color: var(--gray);
          font-size: 0.95rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 14px;
          padding: 1.75rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          animation: slideUp 0.6s ease-out;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .stat-icon {
          font-size: 1.8rem;
        }

        .stat-label {
          color: var(--gray);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-family: 'Poppins', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
        }

        .devices-card {
          background: white;
          border-radius: 14px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          animation: slideUp 0.6s ease-out 0.1s both;
        }

        .card-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title {
          font-family: 'Poppins', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--dark);
          margin: 0;
        }

        .header-subtitle {
          color: var(--gray);
          font-size: 0.9rem;
          margin: 0.5rem 0 0 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input,
        .select-input {
          padding: 0.65rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .search-input {
          min-width: 220px;
          background: #f9fafb;
        }

        .search-input:focus,
        .select-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
        }

        .select-input {
          background: white;
          cursor: pointer;
        }

        .btn-action {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-action:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 110, 253, 0.3);
        }

        .btn-action:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .card-body {
          padding: 2rem;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .devices-table {
          width: 100%;
          border-collapse: collapse;
        }

        .devices-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .devices-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 700;
          color: var(--dark);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .devices-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: var(--dark);
        }

        .devices-table tbody tr:hover {
          background: #f9fafb;
        }

        .device-name {
          font-weight: 600;
          color: var(--primary);
        }

        .device-id {
          color: var(--gray);
          font-size: 0.85rem;
          font-family: monospace;
        }

        .status-badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-inactive {
          background: #fee2e2;
          color: #7f1d1d;
        }

        .status-maintenance {
          background: #fef3c7;
          color: #92400e;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit,
        .btn-delete {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
        }

        .btn-edit {
          background: #dbeafe;
          color: #1e40af;
        }

        .btn-edit:hover {
          background: #bfdbfe;
        }

        .btn-delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--gray);
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state-title {
          font-family: 'Poppins', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }

        .loading-spinner {
          text-align: center;
          padding: 3rem;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 3px solid #e5e7eb;
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-alert {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .error-alert::before {
          content: '✕';
          font-size: 1.25rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1.5rem;
          }

          .card-header {
            padding: 1.5rem;
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            flex-direction: column;
          }

          .search-input,
          .select-input,
          .btn-action {
            width: 100%;
          }

          .navbar-custom {
            padding: 1rem 1.5rem;
          }

          .navbar-content {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .navbar-actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
          }

          .devices-table {
            font-size: 0.85rem;
          }

          .devices-table th,
          .devices-table td {
            padding: 0.75rem 0.5rem;
          }

          .action-buttons {
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>

      <nav className="navbar-custom">
        <div className="navbar-content">
          <h1 className="navbar-brand">🏥 Hospital San Rafael</h1>

          <div className="navbar-actions">
            <div className="user-info">
              <div className="user-avatar">{roleInfo[user.role].icon}</div>

              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {user.username}
                </div>

                <div
                  className="role-badge"
                  style={{ backgroundColor: roleInfo[user.role].color }}
                >
                  {roleInfo[user.role].label}
                </div>
              </div>
            </div>

            <button className="btn-nav" onClick={() => navigate("/")}>
              ← Home
            </button>

            <button className="btn-nav" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>

          <p className="dashboard-subtitle">
            Panel de monitoreo de dispositivos médicos
            {user.role === "technician" && " - Dispositivos asignados"}
          </p>
        </div>

        <div className="stats-grid">
          {stats
            .filter((stat) => stat.visible)
            .map((stat, index) => (
              <div
                key={stat.label}
                className="stat-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="stat-header">
                  <div>
                    <div className="stat-label">{stat.label}</div>

                    <div className="stat-value" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>

                  <div className="stat-icon">{stat.icon}</div>
                </div>
              </div>
            ))}
        </div>

        <div className="devices-card">
          <div className="card-header">
            <div>
              <h2 className="header-title">Dispositivos registrados</h2>

              <p className="header-subtitle">
                {user.role === "technician"
                  ? "Dispositivos asignados a tu usuario"
                  : "Listado de dispositivos del sistema"}
              </p>
            </div>

            <div className="header-actions">
              {permissions.canViewAll && (
                <>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar dispositivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <select
                    className="select-input"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>

                  {locations.length > 0 && (
                    <select
                      className="select-input"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="all">Todas las ubicaciones</option>

                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}

              <button
                className="btn-action"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? "⟳ Cargando..." : "⟳ Actualizar"}
              </button>
            </div>
          </div>

          <div className="card-body">
            {loading && (
              <div className="loading-spinner">
                <div className="spinner" />
                <p>Cargando dispositivos...</p>
              </div>
            )}

            {error && <div className="error-alert">{error}</div>}

            {!loading &&
              !error &&
              filteredDevices.length === 0 &&
              devices.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <div className="empty-state-title">No hay dispositivos</div>
                  <p>Cuando existan dispositivos, aparecerán en esta tabla.</p>
                </div>
              )}

            {!loading &&
              !error &&
              filteredDevices.length === 0 &&
              devices.length > 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <div className="empty-state-title">
                    No se encontraron resultados
                  </div>
                  <p>Intenta con otros términos de búsqueda o filtros.</p>
                </div>
              )}

            {!loading && !error && filteredDevices.length > 0 && (
              <div className="table-wrapper">
                <table className="devices-table">
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
                      const deviceStatus = device.status || device.estado;

                      return (
                        <tr key={device.id}>
                          <td>
                            <div className="device-id">{device.id}</div>
                          </td>

                          <td>
                            <div className="device-name">
                              {device.name ||
                                device.nombre ||
                                "Dispositivo sin nombre"}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`status-badge status-${normalizeStatusClass(
                                deviceStatus
                              )}`}
                            >
                              {deviceStatus || "Sin estado"}
                            </span>
                          </td>

                          <td>{getLocationName(device.location_id)}</td>

                          {permissions.canEdit && (
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-edit"
                                  onClick={() => handleEditDevice(device.id)}
                                >
                                  ✏️ Editar
                                </button>

                                {permissions.canDelete && (
                                  <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteDevice(device.id)}
                                  >
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
        </div>
      </div>
    </div>
  );
}

export default Dashboard;