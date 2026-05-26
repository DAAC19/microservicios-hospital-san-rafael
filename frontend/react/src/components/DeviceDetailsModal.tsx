import type { Device, DeviceType } from "../types/device";
import type { HospitalLocation } from "../types/location";
import type { UserData } from "../types/user";

interface Props {
  device: Device | null;
  deviceTypes?: DeviceType[];
  locations?: HospitalLocation[];
  users?: UserData[];
  onClose: () => void;
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DeviceDetailsModal({ device, deviceTypes = [], locations = [], users = [], onClose }: Props) {
  if (!device) return null;

  const type = deviceTypes.find((item) => String(item.id) === String(device.device_type_id));
  const location = locations.find((item) => String(item.id) === String(device.location_id));
  const assignedUser = users.find((item) => String(item.id) === String(device.user_id));

  const rows = [
    ["ID", device.id],
    ["Nombre", device.name],
    ["Hostname", device.hostname],
    ["IP", device.ip_address],
    ["Serial", device.serial_number],
    ["Marca", device.brand],
    ["Modelo", device.model],
    ["Estado", device.status],
    ["Tipo", type ? `${type.name}${type.category ? ` (${type.category})` : ""}` : device.device_type_id],
    ["Ubicación", location ? `${location.name}${location.room ? ` - ${location.room}` : ""}` : device.location_id],
    ["Usuario asignado", assignedUser ? `${assignedUser.first_name} ${assignedUser.last_name}` : device.user_id],
    ["Descripción", device.description],
    ["Creado", formatDate(device.created_at)],
    ["Actualizado", formatDate(device.updated_at)],
  ];

  return (
    <div className="dev-overlay" onClick={onClose}>
      <div className="dev-modal dev-modal-lg" onClick={(event) => event.stopPropagation()}>
        <div className="dev-modal-head">
          <h2 className="dev-modal-title">Detalle del dispositivo</h2>
          <button className="dev-modal-close" onClick={onClose} type="button">x</button>
        </div>
        <div className="dev-detail-grid">
          {rows.map(([label, value]) => (
            <div className="dev-detail-row" key={String(label)}>
              <span className="dev-detail-label">{label}</span>
              <span className="dev-detail-value">{value === undefined || value === null || value === "" ? "-" : String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
