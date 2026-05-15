from flask import Blueprint, request
import requests

from config import USERS_URL
from middleware import token_required, roles_required
from utils import response_json


users_bp = Blueprint("users_bp", __name__)


@users_bp.route("/users", methods=["GET"])
@token_required
@roles_required("ADMIN", "SUPERVISOR")
def get_users():
    response = requests.get(USERS_URL)
    return response_json(response)


@users_bp.route("/users", methods=["POST"])
@token_required
@roles_required("ADMIN")
def create_user():
    response = requests.post(
        USERS_URL,
        json=request.json
    )

    return response_json(response)


@users_bp.route("/users/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "SUPERVISOR")
def get_user(id):
    response = requests.get(f"{USERS_URL}/{id}")
    return response_json(response)


@users_bp.route("/users/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN")
def update_user(id):
    response = requests.put(
        f"{USERS_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@users_bp.route("/users/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_user(id):
    response = requests.delete(f"{USERS_URL}/{id}")
    return response_json(response)