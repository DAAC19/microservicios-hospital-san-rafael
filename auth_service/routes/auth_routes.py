from flask import Blueprint, request, jsonify
from controllers.auth_controller import register, login

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    result = register(data)
    return jsonify(result)

@auth_bp.route("/login", methods=["POST"])
def login_route():
    data = request.get_json()
    result = login(data)
    return jsonify(result)

