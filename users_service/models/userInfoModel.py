from extensions import db

class User(db.Model):
    __tablename__='user_info'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    document = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(100), nullable=False)