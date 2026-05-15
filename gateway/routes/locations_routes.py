from flask import Blueprint, request
import requests

from config import LOCATIONS_URL
from middleware import token_required, roles_required
from utils import response_json


locations_bp = Blueprint("locations_bp", __name__)


@locations_bp.route("/locations", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICO", "SUPERVISOR", "CONSULTA")
def get_locations():
    response = requests.get(LOCATIONS_URL)
    return response_json(response)


@locations_bp.route("/locations", methods=["POST"])
@token_required
@roles_required("ADMIN", "TECNICO")
def create_location():
    response = requests.post(
        LOCATIONS_URL,
        json=request.json
    )

    return response_json(response)


@locations_bp.route("/locations/<int:id>", methods=["GET"])
@token_required
@roles_required("ADMIN", "TECNICO", "SUPERVISOR", "CONSULTA")
def get_location(id):
    response = requests.get(f"{LOCATIONS_URL}/{id}")
    return response_json(response)


@locations_bp.route("/locations/<int:id>", methods=["PUT"])
@token_required
@roles_required("ADMIN", "TECNICO")
def update_location(id):
    response = requests.put(
        f"{LOCATIONS_URL}/{id}",
        json=request.json
    )

    return response_json(response)


@locations_bp.route("/locations/<int:id>", methods=["DELETE"])
@token_required
@roles_required("ADMIN")
def delete_location(id):
    response = requests.delete(f"{LOCATIONS_URL}/{id}")
    return response_json(response)