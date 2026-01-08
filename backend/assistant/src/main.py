from contextlib import asynccontextmanager

from azure.ai.projects.aio import AIProjectClient
from azure.core.exceptions import HttpResponseError
from azure.identity.aio import ClientSecretCredential
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from src.settings import SETTINGS


@asynccontextmanager
async def lifespan(app: FastAPI):
    credential = ClientSecretCredential(
        tenant_id=SETTINGS.ad_tenant_id,
        client_id=SETTINGS.ad_client_id,
        client_secret=SETTINGS.ad_client_secret,
    )
    app.state.project_client = AIProjectClient(
        endpoint=SETTINGS.aif_project_endpoint, credential=credential
    )
    app.state.openai_client = app.state.project_client.get_openai_client()
    app.state.db = {}
    yield
    app.state.db = None
    await app.state.openai_client.close()
    await app.state.project_client.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def get_conversation_history(id: str):
    if id not in app.state.db:
        conversation = await app.state.openai_client.conversations.create()
        app.state.db[id] = conversation.id
        return []
    else:
        conversation_id = app.state.db[id]
        try:
            items = [
                item
                async for item in app.state.openai_client.conversations.items.list(
                    conversation_id=conversation_id
                )
            ]

            return items
        except HttpResponseError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.post("/")
async def get_response(id: str, message: dict):
    if id not in app.state.db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation Not Found, ID: {id}",
        )

    conversation_id = app.state.db[id]
    content = message["content"]

    try:
        await app.state.openai_client.conversations.items.create(
            conversation_id=conversation_id,
            items=[{"type": "message", "role": "user", "content": content}],
        )

        response = await app.state.openai_client.responses.create(
            conversation=conversation_id,
            extra_body={
                "agent": {"name": SETTINGS.aif_agent_name, "type": "agent_reference"}
            },
            input="",
        )

        return response.output
    except HttpResponseError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
