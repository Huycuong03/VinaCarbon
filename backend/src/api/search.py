from azure.core.exceptions import HttpResponseError
from fastapi import APIRouter, Depends, HTTPException, Query, status
from src.dependencies import get_search_service
from src.models import Document
from src.services import SearchService
from src.settings import LOGGER

router = APIRouter(prefix="/api/search")


@router.get("", response_model=list[Document], response_model_by_alias=False)
async def get(
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
