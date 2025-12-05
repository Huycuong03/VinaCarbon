from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_secret_key: str = "vinacarbon"
    jwt_algorithm: str = "HS256"
    jwt_expire: int = 60 * 24
    google_oauth_client_id: str


SETTINGS = Settings()  # type: ignore
