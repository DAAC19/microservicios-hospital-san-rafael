from models.alertsModel import Alert, AlertSeverity
from extensions import db
from flask import request
from datetime import datetime


def get_all_severities():
    severities = AlertSeverity.query.order_by(AlertSeverity.id.asc()).all()
    return [serialize_severity(s) for s in severities], 200


def create_severity(data):
    if not data.get("name"):
        return {"error": "The field 'name' is required"}, 400
    if AlertSeverity.query.filter_by(name=data["name"].upper()).first():
        return {"error": "This severity already exists"}, 409
    new_severity = AlertSeverity(name=data["name"].upper())
    db.session.add(new_severity)
    db.session.commit()
    return serialize_severity(new_severity), 201


def delete_severity(severity_id):
    severity = AlertSeverity.query.get(severity_id)
    if not severity:
        return {"message": "Severity not found"}, 404
    db.session.delete(severity)
    db.session.commit()
    return {"message": "Severity successfully deleted"}, 200


def get_all_alerts():
    query = Alert.query
    device_id = request.args.get("device_id")
    severity_id = request.args.get("severity_id")
    resolved = request.args.get("resolved")
    if device_id:
        query = query.filter_by(device_id=int(device_id))
    if severity_id:
        query = query.filter_by(severity_id=int(severity_id))
    if resolved is not None:
        resolved_bool = resolved.lower() == "true"
        query = query.filter_by(resolved=resolved_bool)
    alerts = query.order_by(Alert.created_at.desc()).all()
    return [serialize_alert(a) for a in alerts], 200


def get_alert_by_id(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return {"message": "Alert not found"}, 404
    return serialize_alert(alert), 200


def create_alert(data):
    required_fields = ["device_id", "severity_id", "message"]
    for field in required_fields:
        if field not in data:
            return {"error": f"The field '{field}' is required"}, 400

    # Asegura que severity_id sea entero
    try:
        severity_id = int(data["severity_id"])
    except (ValueError, TypeError):
        return {"error": "severity_id must be an integer"}, 400

    severity = AlertSeverity.query.get(severity_id)
    if not severity:
        return {"error": f"Invalid severity_id: {severity_id}"}, 400

    try:
        device_id = int(data["device_id"])
    except (ValueError, TypeError):
        return {"error": "device_id must be an integer"}, 400

    new_alert = Alert(
        device_id=device_id,
        severity_id=severity_id,
        message=data["message"]
    )
    db.session.add(new_alert)
    db.session.commit()
    return serialize_alert(new_alert), 201


def resolve_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return {"message": "Alert not found"}, 404
    if alert.resolved:
        return {"message": "Alert already resolved"}, 200
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    db.session.commit()
    return serialize_alert(alert), 200


def delete_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return {"message": "Alert not found"}, 404
    db.session.delete(alert)
    db.session.commit()
    return {"message": "Alert successfully deleted"}, 200


def serialize_alert(alert):
    return {
        "id": alert.id,
        "device_id": alert.device_id,
        "severity_id": alert.severity_id,
        "severity": alert.severity.name if alert.severity else None,
        "message": alert.message,
        "resolved": alert.resolved,
        "created_at": alert.created_at.isoformat() if alert.created_at else None,
        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
    }


def serialize_severity(severity):
    return {
        "id": severity.id,
        "name": severity.name
    }

def delete_severity(severity_id):
    severity = AlertSeverity.query.get(severity_id)
    if not severity:
        return {"message": "Severity not found"}, 404
    db.session.delete(severity)
    db.session.commit()
    return {"message": "Severity successfully deleted"}, 200