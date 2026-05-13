from extensions import db

class AlertReport(db.Model):
    
    __tablename__ = "alerts"
    __table_args__ = {"extend_existing": True}

    id          = db.Column(db.Integer, primary_key=True)
    device_id   = db.Column(db.Integer)
    severity_id = db.Column(db.Integer)
    message     = db.Column(db.Text)
    resolved    = db.Column(db.Boolean)
    created_at  = db.Column(db.DateTime)
    resolved_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id":          self.id,
            "device_id":   self.device_id,
            "severity_id": self.severity_id,
            "message":     self.message,
            "resolved":    self.resolved,
            "created_at":  self.created_at.isoformat() if self.created_at else None,
        }


class MetricReport(db.Model):
    __tablename__ = "metrics"
    __table_args__ = {"extend_existing": True}

    id             = db.Column(db.Integer, primary_key=True)
    device_id      = db.Column(db.Integer)
    metric_type_id = db.Column(db.Integer)
    value          = db.Column(db.Float)
    recorded_at    = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id":             self.id,
            "device_id":      self.device_id,
            "metric_type_id": self.metric_type_id,
            "value":          self.value,
            "recorded_at":    self.recorded_at.isoformat() if self.recorded_at else None,
        }


class DeviceReport(db.Model):

    __tablename__ = "devices"
    __table_args__ = {"extend_existing": True}

    id             = db.Column(db.Integer, primary_key=True)
    name           = db.Column(db.String(100))
    device_type_id = db.Column(db.Integer)
    location_id    = db.Column(db.Integer)
    ip_address     = db.Column(db.String(50))
    status         = db.Column(db.String(20))

    def to_dict(self):
        return {
            "id":             self.id,
            "name":           self.name,
            "device_type_id": self.device_type_id,
            "location_id":    self.location_id,
            "ip_address":     self.ip_address,
            "status":         self.status,
        }
