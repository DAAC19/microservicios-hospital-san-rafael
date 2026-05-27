from models.locationModel import Location
from extensions import db
from flask import request

def get_all_locations():
    location = Location.query.order_by(Location.id.asc()).all()
    return [serialize_location(location) for location in location], 200

def get_location_by_id(location_id):
    location = Location.query.get(location_id)

    if not location:
        return {"message": "Location not found"}, 404
    
    return serialize_location(location), 200

def create_location(data):
    if not data.get("name"):
        return {"error": "The field 'name' is required"}, 400

    if Location.query.filter_by(name=data["name"]).first():
        return {"error": "A location with this name already exists"}, 409

    new_location = Location(
        name=data["name"],
        description=data.get("description"),
        building=data.get("building"),
        floor=data.get("floor"),
        room=data.get("room"),
    )

    db.session.add(new_location)
    db.session.commit()
    return serialize_location(new_location), 201


def update_location(location_id, data):
    location = Location.query.get(location_id)

    if not location:
        return {"message": "Location not found"}, 404

    existing_location = Location.query.filter(
        Location.name == data.get("name"),
        Location.id != location_id
    ).first()

    if existing_location:
        return {"error": "This location name is already in use"}, 409

    location.name = data.get("name", location.name)
    location.description = data.get("description", location.description)
    location.building = data.get("building", location.building)
    location.floor = data.get("floor", location.floor)
    location.room = data.get("room", location.room)

    db.session.commit()
    return serialize_location(location), 200


def delete_location(location_id):
    location = Location.query.get(location_id)

    if not location:
        return {"message": "Location not found"}, 404

    db.session.delete(location)
    db.session.commit()
    return {"message": "Location successfully deleted"}, 200
def serialize_location(location):
    return {
        "id": location.id,
        "name": location.name,
        "description": location.description,
        "building": location.building,
        "floor": location.floor,
        "room": location.room,
        "created_at": location.created_at,
        "updated_at": location.updated_at
    }