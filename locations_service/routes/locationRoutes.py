from flask import Blueprint, request, jsonify
from controllers.locationController import *

location_bp = Blueprint('location_bp', __name__)

@location_bp.route('/locations', methods=['GET'])
def get_locations_route():
    result, status = get_all_locations()
    return jsonify(result), status

@location_bp.route('/locations/<int:location_id>', methods=['GET'])
def get_location_route(location_id):
    result, status = get_location_by_id(location_id)
    return jsonify(result), status

@location_bp.route('/locations', methods=['POST'])
def create_location_route():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Datos JSON requeridos"}), 400

    result, status = create_location(data)
    return jsonify(result), status

@location_bp.route('/locations/<int:location_id>', methods=['PUT'])
def update_location_route(location_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Datos JSON requeridos"}), 400

    result, status = update_location(location_id, data)
    return jsonify(result), status

@location_bp.route('/locations/<int:location_id>', methods=['DELETE'])
def delete_location_route(location_id):
    result, status = delete_location(location_id)
    return jsonify(result), status