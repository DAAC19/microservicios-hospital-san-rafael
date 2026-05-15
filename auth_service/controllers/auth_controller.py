from models.userModel import UserCredentials
from extensions import db
from utils.jwt_handler import generate_token
from werkzeug.security import generate_password_hash, check_password_hash
import requests

USERS_SERVICE_URL = "http://localhost:5001/users"
ROLES = {
    1:"ADMIN",
    2:"USER",
    3:"SUPERVISOR",
    4:"TECNICIAN"
}

def get_user_info(user_id):
    try:
        response = requests.get(f"{USERS_SERVICE_URL}/{user_id}", timeout=5)

        if response.status_code != 200:
            return None

        return response.json()

    except requests.RequestException:
        return None

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
    
    user_info = get_user_info(user.user_id)

    if not user_info:
        return {"Error": "No se pudo obtener la información del usuario"}, 500

    role_id = user_info.get("role_id")

    if not role_id:
        return {"Error": "No se encontró el role_id del usuario"}, 400

    role = ROLES.get(role_id)

    if not role:
        return {"Error": "Rol no válido"}, 400

    token = generate_token(user, role)

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