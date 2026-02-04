from contextlib import asynccontextmanager

import ee
from azure.ai.projects.aio import AIProjectClient
from azure.core.credentials import AzureKeyCredential
from azure.cosmos.aio import CosmosClient
from azure.identity.aio import ClientSecretCredential
from azure.search.documents.aio import SearchClient
from azure.storage.blob.aio import BlobServiceClient
from cachetools import TTLCache
from ee._helpers import ServiceAccountCredentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncAzureOpenAI
from src.api import biomass_api
from src.services import (
    BiomassPreliminaryEstimationService,
    BiomassRuntimeEstimationService,
)
from src.settings import SETTINGS


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with (
        SearchClient(
            SETTINGS.search_endpoint,
            SETTINGS.search_index_name,
            AzureKeyCredential(SETTINGS.search_key),
        ) as search_client,
        AsyncAzureOpenAI(
            azure_endpoint=SETTINGS.foundry_text_embedder_endpoint,
            api_key=SETTINGS.foundry_text_embedder_api_key,
            api_version=SETTINGS.foundry_text_embedder_api_version,
        ) as text_embedding_client,
        CosmosClient(SETTINGS.cosmos_endpoint, SETTINGS.cosmos_key) as cosmos_client,
        BlobServiceClient.from_connection_string(
            SETTINGS.blob_storage_connection_string
        ) as blob_client,
        blob_client.get_container_client(
            SETTINGS.blob_container_name
        ) as blob_container_client,
        ClientSecretCredential(
            tenant_id=SETTINGS.entra_id_tenant_id,
            client_id=SETTINGS.entra_id_client_id,
            client_secret=SETTINGS.entra_id_client_secret,
        ) as foundry_credential,
        AIProjectClient(
            endpoint=SETTINGS.foundry_project_endpoint,
            credential=foundry_credential,
        ) as foundry_project_client,
        foundry_project_client.get_openai_client() as openai_client,
    ):
        ee.Initialize(
            credentials=ServiceAccountCredentials(
                SETTINGS.gee_service_account,
                SETTINGS.gee_private_key_path,
            )
        )

        cache = TTLCache(maxsize=SETTINGS.cache_maxsize, ttl=SETTINGS.cache_ttl)

        app.state.search_client = search_client
        app.state.text_embedding_client = text_embedding_client
        app.state.cosmos_client = cosmos_client
        app.state.blob_client = blob_client
        app.state.blob_container_client = blob_container_client
        app.state.foundry_project_client = foundry_project_client
        app.state.openai_client = openai_client
        app.state.cache = cache

        app.state.biomass_preliminary_estimation_service = (
            BiomassPreliminaryEstimationService()
        )
        app.state.biomass_runtime_estimation_service = BiomassRuntimeEstimationService()

        yield

        app.state.cache.clear()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Statistics"],
)

app.include_router(biomass_api)
