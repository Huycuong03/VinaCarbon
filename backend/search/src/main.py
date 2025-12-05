import os

from azure.ai.agents import AgentsClient
from azure.ai.agents.models import FilePurpose, FileSearchTool
from azure.identity import DefaultAzureCredential

agents_client = AgentsClient(
    endpoint="https://vinacarbon-foundry.services.ai.azure.com/api/projects/first-project",
    credential=DefaultAzureCredential(),
)

file = agents_client.files.upload_and_poll(
    file_path="C:/Users/caohu/Downloads/VTN and Partners - Tín chỉ Carbon và Thị trường Carbon theo Pháp luật Việt Nam.pdf",
    purpose=FilePurpose.AGENTS,
)
print(f"Uploaded file, file ID: {file.id}")

vector_store = agents_client.vector_stores.create_and_poll(
    file_ids=[file.id], name="my_vectorstore"
)
print(f"Created vector store, vector store ID: {vector_store.id}")

file_search = FileSearchTool(vector_store_ids=[vector_store.id])

agent = agents_client.create_agent(
    model=os.environ["MODEL_DEPLOYMENT_NAME"],
    name="my-agent",
    instructions="Hello, you are helpful agent and can search information from uploaded files",
    tools=file_search.definitions,
    tool_resources=file_search.resources,
)
print(f"Created agent, agent ID: {agent.id}")
