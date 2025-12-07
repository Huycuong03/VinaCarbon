from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    cache_maxsize: int = 1_000
    cache_ttl: int = 60 * 60 * 2

    cosmos_endpoint: str
    cosmos_key: str
    database_name: str

    default_order_by: str = "c._ts"
    default_order_dir: str = "DESC"

    model_config = SettingsConfigDict(extra="ignore")


SETTINGS = Settings()  # type: ignore
