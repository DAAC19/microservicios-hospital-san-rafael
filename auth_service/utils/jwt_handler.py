import jwt
import datetime
from config import SECRET_KEY

# SECRET_KEY = "supersecret"

def generate_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }

    # token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    # return token

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")