from pydantic import BaseModel, ConfigDict


class Document(BaseModel):
    document_id: str
    title: str
    url: str
    content_type: str
    created_at: int | str
    storage_size: int

    model_config = ConfigDict(extra="ignore")
