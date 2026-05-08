from extensions import db
from datetime import datetime


class MetricType(db.Model):
    __tablename__ = "metric_types"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    unit = db.Column(db.String(30), nullable=True)        # ej: %, MB, °C
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    metrics = db.relationship("Metric", backref="metric_type", lazy=True)

    


class Metric(db.Model):
    __tablename__ = "metrics"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    device_id = db.Column(db.Integer, nullable=False)          # FK al Devices Service
    metric_type_id = db.Column(db.Integer, db.ForeignKey("metric_types.id"), nullable=False)
    value = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

