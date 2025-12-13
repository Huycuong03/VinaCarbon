import json
from contextlib import asynccontextmanager
from urllib.parse import quote, unquote

from azure.cosmos.aio import CosmosClient
from azure.cosmos.exceptions import CosmosHttpResponseError, CosmosResourceNotFoundError
from cachetools import TTLCache
from fastapi import FastAPI, HTTPException, status
from src.settings import SETTINGS
from src.utils import clean_document, construct_query

cosmos_client = CosmosClient(SETTINGS.cosmos_endpoint, SETTINGS.cosmos_key)
database = cosmos_client.get_database_client(SETTINGS.database_name)
cache = TTLCache(SETTINGS.cache_maxsize, SETTINGS.cache_ttl)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await cosmos_client.close()


app = FastAPI(lifespan=lifespan)


@app.post("/{container_name}", status_code=status.HTTP_204_NO_CONTENT)
async def create_document(container_name: str, document: dict):
    try:
        container = database.get_container_client(container_name)
        await container.create_item(document)
    except CosmosResourceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except CosmosHttpResponseError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.get("/{container_name}")
async def get_all_documents(
    container_name: str, page_size: int | None, continuation: str | None = None
):
    try:
        continuation = unquote(continuation) if continuation else None
        if continuation in cache:
            pages = cache[continuation]
        else:
            container = database.get_container_client(container_name)
            pages = container.read_all_items(max_item_count=page_size).by_page()

        page = await anext(pages)

        if continuation is None:
            continuation = getattr(pages, "continuation_token", None)
            if continuation is not None:
                continuation_obj: dict = json.loads(continuation)
                continuation = continuation_obj["token"]
                cache[continuation] = pages

        documents = [clean_document(doc) async for doc in page]
        continuation = quote(continuation) if continuation else None
        return {
            "documents": documents,
            "continuation": continuation,
        }
    except StopIteration as e:
        cache.pop(continuation, None)
        return {
            "documents": [],
            "continuation": None,
        }
    except CosmosResourceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except CosmosHttpResponseError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.get("/{container_name}/{document_id}")
async def find_document_by_id(container_name: str, document_id: str):
    try:
        container = database.get_container_client(container_name)
        document = await container.read_item(
            item=document_id, partition_key=document_id
        )
        document = clean_document(document)
        return {"document": document}
    except CosmosResourceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except CosmosHttpResponseError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.post("/{container_name}/query")
async def query_documents(
    container_name: str,
    query_params: dict | None = None,
    page_size: int | None = None,
    continuation: str | None = None,
):
    try:
        continuation = unquote(continuation) if continuation else None
        if continuation in cache:
            pages = cache[continuation]
        else:
            if container_name is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid continuation token. Fallback to query but container was not specified.",
                )
            container = database.get_container_client(container_name)
            query, params = construct_query(query_params)
            pages = container.query_items(
                query=query,
                parameters=params,
                max_item_count=page_size,
            ).by_page()

        page = await anext(pages)

        if continuation is None:
            continuation = getattr(pages, "continuation_token", None)
            if continuation is not None:
                cache[continuation] = pages

        documents = [clean_document(doc) async for doc in page]
        continuation = quote(continuation) if continuation else None

        return {
            "documents": documents,
            "continuation": continuation,
        }
    except StopIteration as e:
        cache.pop(continuation, None)
        return {
            "documents": [],
            "continuation": None,
        }
    except CosmosResourceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except (CosmosHttpResponseError, KeyError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.patch("/{container_name}/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_document(container_name: str, document_id: str, updates: dict):
    try:
        container = database.get_container_client(container_name)
        await container.patch_item(
            item=document_id,
            partition_key=document_id,
            patch_operations=[
                {"op": "replace", "path": f"/{key}", "value": value}
                for key, value in updates.items()
            ],
        )
    except CosmosResourceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except CosmosHttpResponseError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.delete("/{container_name}/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(container_name: str, document_id: str):
    try:
        container = database.get_container_client(container_name)
        await container.delete_item(item=document_id, partition_key=document_id)
    except CosmosResourceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except CosmosHttpResponseError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
