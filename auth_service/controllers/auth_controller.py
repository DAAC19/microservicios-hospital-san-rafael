from models.userModel import UserCredentials
from extensions import db
from utils.jwt_handler import generate_token
from werkzeug.security import generate_password_hash, check_password_hash


def login(data):
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"Error": "username y password son obligatorios"}, 400

    user = UserCredentials.query.filter_by(username=username).first()

    if not user:
        return {"Error": "User not found"}, 404

    if not check_password_hash(user.password, password):
        return {"Error": "Invalid password"}, 401

    token = generate_token(user)

    return {"token": token}, 200


def register(data):
    username = data.get("username")
    user_id = data.get("user_id")
    password = data.get("password")

    if not username or not user_id or not password:
        return {"Error": "username, user_id y password son obligatorios"}, 400

    if UserCredentials.query.filter_by(username=username).first():
        return {"Error": "El usuario ya existe"}, 400

    if UserCredentials.query.filter_by(user_id=user_id).first():
        return {"Error": "Este user_id ya tiene credenciales asociadas"}, 400

    hashed_password = generate_password_hash(password)

    new_user = UserCredentials(
        username=username,
        password=hashed_password,
        user_id=user_id
    )

    db.session.add(new_user)
    db.session.commit()

    return {"Mensaje": "Usuario registrado exitosamente"}, 201