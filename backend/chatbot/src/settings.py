from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cache_maxsize: int = 1_000
    cache_ttl: int = 60 * 60 * 2

    aif_project_endpoint: str = (
        "https://vinacarbon-foundry-default.services.ai.azure.com/api/projects/first-project"
    )
    aif_agent_id: str = "asst_q9MJOyZybyrMHqNPxOO8mo60"


SETTINGS = Settings()  # type: ignore
