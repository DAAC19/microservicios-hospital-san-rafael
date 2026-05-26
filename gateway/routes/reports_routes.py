from flask import Blueprint, request, Response
import requests
import json

from config import REPORTS_URL
from middleware import token_required, roles_required
from utils import response_json


reports_bp = Blueprint("reports_bp", __name__)

TYPE_MAP = {
    "general":  "/general",
    "alerts":   "/alerts",
    "metrics":  "/metrics",
    "devices":  "/devices",
    "last_24h": "/last24h",
}


@reports_bp.route("/reports", methods=["GET"])
@token_required
@roles_required("ADMIN", "SUPERVISOR", "USER")
def get_reports():
    report_type = request.args.get("type", "general")
    path = TYPE_MAP.get(report_type, "/general")
    response = requests.get(f"{REPORTS_URL}{path}")
    return response_json(response)


@reports_bp.route("/reports/download", methods=["GET"])
@token_required
@roles_required("ADMIN", "SUPERVISOR")
def download_report():
    report_type = request.args.get("type", "general")
    path = TYPE_MAP.get(report_type, "/general")
    response = requests.get(f"{REPORTS_URL}{path}")

    if response.status_code != 200:
        return response_json(response)

    data = response.json()
    json_str = json.dumps(data, indent=2, default=str, ensure_ascii=False)
    filename = f"reporte_{report_type}.json"

    return Response(
        json_str,
        status=200,
        mimetype="application/json",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "application/json; charset=utf-8"
        }
    )