from flask import Blueprint
from controllers.reportsController import (
    get_general_report,
    get_alerts_report,
    get_metrics_report,
    get_devices_report,
    get_last_24h_report
)

reports_bp = Blueprint("reports", __name__)

reports_bp.route("/reports/general",   methods=["GET"])(get_general_report)
reports_bp.route("/reports/alerts",    methods=["GET"])(get_alerts_report)
reports_bp.route("/reports/metrics",   methods=["GET"])(get_metrics_report)
reports_bp.route("/reports/devices",   methods=["GET"])(get_devices_report)
reports_bp.route("/reports/last24h",   methods=["GET"])(get_last_24h_report)