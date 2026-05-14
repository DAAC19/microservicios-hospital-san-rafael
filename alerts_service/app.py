from flask import Flask
from config import Config
from extensions import db
from routes.alertsRoutes import alerts_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False

    db.init_app(app)

    app.register_blueprint(alerts_bp)

    return app


if __name__ == '__main__':
    app = create_app()

    with app.app_context():
        db.create_all()

    app.run(port=5003, debug=True)