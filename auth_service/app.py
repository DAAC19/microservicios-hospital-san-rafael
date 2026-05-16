from flask import Flask
from  routes.auth_routes import auth_bp
from  config import Config
from  extensions import db
from scripts.db_seeding import seed_admin, seed_roles

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False
    db.init_app(app)
    app.register_blueprint(auth_bp, url_prefix="/auth")

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
        seed_roles()
        seed_admin()
    app.run(host="0.0.0.0", port=5007, debug=True)