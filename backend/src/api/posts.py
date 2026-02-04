import uuid

from azure.core.exceptions import HttpResponseError
from azure.storage.blob.aio import ContainerClient
from cachetools import TTLCache
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from src.ai.community import moderate_content
from src.dependencies import (
    get_blob_container_client,
    get_cache,
    get_post_service,
    verify_token,
)
from src.models import Post, User
from src.services import PostService
from src.settings import LOGGER

router = APIRouter(prefix="/api/posts")


@router.get("")
async def get(
    page_size: int = Query(default=5, alias="n"),
    continuation_token: str = Header(..., alias="X-Continuation-Token"),
    cache: TTLCache = Depends(get_cache),
    post_service: PostService = Depends(get_post_service),
):
    try:
        if continuation_token in cache:
            pages = cache[continuation_token]
        else:
            pages = await post_service.get_all(page_size)
            cache[continuation_token] = pages

        page = await pages.__anext__()

        posts = []
        async for post_item in page:
            post = Post.model_validate(post_item)
            posts.append(post)

        return {"data": posts}
    except StopAsyncIteration:
        return {"data": None}
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.post("")
async def post(
    content: str = Form(...),
    image_blobs: list[UploadFile] = File(default=[], alias="images"),
    request_user: User = Depends(verify_token),
    blob_container_client: ContainerClient = Depends(get_blob_container_client),
    post_service: PostService = Depends(get_post_service),
):
    try:
        content_moderation_passed = moderate_content(content)
        if not content_moderation_passed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Community Guardlines Violated",
            )

        images = []
        if image_blobs:
            for blob in image_blobs:
                blob_name = f"images/{request_user.id}/{uuid.uuid4()}"
                blob_client = blob_container_client.get_blob_client(blob_name)

                await blob_client.upload_blob(
                    await blob.read(),
                    overwrite=True,
                    content_type=blob.content_type,
                )

                images.append(blob_client.url)

        post = Post(
            id="dummy",
            author=request_user,
            content=content,
            images=images,
        )

        await post_service.create(post)
        return {"data": post}
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)
