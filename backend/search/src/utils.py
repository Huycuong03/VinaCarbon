from datetime import datetime

from pandas import DataFrame
from pydantic import BaseModel, ConfigDict


class DocumentMetaData(BaseModel):
    title: str
    url: str
    content_type: str
    last_modified: datetime
    storage_size: float


class SearchHit(BaseModel):
    id: str
    score: float = 0
    bm25: float = 0
    cosine: float = 0
    meta: DocumentMetaData | None = None

    model_config = ConfigDict(extra="ignore")


def aggregate_search_hits(hits: list[SearchHit]) -> list[SearchHit]:
    df = DataFrame([hit.model_dump(exclude=set("meta")) for hit in hits])
    df["score"] = df["bm25"] + df["cosine"]
    df = (
        df.groupby("id")
        .agg({"bm25": "max", "cosine": "max", "score": "max"})
        .reset_index()
    )
    df = df.sort_values(by="score", ascending=False)

    hits = [SearchHit(**doc) for doc in df.to_dict(orient="records")]  # type: ignore

    return hits
