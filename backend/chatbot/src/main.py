from contextlib import asynccontextmanager
from urllib.parse import quote, unquote

from azure.ai.agents.aio import AgentsClient
from azure.ai.agents.models import (
    ListSortOrder,
    MessageInputTextBlock,
    MessageRole,
    ThreadMessage,
)
from azure.core.exceptions import HttpResponseError
from azure.identity.aio import DefaultAzureCredential
from cachetools import TTLCache
from fastapi import FastAPI, HTTPException, status
from src.settings import SETTINGS

aif_client = AgentsClient(
    endpoint=SETTINGS.aif_project_endpoint,
    credential=DefaultAzureCredential(),
)
cache = TTLCache(SETTINGS.cache_maxsize, SETTINGS.cache_ttl)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await aif_client.close()


app = FastAPI(lifespan=lifespan)


@app.get("/{thread_id}")
async def get_messages(
    thread_id: str, page_size: int | None = None, continuation: str | None = None
):
    try:
        continuation = unquote(continuation) if continuation else None
        if continuation in cache:
            pages = cache[continuation]
        else:
            pages = aif_client.messages.list(
                thread_id=thread_id, limit=page_size, order=ListSortOrder.DESCENDING
            ).by_page()

        page = await anext(pages)

        if continuation is None:
            continuation = getattr(pages, "continuation_token", None)
            if continuation is not None:
                cache[continuation] = pages

        messages = [msg async for msg in page]
        continuation = quote(continuation) if continuation else None
        return {
            "messages": messages,
            "continuation": continuation,
        }
    except StopIteration as e:
        cache.pop(continuation, None)
        return {
            "messages": [],
            "continuation": None,
        }
    except HttpResponseError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.post("/{thread_id}")
async def post_messages(thread_id: str, message: dict):
    try:
        await aif_client.messages.create(
            thread_id=thread_id,
            role=MessageRole.USER,
            content=[MessageInputTextBlock(message)],
        )

        run = await aif_client.runs.create_and_process(
            thread_id=thread_id, agent_id=SETTINGS.aif_agent_id
        )

        if run.status == "failed":
            response = ThreadMessage(
                {
                    "content": [
                        {
                            "type": "text",
                            "text": {"value": run.last_error.as_dict()},
                        }
                    ]
                }
            )
        else:
            response = await aif_client.messages.get_last_message_by_role(
                thread_id=thread_id, role=MessageRole.AGENT
            )
        if response:
            return response.as_dict()
    except HttpResponseError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
