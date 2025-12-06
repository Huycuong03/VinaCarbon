from azure.core.credentials import AzureKeyCredential
from azure.search.documents.aio import SearchClient
from azure.search.documents.models import QueryType, SearchMode
from fastapi import FastAPI
from src.settings import SETTINGS
from src.utils import aggregate_search_hits

search_client = SearchClient(
    SETTINGS.search_endpoint,
    SETTINGS.index_name,
    AzureKeyCredential(SETTINGS.search_key),
)

app = FastAPI()


@app.get("/")
async def search(query: str, page: int = 1, page_size: int = 10):
    hits = await search_client.search(
        query,
        query_type=QueryType.SIMPLE,
        search_mode=SearchMode.ANY,
    )

    documents = await aggregate_search_hits(hits)

    total_results = len(documents)
    total_pages = (total_results + page_size - 1) // page_size

    start = (page - 1) * page_size
    end = start + page_size
    paginated = documents[start:end]

    return {
        "query": query,
        "page": page,
        "page_size": page_size,
        "total_results": total_results,
        "total_pages": total_pages,
        "results": paginated,
    }
