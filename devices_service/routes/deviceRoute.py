from flask import Blueprint, request, jsonify
from controllers.deviceController import *

device_bp = Blueprint("device_bp", __name__)


@device_bp.route("/devices", methods=["GET"])
def list_devices():
    return jsonify(get_all_devices()), 200


@device_bp.route("/devices/<int:device_id>", methods=["GET"])
def get_device(device_id):
    result = get_device_by_id(device_id)

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200


@device_bp.route("/devices", methods=["POST"])
def add_device():
    data = request.get_json()
    result = create_device(data)

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 201


@device_bp.route("/devices/<int:device_id>", methods=["PUT"])
def edit_device(device_id):
    data = request.get_json()
    result = update_device(device_id, data)

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200


@device_bp.route("/devices/<int:device_id>", methods=["DELETE"])
def remove_device(device_id):
    result = delete_device(device_id)

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200