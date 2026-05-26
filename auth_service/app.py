from flask import Flask
from routes.auth_routes import auth_bp
from config import Config
from extensions import db
from scripts.db_seeding import seed_admin, seed_roles
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False

    CORS(app)

    db.init_app(app)
    app.register_blueprint(auth_bp, url_prefix="/auth")

    return app


def init_db(app):
    with app.app_context():
        db.create_all()
        seed_roles()
        seed_admin()


if __name__ == "__main__":
    app = create_app()

    init_db(app)

    app.run(host="0.0.0.0", port=5007, debug=True)