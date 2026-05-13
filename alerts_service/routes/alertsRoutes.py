from flask import Blueprint, request, jsonify
from controllers.alertsController import *

alerts_bp = Blueprint('alerts_bp', __name__)

@alerts_bp.route('/severities', methods=['GET'])
def get_severities_route():
    result, status = get_all_severities()
    return jsonify(result), status


@alerts_bp.route('/severities', methods=['POST'])
def create_severity_route():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data required"}), 400

    result, status = create_severity(data)
    return jsonify(result), status


@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts_route():
    result, status = get_all_alerts()
    return jsonify(result), status


@alerts_bp.route('/alerts/<int:alert_id>', methods=['GET'])
def get_alert_route(alert_id):
    result, status = get_alert_by_id(alert_id)
    return jsonify(result), status


@alerts_bp.route('/alerts', methods=['POST'])
def create_alert_route():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON data required"}), 400

    result, status = create_alert(data)
    return jsonify(result), status


@alerts_bp.route('/alerts/<int:alert_id>/resolve', methods=['PATCH'])
def resolve_alert_route(alert_id):
    result, status = resolve_alert(alert_id)
    return jsonify(result), status


@alerts_bp.route('/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert_route(alert_id):
    result, status = delete_alert(alert_id)
    return jsonify(result), status