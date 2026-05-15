import jwt
import datetime
from config import SECRET_KEY

# SECRET_KEY = "supersecret"

def generate_token(user_credentials, role):
    payload = {
        "credential_id": user_credentials.id,
        "username": user_credentials.username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }

    # token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    # return token

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")