from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_private_key: str
    jwt_algorithm: str
    jwt_expire: int = 60 * 60 * 24  # a day

    google_oauth_client_id: str


SETTINGS = Settings()  # type: ignore
