from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    cache_maxsize: int = 1_000
    cache_ttl: int = 60 * 60 * 2

    tenant_id: str
    app_id: str
    app_secret: str

    aif_project_endpoint: str
    aif_agent_id: str

    model_config = SettingsConfigDict(extra="ignore")


SETTINGS = Settings()  # type: ignore
