from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_public_key: str
    jwt_algorithm: str

    cache_maxsize: int
    cache_ttl: int

    cosmos_endpoint: str
    cosmos_key: str

    database_name: str

    default_order_by: str
    default_order_dir: str


SETTINGS = Settings()  # type: ignore
