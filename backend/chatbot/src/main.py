from azure.ai.agents.aio import AgentsClient
from azure.ai.agents.models import MessageRole
from azure.identity.aio import DefaultAzureCredential
from fastapi import Depends, FastAPI, Request
from microsoft_agents.authentication.msal import MsalConnectionManager
from microsoft_agents.hosting.core import AuthTypes, MemoryStorage, TurnContext
from microsoft_agents.hosting.core.app import AgentApplication
from microsoft_agents.hosting.fastapi import CloudAdapter, start_agent_process
from src.settings import SETTINGS
from src.utils import get_thread_id, set_thread_id, verify_internal_token

aif_client = AgentsClient(
    endpoint=SETTINGS.aif_project_endpoint,
    credential=DefaultAzureCredential(),
)

adapter = CloudAdapter(
    connection_manager=MsalConnectionManager(
        connections_configurations={  # type: ignore
            "SERVICE_CONNECTION": {
                "auth_type": AuthTypes.user_managed_identity,
                "client_id": SETTINGS.azure_client_id,
            }
        }
    )
)
agent_app = AgentApplication(storage=MemoryStorage(), adapter=adapter)
app = FastAPI()


@app.post("/api/messages")
async def messages(request: Request, user=Depends(verify_internal_token)):
    return await start_agent_process(request, agent_app, adapter)


@agent_app.activity("message")
async def on_message(context: TurnContext, state):

    channel_id = context.activity.channel_id
    conversation_id = context.activity.conversation.id
    thread_id = get_thread_id(channel_id, conversation_id)

    if thread_id is None:
        thread = await aif_client.threads.create()
        set_thread_id(channel_id, conversation_id, thread.id)
    else:
        thread = await aif_client.threads.get(thread_id=thread_id)

    await aif_client.messages.create(
        thread_id=thread.id,
        role=MessageRole.USER,
        content=context.activity.text,
    )

    run = await aif_client.runs.create_and_process(
        thread_id=thread.id, agent_id=SETTINGS.aif_agent_id
    )

    if run.status == "failed":
        response = f"Sorry, something went wrong while processing your request. {run.last_error}"
    else:
        response = await aif_client.messages.get_last_message_text_by_role(
            thread_id=thread.id, role=MessageRole.AGENT
        )
        response = response.text.value  # type: ignore

    await context.send_activity(response)
