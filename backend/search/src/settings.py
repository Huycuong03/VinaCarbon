from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    search_endpoint: str
    search_key: str
    index_name: str


SETTINGS = Settings()  # type: ignore
