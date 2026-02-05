from typing import Any

from azure.core.exceptions import HttpResponseError
from azure.cosmos.exceptions import CosmosResourceNotFoundError
from cachetools import TTLCache
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from numpy import add
from src.dependencies import get_cache, get_post_service, get_user_service, verify_token
from src.models import Comment, Post, Profile, Update, User
from src.services import PostService, UserService
from src.settings import LOGGER

router = APIRouter(prefix="/api/users")


@router.post("", status_code=status.HTTP_204_NO_CONTENT)
async def post(
    request_user: User = Depends(verify_token),
    user_service: UserService = Depends(get_user_service),
):
    try:
        await user_service.get_profile(user_id=request_user.id)
    except CosmosResourceNotFoundError:
        profile = Profile(
            id=request_user.id,
            email=request_user.email,
            name=request_user.name,
            image=request_user.image,
            conversation_id="dummy",
        )
        await user_service.create_profile(profile)
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.get("/{user_id}")
async def get(user_id: str, user_service: UserService = Depends(get_user_service)):
    try:
        profile = await user_service.get_profile(user_id)
        return {"data": profile}
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.patch("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def patch(
    user_id: str,
    updates: list[Update],
    request_user: User = Depends(verify_token),
    user_service: UserService = Depends(get_user_service),
):
    try:
        if request_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

        await user_service.update_profile(user_id=user_id, updates=updates)
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.patch("/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
async def follow(
    user_id: str,
    request_user: User = Depends(verify_token),
    user_service: UserService = Depends(get_user_service),
):
    try:
        if request_user.id == user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

        user_profile = await user_service.get_profile(user_id=user_id)
        request_user_profile = await user_service.get_profile(user_id=request_user.id)

        if request_user.id not in user_profile.follower_ids:
            add_follower = [Update(op="add", path="/followers/-", value=request_user)]
            await user_service.update_profile(user_id=user_id, updates=add_follower)

        if user_id not in request_user_profile.following_ids:
            add_following = [
                Update(op="add", path="/followings/-", value=user_profile.get_preview())
            ]
            await user_service.update_profile(
                user_id=request_user.id, updates=add_following
            )

    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.patch("/{user_id}/unfollow", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow(
    user_id: str,
    request_user: User = Depends(verify_token),
    user_service: UserService = Depends(get_user_service),
):
    try:
        if request_user.id == user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

        user_profile = await user_service.get_profile(user_id=user_id)
        request_user_profile = await user_service.get_profile(user_id=request_user.id)

        if request_user.id in user_profile.follower_ids:
            new_followers = [
                follower
                for follower in user_profile.followers
                if follower.id != request_user.id
            ]
            remove_follower = [
                Update(op="replace", path="/followers", value=new_followers)
            ]
            await user_service.update_profile(user_id=user_id, updates=remove_follower)

        if user_id in request_user_profile.following_ids:
            new_followings = [
                following
                for following in request_user_profile.followings
                if following.id != user_id
            ]
            remove_following = [
                Update(op="replace", path="/followings", value=new_followings)
            ]
            await user_service.update_profile(
                user_id=request_user.id, updates=remove_following
            )

    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.get("/{user_id}/posts")
async def get_posts(
    user_id: str,
    page_size: int = Query(default=5, alias="n"),
    continuation_token: str = Header(..., alias="X-Continuation-Token"),
    cache: TTLCache = Depends(get_cache),
    post_service: PostService = Depends(get_post_service),
):
    try:
        if continuation_token in cache:
            pages = cache[continuation_token]
        else:
            pages = await post_service.get_posts_by_user_id(user_id, page_size)
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


@router.patch("/{user_id}/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def patch_post(
    user_id: str,
    post_id: str,
    updates: list[Update],
    request_user: User = Depends(verify_token),
    post_service: PostService = Depends(get_post_service),
):
    try:
        if request_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

        await post_service.update(post_id=post_id, author_id=user_id, updates=updates)
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.patch("/{user_id}/posts/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def like_post(
    user_id: str,
    post_id: str,
    request_user: User = Depends(verify_token),
    post_service: PostService = Depends(get_post_service),
):
    try:
        post = await post_service.get(post_id=post_id, author_id=user_id)

        if request_user.id not in post.like_ids:
            add_like = [Update(op="add", path="/likes/-", value=request_user)]
            await post_service.update(
                post_id=post_id, author_id=user_id, updates=add_like
            )
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.patch(
    "/{user_id}/posts/{post_id}/unlike", status_code=status.HTTP_204_NO_CONTENT
)
async def unlike_post(
    user_id: str,
    post_id: str,
    request_user: User = Depends(verify_token),
    post_service: PostService = Depends(get_post_service),
):
    try:
        post = await post_service.get(post_id=post_id, author_id=user_id)

        if request_user.id in post.like_ids:
            new_likes = [like for like in post.likes if like.id != request_user.id]
            remove_like = [Update(op="replace", path="/likes", value=new_likes)]
            await post_service.update(
                post_id=post_id, author_id=user_id, updates=remove_like
            )
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.patch(
    "/{user_id}/posts/{post_id}/comments", status_code=status.HTTP_204_NO_CONTENT
)
async def add_comment(
    user_id: str,
    post_id: str,
    comment_item: dict[str, Any],
    request_user: User = Depends(verify_token),
    post_service: PostService = Depends(get_post_service),
):
    try:
        if "content" not in comment_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Comment content is required",
            )

        comment = Comment(author=request_user, content=comment_item["content"])
        add_comment = [Update(op="add", path="/comments/-", value=comment)]

        await post_service.update(
            post_id=post_id, author_id=user_id, updates=add_comment
        )
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)
