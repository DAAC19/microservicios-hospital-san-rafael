from flask import Blueprint, request, jsonify
from controllers.deviceTypeController import *

device_type_bp = Blueprint("device_type_bp", __name__)


@device_type_bp.route("/device-types", methods=["GET"])
def list_device_types():
    return jsonify(get_all_device_types()), 200


@device_type_bp.route("/device-types/<int:device_type_id>", methods=["GET"])
def get_device_type(device_type_id):
    result = get_device_type_by_id(device_type_id)

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200


@device_type_bp.route("/device-types", methods=["POST"])
def add_device_type():
    data = request.get_json()
    result = create_device_type(data)

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 201


@device_type_bp.route("/device-types/<int:device_type_id>", methods=["PUT"])
def edit_device_type(device_type_id):
    data = request.get_json()
    result = update_device_type(device_type_id, data)

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200


@device_type_bp.route("/device-types/<int:device_type_id>", methods=["DELETE"])
def remove_device_type(device_type_id):
    result = delete_device_type(device_type_id)

    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]

    return jsonify(result), 200