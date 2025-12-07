from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    search_endpoint: str
    search_key: str
    index_name: str

    model_config = SettingsConfigDict(extra="ignore")


SETTINGS = Settings()  # type: ignore
