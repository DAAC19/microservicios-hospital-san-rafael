from flask import Blueprint, request
import requests

from config import ALERTS_URL, SEVERITIES_URL
from middleware import token_required, roles_required
from utils import response_json


alerts_bp = Blueprint("alerts_bp", __name__)


@alerts_bp.route("/alerts", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECHNICIAN", "SUPERVISOR", "USER")
def get_alerts():
    response = requests.get(ALERTS_URL)
    return response_json(response)


@alerts_bp.route("/alerts", methods=["POST"])
@token_required
@roles_required("ADMIN", "TECHNICIAN")
def create_alert():
    response = requests.post(
        ALERTS_URL,
        json=request.json
    )

    return response_json(response)


@alerts_bp.route("/alerts/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECHNICIAN", "SUPERVISOR", "USER")
def get_alert(id):
    response = requests.get(f"{ALERTS_URL}/{id}")
    return response_json(response)


@alerts_bp.route("/alerts/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN", "TECHNICIAN", "SUPERVISOR")
def update_alert(id):
    response = requests.put(
        f"{ALERTS_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@alerts_bp.route("/alerts/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_alert(id):
    response = requests.delete(f"{ALERTS_URL}/{id}")
    return response_json(response)


@alerts_bp.route("/severities", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECHNICIAN", "SUPERVISOR")
def get_severities():
    response = requests.get(SEVERITIES_URL)
    return response_json(response)


@alerts_bp.route("/severities", methods=["POST"])
@token_required
@roles_required("ADMIN")
def create_severity():
    response = requests.post(
        SEVERITIES_URL,
        json=request.json
    )

    return response_json(response)


@alerts_bp.route("/severities/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECHNICIAN", "SUPERVISOR")
def get_severity(id):
    response = requests.get(f"{SEVERITIES_URL}/{id}")
    return response_json(response)


@alerts_bp.route("/severities/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN")
def update_severity(id):
    response = requests.put(
        f"{SEVERITIES_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@alerts_bp.route("/severities/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_severity(id):
    response = requests.delete(f"{SEVERITIES_URL}/{id}")
    return response_json(response)