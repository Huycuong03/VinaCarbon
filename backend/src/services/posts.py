from typing import AsyncIterator

from azure.cosmos.aio import ContainerProxy
from src.models import Post, Update


class PostService:
    def __init__(self, cosmos_container: ContainerProxy) -> None:
        self.cosmos_container = cosmos_container

    async def create(self, post: Post) -> Post:
        item = post.model_dump(exclude={"id"})
        item = await self.cosmos_container.create_item(item)
        post = Post.model_validate(item)
        return post

    async def get(self, post_id: str, author_id: str) -> Post:
        item = await self.cosmos_container.read_item(
            item=post_id, partition_key=author_id
        )
        post = Post.model_validate(item)
        return post

    async def get_all(self, page_size: int = 5) -> AsyncIterator:
        query = "SELECT * FROM c ORDER BY c._ts DESC"
        pages = self.cosmos_container.query_items(
            query=query, max_item_count=page_size
        ).by_page()
        return pages

    async def get_posts_by_user_id(
        self, user_id: str, page_size: int = 5
    ) -> AsyncIterator:
        query = f"SELECT * FROM c WHERE c.author.id = @user_id ORDER BY c._ts DESC"
        pages = self.cosmos_container.query_items(
            query=query,
            max_item_count=page_size,
            parameters=[{"name": "@user_id", "value": user_id}],
        ).by_page()
        return pages

    async def update(self, post_id: str, author_id: str, updates: list[Update]) -> None:
        await self.cosmos_container.patch_item(
            item=post_id,
            partition_key=author_id,
            patch_operations=[update.model_dump() for update in updates],
        )

    async def delete(
        self,
        post_id: str,
        author_id: str,
    ) -> None:
        await self.cosmos_container.delete_item(item=post_id, partition_key=author_id)
