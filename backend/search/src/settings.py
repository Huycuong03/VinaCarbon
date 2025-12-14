from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    search_endpoint: str
    search_key: str

    search_document_index_name: str = "document-index"
    search_chunk_index_name: str = "chunk-index"

    search_data_container_name: str = "documents"
    search_data_source_name: str = "data-source"
    search_data_source_connection: str

    search_skillset_name: str = "skillset"
    search_embedding_model: str = "text-embedding-ada-002"
    search_embedding_dim: int = 1536

    search_indexer_name: str = "indexer"

    ai_endpoint: str
    ai_key: str
    ai_api_version: str

    model_config = SettingsConfigDict(extra="ignore")


SETTINGS = Settings()  # type: ignore
