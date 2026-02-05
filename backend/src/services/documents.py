from azure.search.documents.aio import SearchClient
from azure.search.documents.models import VectorizableTextQuery
from src.models import Document


class SearchService:
    def __init__(self, search_client: SearchClient) -> None:
        self.search_client = search_client

    async def search(self, query: str) -> list[Document]:
        search_hits = await self.search_client.search(
            vector_queries=[VectorizableTextQuery(text=query, fields="embedding")]
        )

        seen = set()
        documents: list[Document] = []

        async for hit in search_hits:
            if hit["document_id"] not in seen:
                document = Document.model_validate(hit)
                documents.append(document)
                seen.add(document.document_id)

        return documents
