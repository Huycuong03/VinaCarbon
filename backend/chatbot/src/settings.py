from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_public_key: str
    jwt_algorithm: str

    azure_client_id: str

    aif_project_endpoint: str
    aif_agent_id: str


SETTINGS = Settings()  # type: ignore
