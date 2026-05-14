import requests
from models.deviceModel import Device
from models.deviceTypeModel import DeviceType
from extensions import db


USERS_SERVICE_URL = "http://localhost:5001/users"
LOCATIONS_SERVICE_URL = "http://localhost:5002/locations"

VALID_STATUSES = [
    "active",
    "inactive",
    "maintenance",
    "retired"
]


def validate_user(user_id):
    if not user_id:
        return True
    try:
        response = requests.get(f"{USERS_SERVICE_URL}/{user_id}")
        if response.status_code == 200:
            return True
        if response.status_code == 404:
            return False
        return None
    except requests.exceptions.RequestException:
        return None


def validate_location(location_id):
    if not location_id:
        return True
    try:
        response = requests.get(f"{LOCATIONS_SERVICE_URL}/{location_id}")
        if response.status_code == 200:
            return True
        if response.status_code == 404:
            return False
        return None
    except requests.exceptions.RequestException:
        return None


def get_user_data(user_id):
    if not user_id:
        return None
    try:
        response = requests.get(f"{USERS_SERVICE_URL}/{user_id}")
        if response.status_code == 200:
            return response.json()
        return None
    except requests.exceptions.RequestException:
        return None


def get_location_data(location_id):
    if not location_id:
        return None
    try:
        response = requests.get(f"{LOCATIONS_SERVICE_URL}/{location_id}")
        if response.status_code == 200:
            return response.json()
        return None
    except requests.exceptions.RequestException:
        return None


def get_all_devices():
    devices = Device.query.order_by(Device.id.asc()).all()
    result = []
    for device in devices:
        result.append(serialize_device(device))
    return result


def get_device_by_id(device_id):
    device = Device.query.get(device_id)
    if not device:
        return {"error": "Dispositivo no encontrado"}, 404
    return serialize_device(device)


def create_device(data):
    name = data.get("name")
    hostname = data.get("hostname")
    ip_address = data.get("ip_address")
    serial_number = data.get("serial_number")
    brand = data.get("brand")
    model = data.get("model")
    status = data.get("status", "active")
    description = data.get("description")

    device_type_id = data.get("device_type_id")
    location_id = data.get("location_id")
    user_id = data.get("user_id")

    if not name:
        return {"error": "El campo name es obligatorio"}, 400
    if not device_type_id:
        return {"error": "El campo device_type_id es obligatorio"}, 400
    if status not in VALID_STATUSES:
        return {
            "error": "Estado inválido",
            "allowed_statuses": VALID_STATUSES
        }, 400

    device_type = DeviceType.query.get(device_type_id)

    if not device_type:
        return {"error": "El tipo de dispositivo no existe"}, 400
    if device_type.is_active is False:
        return {"error": "El tipo de dispositivo está inactivo"}, 400
    user_validation = validate_user(user_id)
    
    if user_validation is None:
        return {"error": "Users service unavailable"}, 500
    
    if not user_validation:
        return {"error": "No se puede crear el dispositivo porque el usuario no existe"}, 400

    location_validation = validate_location(location_id)

    if location_validation is None:
        return {"error": "Locations service unavailable"}, 500

    if not location_validation:
        return {"error": "No se puede crear el dispositivo porque la ubicación no existe"}, 400

    new_device = Device(
        name=name,
        hostname=hostname,
        ip_address=ip_address,
        serial_number=serial_number,
        brand=brand,
        model=model,
        status=status,
        description=description,
        device_type_id=device_type_id,
        location_id=location_id,
        user_id=user_id
    )

    db.session.add(new_device)
    db.session.commit()

    return {
        "mensaje": "Dispositivo creado exitosamente",
        "device": serialize_device(new_device)
    }, 201


def update_device(device_id, data):
    device = Device.query.get(device_id)

    if not device:
        return {"mensaje": "Dispositivo no encontrado"}, 404

    new_device_type_id = data.get("device_type_id")

    if new_device_type_id:
        device_type = DeviceType.query.get(new_device_type_id)

        if not device_type:
            return {"error": "El tipo de dispositivo no existe"}, 400

        device.device_type_id = new_device_type_id

    new_status = data.get("status")

    if new_status:
        valid_statuses = ["active", "inactive", "maintenance", "retired"]

        if new_status not in valid_statuses:
            return {
                "error": "Estado inválido",
                "allowed_statuses": valid_statuses
            }, 400

        device.status = new_status

    device.name = data.get("name", device.name)
    device.hostname = data.get("hostname", device.hostname)
    device.ip_address = data.get("ip_address", device.ip_address)
    device.serial_number = data.get("serial_number", device.serial_number)
    device.brand = data.get("brand", device.brand)
    device.model = data.get("model", device.model)
    device.description = data.get("description", device.description)
    device.location_id = data.get("location_id", device.location_id)
    device.user_id = data.get("user_id", device.user_id)

    db.session.commit()

    return {
        "mensaje": "Dispositivo actualizado correctamente",
        "device": serialize_device(device)
    }, 200


def delete_device(device_id):
    device = Device.query.get(device_id)

    if not device:
        return {"error": "Dispositivo no encontrado"}, 404

    db.session.delete(device)
    db.session.commit()

    return {"mensaje": "Dispositivo eliminado exitosamente"}, 200


def serialize_device(device):
    return {
        "id": device.id,
        "name": device.name,
        "hostname": device.hostname,
        "ip_address": device.ip_address,
        "serial_number": device.serial_number,
        "brand": device.brand,
        "model": device.model,
        "status": device.status,
        "description": device.description,
        "device_type_id": device.device_type_id,
        "location_id": device.location_id,
        "user_id": device.user_id,
        "created_at": device.created_at.isoformat() if device.created_at else None,
        "updated_at": device.updated_at.isoformat() if device.updated_at else None
    }
