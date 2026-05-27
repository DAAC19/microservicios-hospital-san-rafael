from models.deviceTypeModel import DeviceType
from extensions import db


def get_all_device_types():
    device_types = DeviceType.query.order_by(DeviceType.id.asc()).all()

    result = []

    for device_type in device_types:
        result.append(serialize_device_type(device_type))

    return result


def get_device_type_by_id(device_type_id):
    device_type = DeviceType.query.get(device_type_id)

    if not device_type:
        return {"error": "Device type not found"}, 404

    return serialize_device_type(device_type)


def create_device_type(data):
    name = data.get("name")
    description = data.get("description")
    category = data.get("category")
    is_active = data.get("is_active", True)

    if not name:
        return {"error": "The name field is required"}, 400

    existing_device_type = DeviceType.query.filter_by(name=name).first()

    if existing_device_type:
        return {"error": "A device type with that name already exists"}, 400

    new_device_type = DeviceType(
        name=name,
        description=description,
        category=category,
        is_active=is_active
    )

    db.session.add(new_device_type)
    db.session.commit()

    return {
        "message": "Device type created successfully",
        "device_type": serialize_device_type(new_device_type)
    }, 201


def update_device_type(device_type_id, data):
    device_type = DeviceType.query.get(device_type_id)

    if not device_type:
        return {"message": "Device type not found"}, 404

    new_name = data.get("name")

    if new_name:
        if new_name != device_type.name:
            existing_device_type = DeviceType.query.filter(
                DeviceType.name == new_name,
                DeviceType.id != device_type_id
            ).first()

            if existing_device_type:
                return {"error": "A device type with that name already exists"}, 400

            device_type.name = new_name

    device_type.description = data.get("description", device_type.description)
    device_type.category = data.get("category", device_type.category)
    device_type.is_active = data.get("is_active", device_type.is_active)

    db.session.commit()

    return {
        "message": "Device type updated successfully",
        "device_type": serialize_device_type(device_type)
    }, 200


def delete_device_type(device_type_id):
    device_type = DeviceType.query.get(device_type_id)

    if not device_type:
        return {"error": "Device type not found"}, 404

    db.session.delete(device_type)
    db.session.commit()

    return {"message": "Device type deleted successfully"}, 200


def serialize_device_type(device_type):
    return {
        "id": device_type.id,
        "name": device_type.name,
        "description": device_type.description,
        "category": device_type.category,
        "is_active": device_type.is_active,
        "created_at": device_type.created_at.isoformat() if device_type.created_at else None,
        "updated_at": device_type.updated_at.isoformat() if device_type.updated_at else None
    }