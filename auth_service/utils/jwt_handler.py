import jwt
import datetime
from config import SECRET_KEY

# SECRET_KEY = "supersecret"

def generate_token(user_credentials, role):
    payload = {
        "credential_id": user_credentials.id,
        "user_id": user_credentials.user_id,
        "username": user_credentials.username,
        "role_id":role.id,
        "role": role.role_name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }

    # token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    # return token

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
