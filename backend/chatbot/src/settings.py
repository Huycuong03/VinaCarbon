from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cache_maxsize: int = 1_000
    cache_ttl: int = 60 * 60 * 2

    aif_project_endpoint: str
    aif_agent_id: str


SETTINGS = Settings()  # type: ignore
