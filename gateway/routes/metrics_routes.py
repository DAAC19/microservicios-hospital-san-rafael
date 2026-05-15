from flask import Blueprint, request
import requests

from config import METRICS_URL, METRIC_TYPES_URL
from middleware import token_required, roles_required
from utils import response_json


metrics_bp = Blueprint("metrics_bp", __name__)


@metrics_bp.route("/metrics", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICIAN", "SUPERVISOR", "USER")
def get_metrics():
    response = requests.get(METRICS_URL)
    return response_json(response)


@metrics_bp.route("/metrics", methods=["POST"])
@token_required
@roles_required("ADMIN", "TECNICIAN")
def create_metric():
    response = requests.post(
        METRICS_URL,
        json=request.json
    )

    return response_json(response)


@metrics_bp.route("/metrics/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICIAN", "SUPERVISOR", "USER")
def get_metric(id):
    response = requests.get(f"{METRICS_URL}/{id}")
    return response_json(response)


@metrics_bp.route("/metrics/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN", "TECNICIAN")
def update_metric(id):
    response = requests.put(
        f"{METRICS_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@metrics_bp.route("/metrics/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_metric(id):
    response = requests.delete(f"{METRICS_URL}/{id}")
    return response_json(response)


@metrics_bp.route("/metric-types", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICIAN", "SUPERVISOR")
def get_metric_types():
    response = requests.get(METRIC_TYPES_URL)
    return response_json(response)


@metrics_bp.route("/metric-types", methods=["POST"])
@token_required
@roles_required("ADMIN")
def create_metric_type():
    response = requests.post(
        METRIC_TYPES_URL,
        json=request.json
    )

    return response_json(response)


@metrics_bp.route("/metric-types/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICIAN", "SUPERVISOR")
def get_metric_type(id):
    response = requests.get(f"{METRIC_TYPES_URL}/{id}")
    return response_json(response)


@metrics_bp.route("/metric-types/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN")
def update_metric_type(id):
    response = requests.put(
        f"{METRIC_TYPES_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@metrics_bp.route("/metric-types/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_metric_type(id):
    response = requests.delete(f"{METRIC_TYPES_URL}/{id}")
    return response_json(response)