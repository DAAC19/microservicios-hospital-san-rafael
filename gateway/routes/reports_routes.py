from flask import Blueprint, request
import requests

from config import REPORTS_URL
from middleware import token_required, roles_required
from utils import response_json


reports_bp = Blueprint("reports_bp", __name__)

@reports_bp.route("/reports", methods=["GET"])
@token_required
@roles_required("ADMIN", "SUPERVISOR", "USER")
def get_reports():
    report_type = request.args.get("type", "general")
    
    type_map = {
        "general":  f"{REPORTS_URL}/general",
        "alerts":   f"{REPORTS_URL}/alerts",
        "metrics":  f"{REPORTS_URL}/metrics",
        "devices":  f"{REPORTS_URL}/devices",
        "last_24h": f"{REPORTS_URL}/last24h",
    }
    
    url = type_map.get(report_type, f"{REPORTS_URL}/general")
    response = requests.get(url)
    return response_json(response)

@reports_bp.route("/reports", methods=["POST"])
@token_required
@roles_required("ADMIN", "SUPERVISOR")
def create_report():
    response = requests.post(
        REPORTS_URL,
        json=request.json
    )

    return response_json(response)


@reports_bp.route("/reports/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "SUPERVISOR", "USER")
def get_report(id):
    response = requests.get(f"{REPORTS_URL}/{id}")
    return response_json(response)


@reports_bp.route("/reports/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN")
def update_report(id):
    response = requests.put(
        f"{REPORTS_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@reports_bp.route("/reports/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_report(id):
    response = requests.delete(f"{REPORTS_URL}/{id}")
    return response_json(response)