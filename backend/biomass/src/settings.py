from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    preliminary_biomass_estimation_path: str

    model_config = SettingsConfigDict(extra="ignore")


SETTINGS = Settings()  # type: ignore
