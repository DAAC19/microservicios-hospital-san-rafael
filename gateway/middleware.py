from flask import request, jsonify
from functools import wraps
import jwt

from config import SECRET_KEY


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"message": "Token required"}), 401

        try:
            token = auth_header.split(" ")[1]

            decoded = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            request.user = decoded
            request.user_id = decoded.get("user_id")
            request.user_role = decoded.get("role")

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401

        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        except Exception:
            return jsonify({"message": "Error in token"}), 401

        return f(*args, **kwargs)

    return decorated


def roles_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user_role = getattr(request, "user_role", None)

            if user_role not in allowed_roles:
                return jsonify({
                    "message": "You do not have permissions to perform this action",
                    "user_role": user_role,
                    "allowed_roles": allowed_roles
                }), 403

            return f(*args, **kwargs)

        return decorated

    return decorator