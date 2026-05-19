from flask import Blueprint, request
import requests

from config import DEVICES_URL, DEVICE_TYPES_URL
from middleware import token_required, roles_required
from utils import response_json


devices_bp = Blueprint("devices_bp", __name__)


@devices_bp.route("/devices", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICIAN", "SUPERVISOR", "USER")
def get_devices():
    response = requests.get(DEVICES_URL)
    return response_json(response)


@devices_bp.route("/devices", methods=["POST"])
@token_required
@roles_required("ADMIN", "TECNICIAN")
def create_device():
    response = requests.post(
        DEVICES_URL,
        json=request.json
    )

    return response_json(response)


@devices_bp.route("/devices/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICIAN", "SUPERVISOR", "USER")
def get_device(id):
    response = requests.get(f"{DEVICES_URL}/{id}")
    return response_json(response)


@devices_bp.route("/devices/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN", "TECNICIAN")
def update_device(id):
    response = requests.put(
        f"{DEVICES_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@devices_bp.route("/devices/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_device(id):
    response = requests.delete(f"{DEVICES_URL}/{id}")
    return response_json(response)


@devices_bp.route("/device-types", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICIAN", "SUPERVISOR", "USER")
def get_device_types():
    response = requests.get(DEVICE_TYPES_URL)
    return response_json(response)


@devices_bp.route("/device-types", methods=["POST"])
@token_required
@roles_required("ADMIN")
def create_device_type():
    response = requests.post(
        DEVICE_TYPES_URL,
        json=request.json
    )

    return response_json(response)


@devices_bp.route("/device-types/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICIAN", "SUPERVISOR", "USER")
def get_device_type(id):
    response = requests.get(f"{DEVICE_TYPES_URL}/{id}")
    return response_json(response)


@devices_bp.route("/device-types/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN")
def update_device_type(id):
    response = requests.put(
        f"{DEVICE_TYPES_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@devices_bp.route("/device-types/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_device_type(id):
    response = requests.delete(f"{DEVICE_TYPES_URL}/{id}")
    return response_json(response)