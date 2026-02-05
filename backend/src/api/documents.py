from urllib.parse import quote

import httpx
from azure.ai.projects.aio import AIProjectClient
from azure.core.exceptions import HttpResponseError
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from src.dependencies import get_foundry_project_client, get_search_service
from src.services import SearchService
from src.settings import LOGGER

router = APIRouter(prefix="/api/documents")


@router.get("")
async def search(
    query: str = Query(..., alias="q"),
    search_service: SearchService = Depends(get_search_service),
):
    try:
        documents = await search_service.search(query)
        return {"data": documents}
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.get("/{document_id}")
async def get(
    document_id: str,
    filename: str = Query(..., alias="filename"),
    project_client: AIProjectClient = Depends(get_foundry_project_client),
):
    try:
        credentials = await project_client.datasets.get_credentials(document_id, "1")
        sas_uri = credentials.blob_reference.credential.sas_uri

        async with httpx.AsyncClient(timeout=None) as client:
            resp = await client.get(sas_uri, follow_redirects=True)
            resp.raise_for_status()

            return StreamingResponse(
                resp.aiter_bytes(),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"inline; filename={quote(filename)}",
                },
            )
    except HttpResponseError as e:
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=e.message)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=str(e))
