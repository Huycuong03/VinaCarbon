from pydantic import BaseModel, ConfigDict, Field


class Document(BaseModel):
    id: str = Field(alias="parent_id")
    title: str = Field(alias="metadata_storage_name")
    url: str = Field(alias="metadata_storage_path")
    content_type: str = Field(alias="metadata_storage_content_type")
    last_modified: int | str = Field(alias="metadata_storage_last_modified")
    storage_size: float = Field(alias="metadata_storage_size")

    model_config = ConfigDict(
        extra="ignore", populate_by_name=True, serialize_by_alias=False
    )
