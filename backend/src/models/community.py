from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict


class Update(BaseModel):
    op: Literal["add", "set", "replace", "remove", "incr", "move"]
    path: str
    value: Any


class User(BaseModel):
    id: str
    email: str
    name: str | None = None
    image: str | None = None


class Profile(BaseModel):
    id: str
    email: str
    name: str | None = None
    image: str | None = None
    bio: str | None = None
    address: str | None = None
    followers: list[User] = []
    followings: list[User] = []
    conversation_id: str

    model_config = ConfigDict(extra="ignore")

    def get_preview(self) -> User:
        return User(
            id=self.id,
            email=self.email,
            name=self.name,
            image=self.image,
        )

    @property
    def follower_ids(self) -> set[str]:
        return {user.id for user in self.followers}

    @property
    def following_ids(self) -> set[str]:
        return {user.id for user in self.followings}


class Comment(BaseModel):
    author: User
    created_at: float = datetime.now().timestamp()
    content: str


class Post(BaseModel):
    id: str
    author: User
    created_at: float = datetime.now().timestamp()
    content: str
    images: list[str] = []
    likes: list[User] = []
    comments: list[Comment] = []

    model_config = ConfigDict(extra="ignore")

    @property
    def like_ids(self) -> set[str]:
        return {user.id for user in self.likes}
