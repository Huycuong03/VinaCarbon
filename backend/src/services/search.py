from azure.search.documents.aio import SearchClient
from azure.search.documents.models import VectorizedQuery
from openai import AsyncAzureOpenAI

from src.models import Document
from src.settings import SETTINGS


class SearchService:
    def __init__(
        self, search_client: SearchClient, text_embedding_client: AsyncAzureOpenAI
    ) -> None:
        self.search_client = search_client
        self.text_embedding_client = text_embedding_client

    async def search(self, query: str) -> list[Document]:
        query = (
            query
            if len(query) <= SETTINGS.foundry_text_embedder_token_limit
            else query[: SETTINGS.foundry_text_embedder_token_limit]
        )
        response = await self.text_embedding_client.embeddings.create(
            input=query, model=SETTINGS.foundry_text_embedder_name
        )
        embedding = response.data[0].embedding

        search_hits = await self.search_client.search(
            vector_queries=[VectorizedQuery(fields="embedding", vector=embedding)]
        )

        seen = set()
        documents: list[Document] = []

        async for hit in search_hits:
            if hit["parent_id"] not in seen:
                document = Document.model_validate(hit)
                documents.append(document)
                seen.add(document.id)

        return documents
