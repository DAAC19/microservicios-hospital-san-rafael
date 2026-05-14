from models.userModel import UserCredentials
from extensions import db
from utils.jwt_handler import generate_token
from werkzeug.security import generate_password_hash, check_password_hash

def login(data):
    name = data.get("name")
    password = data.get("password")

    user = UserCredentials.query.filter_by(username=name).first()

    if not user:
        return {"Error": "User not found"}, 404
    if not check_password_hash(user.password, password):
        return {"Error": "Invalid password"}, 401
    
    token = generate_token(user)
    return {"token": token}, 200

def register(data):
    name = data.get("name")
    password = data.get("password")
    if UserCredentials.query.filter_by(username=name).first():
        return{"Error": "El usuario ya existe"}, 400
    
    hashed_password = generate_password_hash(password)

    new_user = UserCredentials(
        username=name, 
        password=hashed_password
        )
    
    db.session.add(new_user)
    db.session.commit()

    return{"Mensaje": "Usuario registrado exitosamente"}, 201



