import hashlib

from azure.ai.projects.aio import AIProjectClient
from azure.cosmos.aio import CosmosClient
from azure.search.documents.aio import SearchClient
from azure.storage.blob.aio import ContainerClient
from cachetools import TTLCache
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from openai import AsyncOpenAI
from src.models import User
from src.services import *
from src.settings import SETTINGS


def verify_token(authorization=Depends(HTTPBearer())):
    try:
        payload = jwt.decode(
            authorization.credentials,
            SETTINGS.nextauth_secret,
            algorithms=[SETTINGS.jwt_algorithm],
        )

        try:
            if "id" not in payload:
                key: str = payload["email"] + SETTINGS.nextauth_secret
                payload["id"] = hashlib.sha256(key.encode()).hexdigest()

            payload["image"] = payload.get("picture")
            request_user = User.model_validate(payload)
            return request_user
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


def get_search_service(request: Request) -> SearchService:
    search_client: SearchClient = request.app.state.search_client
    return SearchService(search_client)


def get_user_service(request: Request) -> UserService:
    cosmos_client: CosmosClient = request.app.state.cosmos_client
    cosmos_database = cosmos_client.get_database_client(SETTINGS.cosmos_database_name)
    cosmos_container = cosmos_database.get_container_client("users")
    openai_client: AsyncOpenAI = request.app.state.openai_client
    return UserService(cosmos_container, openai_client)


def get_post_service(request: Request) -> PostService:
    cosmos_client: CosmosClient = request.app.state.cosmos_client
    cosmos_database = cosmos_client.get_database_client(SETTINGS.cosmos_database_name)
    cosmos_container = cosmos_database.get_container_client("posts")
    return PostService(cosmos_container)


def get_blob_container_client(request: Request) -> ContainerClient:
    blob_container_client: ContainerClient = request.app.state.blob_container_client
    return blob_container_client


def get_cache(request: Request) -> TTLCache:
    return request.app.state.cache


def get_biomass_preliminary_estimation_service(
    request: Request,
) -> BiomassPreliminaryEstimationService:
    return request.app.state.biomass_preliminary_estimation_service


def get_biomass_runtime_estimation_service(
    request: Request,
) -> BiomassRuntimeEstimationService:
    return request.app.state.biomass_runtime_estimation_service


def get_foundry_project_client(request: Request) -> AIProjectClient:
    return request.app.state.foundry_project_client
