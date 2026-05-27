from flask import Blueprint, request, jsonify
from controllers.metricsController import *

metrics_bp = Blueprint('metrics_bp', __name__)

@metrics_bp.route('/metric-types', methods=['GET'])
def get_metric_types_route():
    result, status = get_all_metric_types()
    return jsonify(result), status

@metrics_bp.route('/metric-types', methods=['POST'])
def create_metric_type_route():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Required JSON data"}), 400

    result, status = create_metric_type(data)
    return jsonify(result), status

@metrics_bp.route('/metric-types/<int:type_id>', methods=['DELETE'])
def delete_metric_type_route(type_id):
    result, status = delete_metric_type(type_id)
    return jsonify(result), status



@metrics_bp.route('/metrics', methods=['GET'])
def get_metrics_route():
    result, status = get_all_metrics()
    return jsonify(result), status

@metrics_bp.route('/metrics/<int:metric_id>', methods=['GET'])
def get_metric_route(metric_id):
    result, status = get_metric_by_id(metric_id)
    return jsonify(result), status

@metrics_bp.route('/metrics', methods=['POST'])
def create_metric_route():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Required JSON data"}), 400

    result, status = create_metric(data)
    return jsonify(result), status

@metrics_bp.route('/metrics/<int:metric_id>', methods=['DELETE'])
def delete_metric_route(metric_id):
    result, status = delete_metric(metric_id)
    return jsonify(result), status

