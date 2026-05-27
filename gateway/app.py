from flask import Flask, jsonify
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.users_routes import users_bp
from routes.locations_routes import locations_bp
from routes.devices_routes import devices_bp
from routes.metrics_routes import metrics_bp
from routes.alerts_routes import alerts_bp
from routes.reports_routes import reports_bp


app = Flask(__name__)
CORS(app)

app.json.sort_keys = False


# Registrar rutas del gateway
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(locations_bp)
app.register_blueprint(devices_bp)
app.register_blueprint(metrics_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(reports_bp)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "API Gateway Hospital San Rafael functioning correctly"
    }), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "gateway"
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000,debug=True, use_reloader=False)