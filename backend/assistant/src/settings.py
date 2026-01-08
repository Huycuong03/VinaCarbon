from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    aif_project_endpoint: str
    aif_agent_name: str
    ad_client_id: str
    ad_client_secret: str
    ad_tenant_id: str

    model_config = SettingsConfigDict(extra="ignore")


SETTINGS = Settings()  # type: ignore
