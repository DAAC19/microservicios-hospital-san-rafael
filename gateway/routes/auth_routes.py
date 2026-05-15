from flask import Blueprint, request
import requests

from config import AUTH_URL
from utils import response_json


auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    response = requests.post(
        f"{AUTH_URL}/register",
        json=request.json
    )

    return response_json(response)


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    response = requests.post(
        f"{AUTH_URL}/login",
        json=request.json
    )

    return response_json(response)