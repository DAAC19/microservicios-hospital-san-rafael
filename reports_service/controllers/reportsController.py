from models.reportsModel import AlertReport, MetricReport, DeviceReport
from extensions import db
from flask import request
from datetime import datetime, timedelta
from sqlalchemy import func


def get_general_report():
    total_devices = DeviceReport.query.count()
    total_alerts = AlertReport.query.count()
    open_alerts = AlertReport.query.filter_by(resolved=False).count()
    resolved_alerts = AlertReport.query.filter_by(resolved=True).count()
    total_metrics = MetricReport.query.count()

    devices_by_status = db.session.query(
        DeviceReport.status,
        func.count(DeviceReport.id)
    ).group_by(DeviceReport.status).all()

    alerts_by_severity = db.session.query(
        AlertReport.severity_id,
        func.count(AlertReport.id)
    ).group_by(AlertReport.severity_id).all()

    return {
        "generated_at": datetime.utcnow(),
        "devices": {
            "total": total_devices,
            "by_status": [
                {
                    "status": status,
                    "count": count
                }
                for status, count in devices_by_status
            ]
        },
        "alerts": {
            "total": total_alerts,
            "open": open_alerts,
            "resolved": resolved_alerts,
            "by_severity": [
                {
                    "severity_id": severity_id,
                    "count": count
                }
                for severity_id, count in alerts_by_severity
            ]
        },
        "metrics": {
            "total_records": total_metrics
        }
    }, 200


def get_alerts_report():
    query = AlertReport.query

    from_date = request.args.get("from")
    to_date = request.args.get("to")
    resolved = request.args.get("resolved")

    if from_date:
        query = query.filter(
            AlertReport.created_at >= datetime.fromisoformat(from_date)
        )

    if to_date:
        query = query.filter(
            AlertReport.created_at <= datetime.fromisoformat(to_date)
        )

    if resolved is not None:
        query = query.filter_by(
            resolved=(resolved.lower() == "true")
        )

    alerts = query.order_by(AlertReport.created_at.desc()).all()

    return {
        "generated_at": datetime.utcnow(),
        "total": len(alerts),
        "alerts": [serialize_alert(alert) for alert in alerts]
    }, 200

def get_metrics_report():
    query = MetricReport.query

    device_id = request.args.get("device_id")
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    if device_id:
        query = query.filter_by(device_id=int(device_id))

    if from_date:
        query = query.filter(
            MetricReport.recorded_at >= datetime.fromisoformat(from_date)
        )

    if to_date:
        query = query.filter(
            MetricReport.recorded_at <= datetime.fromisoformat(to_date)
        )

    metrics = query.order_by(MetricReport.recorded_at.desc()).all()

    avg_by_type = db.session.query(
        MetricReport.metric_type_id,
        func.avg(MetricReport.value),
        func.min(MetricReport.value),
        func.max(MetricReport.value)
    ).group_by(MetricReport.metric_type_id).all()

    return {
        "generated_at": datetime.utcnow(),
        "total": len(metrics),
        "summary_by_type": [
            {
                "metric_type_id": metric_type_id,
                "average": round(float(avg), 2),
                "min": round(float(mn), 2),
                "max": round(float(mx), 2)
            }
            for metric_type_id, avg, mn, mx in avg_by_type
        ],
        "records": [serialize_metric(metric) for metric in metrics]
    }, 200


def get_devices_report():
    devices = DeviceReport.query.all()

    result = []

    for device in devices:
        alert_count = AlertReport.query.filter_by(
            device_id=device.id,
            resolved=False
        ).count()

        device_data = serialize_device(device)
        device_data["open_alerts"] = alert_count

        result.append(device_data)

    return {
        "generated_at": datetime.utcnow(),
        "total": len(result),
        "devices": result
    }, 200


def get_last_24h_report():
    since = datetime.utcnow() - timedelta(hours=24)

    recent_alerts = AlertReport.query.filter(
        AlertReport.created_at >= since
    ).count()

    recent_metrics = MetricReport.query.filter(
        MetricReport.recorded_at >= since
    ).count()

    critical_alerts = AlertReport.query.filter(
        AlertReport.created_at >= since,
        AlertReport.severity_id == 1,
        AlertReport.resolved == False
    ).count()

    return {
        "generated_at": datetime.utcnow(),
        "period": "last_24_hours",
        "new_alerts": recent_alerts,
        "critical_open": critical_alerts,
        "metrics_recorded": recent_metrics
    }, 200


def serialize_alert(alert):
    return {
        "id": alert.id,
        "device_id": alert.device_id,
        "severity_id": alert.severity_id,
        "message": alert.message,
        "resolved": alert.resolved,
        "created_at": alert.created_at,
        "resolved_at": alert.resolved_at
    }


def serialize_metric(metric):
    return {
        "id": metric.id,
        "device_id": metric.device_id,
        "metric_type_id": metric.metric_type_id,
        "value": metric.value,
        "recorded_at": metric.recorded_at
    }


def serialize_device(device):
    return {
        "id": device.id,
        "name": device.name,
        "status": device.status,
    }