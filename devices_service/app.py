from flask import Flask
from extensions import db
from routes.deviceRoute import device_bp
from routes.deviceTypeRoute import device_type_bp

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///devices.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

app.register_blueprint(device_bp)
app.register_blueprint(device_type_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5003)