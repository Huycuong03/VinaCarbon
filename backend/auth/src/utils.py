from datetime import datetime, timedelta

from google.auth.transport.requests import Request
from google.oauth2 import id_token
from jose import jwt
from src.settings import SETTINGS


def verify_google_token(token: str):
    try:
        user = id_token.verify_oauth2_token(
            token, Request(), SETTINGS.google_oauth_client_id
        )
        return user

    except ValueError:
        return None


def create_internal_token(data: dict) -> str:
    expire = datetime.now() + timedelta(minutes=SETTINGS.jwt_expire)
    data["exp"] = expire
    token = jwt.encode(data, SETTINGS.jwt_private_key, SETTINGS.jwt_algorithm)

    return token
