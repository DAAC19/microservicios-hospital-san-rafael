from extensions import db

class UserCredentials(db.Model):
    __tablename__ = "usersCredentials"

    id = db.Column( db.Integer, primary_key=True)
    username = db.Column(db.String(100),unique = True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer,unique=True,nullable=False)
    role_id = db.Column(db.Integer, nullable=False)
    