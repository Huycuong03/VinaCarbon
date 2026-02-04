from azure.core.exceptions import HttpResponseError
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from openai.types.responses.response_input_param import Message

from src.dependencies import get_user_service, verify_token
from src.models import User
from src.services import UserService
from src.settings import LOGGER

router = APIRouter(prefix="/api/assistant")


@router.get("")
async def get(
    request_user: User = Depends(verify_token),
    user_service: UserService = Depends(get_user_service),
):
    try:
        messages = await user_service.get_conversation_history(user_id=request_user.id)
        return {"data": messages}
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.post("")
async def post(
    message: Message,
    request_user: User = Depends(verify_token),
    user_service: UserService = Depends(get_user_service),
):
    try:
        return StreamingResponse(
            user_service.stream_response(
                user_id=request_user.id,
                user_message=message,
            )
        )
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    request_user: User = Depends(verify_token),
    user_service: UserService = Depends(get_user_service),
):
    try:
        await user_service.renew_conversation(user_id=request_user.id)
    except HttpResponseError as e:
        LOGGER.debug(e.message)
        status_code = e.status_code if e.status_code else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code)
