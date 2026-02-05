import logging

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Azure AI Search
    search_endpoint: str
    search_key: str
    search_index_name: str

    # Azure Cosmos DB
    cosmos_endpoint: str
    cosmos_key: str
    cosmos_database_name: str

    # Blob Storage
    blob_storage_connection_string: str
    blob_container_name: str

    # Microsoft Foundry
    foundry_project_endpoint: str
    foundry_agent_name: str

    # Microsoft Entra ID
    entra_id_client_id: str
    entra_id_client_secret: str
    entra_id_tenant_id: str

    # GEE
    gee_service_account: str
    gee_private_key_path: str

    # Preliminary estimation
    preliminary_estimation_list_path: str
    estimation_area_limit: int = 2_000_000

    # Cache
    cache_maxsize: int = 1_000
    cache_ttl: int = 60 * 60 * 2

    # Security
    nextauth_secret: str
    jwt_algorithm: str

    # Others
    carbon_stock_to_biomass_ratio: float = 0.47
    model_config = SettingsConfigDict(extra="ignore", env_file=".env")


SETTINGS = Settings()  # type: ignore
LOGGER = logging.getLogger("uvicorn")
