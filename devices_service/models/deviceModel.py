from extensions import db
from datetime import datetime

class Device(db.Model):
    __tablename__ = "devices"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(120), nullable=False)
    hostname = db.Column(db.String(120), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)

    serial_number = db.Column(db.String(100), nullable=True)
    brand = db.Column(db.String(100), nullable=True)
    model = db.Column(db.String(100), nullable=True)

    status = db.Column(db.String(30), nullable=False, default="active")

    description = db.Column(db.String(255), nullable=True)

    device_type_id = db.Column(db.Integer, nullable=False)
    location_id = db.Column(db.Integer, nullable=True)
    user_id = db.Column(db.Integer, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )