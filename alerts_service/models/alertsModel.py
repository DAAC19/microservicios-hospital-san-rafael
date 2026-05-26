from extensions import db
from datetime import datetime


class AlertSeverity(db.Model):
    
    __tablename__ = "alert_severities"

    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    alerts = db.relationship("Alert", backref="severity", lazy=True)

    def to_dict(self):
        return {
            "id":   self.id,
            "name": self.name
        }


class Alert(db.Model):
    """
    Alertas generadas por el sistema de monitoreo.
    Cada alerta está asociada a un dispositivo y tiene un nivel de severidad.
    """
    __tablename__ = "alerts"

    id          = db.Column(db.Integer, primary_key=True)
    device_id   = db.Column(db.Integer, nullable=False)          
    severity_id = db.Column(db.Integer, db.ForeignKey("alert_severities.id"), nullable=False)
    message     = db.Column(db.Text, nullable=False)
    resolved    = db.Column(db.Boolean, default=False, nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id":          self.id,
            "device_id":   self.device_id,
            "severity_id": self.severity_id,
            "severity":    self.severity.name if self.severity else None,
            "message":     self.message,
            "resolved":    self.resolved,
            "created_at":  self.created_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None
        }
