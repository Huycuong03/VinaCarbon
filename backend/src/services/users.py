from typing import AsyncIterator

from azure.cosmos.aio import ContainerProxy
from openai import AsyncOpenAI
from openai.types.conversations import Message as ConversationMessage
from openai.types.responses.response_input_param import Message as ResponseInputMessage
from src.models import Profile, Update
from src.settings import SETTINGS


class UserService:
    def __init__(
        self, cosmos_container: ContainerProxy, openai_client: AsyncOpenAI
    ) -> None:
        self.cosmos_container = cosmos_container
        self.openai_client = openai_client

    async def create_profile(self, profile: Profile) -> Profile:
        conversation = await self.openai_client.conversations.create()
        profile.conversation_id = conversation.id
        item = profile.model_dump()
        item = await self.cosmos_container.create_item(item)
        profile = Profile.model_validate(item)
        return profile

    async def get_profile(self, user_id: str) -> Profile:
        item = await self.cosmos_container.read_item(
            item=user_id, partition_key=user_id
        )
        profile = Profile.model_validate(item)
        return profile

    async def update_profile(self, user_id: str, updates: list[Update]):
        await self.cosmos_container.patch_item(
            item=user_id,
            partition_key=user_id,
            patch_operations=[update.model_dump() for update in updates],
        )

    async def delete_profile(self, user_id: str):
        await self.cosmos_container.delete_item(item=user_id, partition_key=user_id)

    async def get_conversation_history(self, user_id: str) -> list[ConversationMessage]:
        profile = await self.get_profile(user_id)
        messages = [
            item
            async for item in self.openai_client.conversations.items.list(
                profile.conversation_id
            )
            if item.type == "message"
        ]

        return messages

    async def stream_response(
        self, user_id: str, user_message: ResponseInputMessage
    ) -> AsyncIterator[str]:
        profile = await self.get_profile(user_id)
        await self.openai_client.conversations.items.create(
            profile.conversation_id,
            items=[user_message],
        )

        response = await self.openai_client.responses.create(
            conversation=profile.conversation_id,
            extra_body={
                "agent": {
                    "name": SETTINGS.foundry_agent_name,
                    "type": "agent_reference",
                }
            },
            stream=True,
        )

        async for event in response:
            if event.type == "response.output_text.delta":
                yield event.delta

    async def renew_conversation(self, user_id: str) -> None:
        profile = await self.get_profile(user_id)
        await self.openai_client.conversations.delete(profile.conversation_id)

        conversation = await self.openai_client.conversations.create()
        await self.update_profile(
            user_id,
            [Update(op="replace", path="/conversation_id", value=conversation.id)],
        )
