from flask import Flask
from config import Config
from extensions import db
from routes.userInfoRoute import user_bp
from scripts.db_seeding import seed_roles

app = Flask(__name__)
app.config.from_object(Config)
app.json.sort_keys = False
db.init_app(app)
app.register_blueprint(user_bp)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_roles()
    app.run(host="0.0.0.0",port=5001, debug=True)