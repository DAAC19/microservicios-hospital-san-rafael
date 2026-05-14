from flask import request
from extensions import db
from models.metricsModel import Metric, MetricType
from sqlalchemy import func




def get_all_metric_types():
    types = MetricType.query.order_by(MetricType.id.asc()).all()
    return [serialize_metric_type(t) for t in types], 200


def create_metric_type(data):
    if not data.get("name"):
        return {"error": "The field 'name' is required"}, 400

    if MetricType.query.filter_by(name=data["name"]).first():
        return {"error": f"A metric type with the name '{data['name']}' already exists"}, 409

    metric_type = MetricType(
        name=data["name"],
        unit=data.get("unit"),
        description=data.get("description"),
    )
    db.session.add(metric_type)
    db.session.commit()
    return serialize_metric_type(metric_type), 201


def delete_metric_type(type_id):
    metric_type = MetricType.query.get(type_id)

    if not metric_type:
        return {"message": "Metric type not found"}, 404

    db.session.delete(metric_type)
    db.session.commit()
    return {"message": "Metric type successfully deleted"}, 200




def get_all_metrics():
    device_id = request.args.get("device_id", type=int)
    metric_type_id = request.args.get("metric_type_id", type=int)

    query = Metric.query
    if device_id:
        query = query.filter_by(device_id=device_id)
    if metric_type_id:
        query = query.filter_by(metric_type_id=metric_type_id)

    metrics = query.order_by(Metric.recorded_at.desc()).all()
    return [serialize_metric(m) for m in metrics], 200


def get_metric_by_id(metric_id):
    metric = Metric.query.get(metric_id)

    if not metric:
        return {"message": "Metric not found"}, 404

    return serialize_metric(metric), 200


def create_metric(data):
    required_fields = ["device_id", "metric_type_id", "value"]
    for field in required_fields:
        if field not in data:
            return {"error": f"The field '{field}' is required"}, 400

    if not MetricType.query.get(data["metric_type_id"]):
        return {"message": "Metric type not found"}, 404

    metric = Metric(
        device_id=data["device_id"],
        metric_type_id=data["metric_type_id"],
        value=float(data["value"]),
    )
    db.session.add(metric)
    db.session.commit()
    return serialize_metric(metric), 201


def delete_metric(metric_id):
    metric = Metric.query.get(metric_id)

    if not metric:
        return {"message": "Metric not found"}, 404

    db.session.delete(metric)
    db.session.commit()
    return {"message": "Metric successfully deleted"}, 200


def serialize_metric_type(metric_type):
    return {
        "id": metric_type.id,
        "name": metric_type.name,
        "unit": metric_type.unit,
        "description": metric_type.description,
        "created_at": metric_type.created_at.isoformat() if metric_type.created_at else None,
    }


def serialize_metric(metric):
    return {
        "id": metric.id,
        "device_id": metric.device_id,
        "metric_type_id": metric.metric_type_id,
        "metric_type": metric.metric_type.name if metric.metric_type else None,
        "unit": metric.metric_type.unit if metric.metric_type else None,
        "value": metric.value,
        "recorded_at": metric.recorded_at.isoformat() if metric.recorded_at else None,
        "created_at": metric.created_at.isoformat() if metric.created_at else None,
    }