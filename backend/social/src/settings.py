from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cache_maxsize: int
    cache_ttl: int

    cosmos_endpoint: str
    cosmos_key: str

    database_name: str

    default_order_by: str
    default_order_dir: str


SETTINGS = Settings()  # type: ignore
