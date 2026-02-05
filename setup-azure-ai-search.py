from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient, SearchIndexerClient
from azure.search.documents.indexes.models import (
    AzureOpenAIEmbeddingSkill,
    AzureOpenAIVectorizer,
    AzureOpenAIVectorizerParameters,
    BM25SimilarityAlgorithm,
    HnswAlgorithmConfiguration,
    HnswParameters,
    IndexProjectionMode,
    InputFieldMappingEntry,
    OutputFieldMappingEntry,
    RescoringOptions,
    ScalarQuantizationCompression,
    ScalarQuantizationParameters,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    SearchIndex,
    SearchIndexer,
    SearchIndexerDataContainer,
    SearchIndexerDataSourceConnection,
    SearchIndexerIndexProjection,
    SearchIndexerIndexProjectionSelector,
    SearchIndexerIndexProjectionsParameters,
    SearchIndexerSkillset,
    SemanticConfiguration,
    SemanticField,
    SemanticPrioritizedFields,
    SemanticSearch,
    SimpleField,
    SplitSkill,
    TextSplitMode,
    VectorSearch,
    VectorSearchCompressionRescoreStorageMethod,
    VectorSearchCompressionTarget,
    VectorSearchProfile,
)

AZURE_BLOB_STORAGE_CONNECTION_STRING = "<your-azure-blob-storage-connection-string>"
AZURE_SEARCH_SERVICE_ENDPOINT = "<your-azure-search-service-endpoint>"
AZURE_SEARCH_SERVICE_KEY = "<your-azure-search-service-key>"

VECTORIZER_RESOURCE_URL = "<your-openai-resource-url>"
VECTORIZER_API_KEY = "<your-openai-api-key>"
VECTORIZER_DEPLOYMENT_NAME = "text-embedding-ada-002"
VECTORIZER_MODEL_NAME = "text-embedding-ada-002"

INDEX_SCHEMA = SearchIndex(
    name="vinacarbon-search-index",
    fields=[
        SearchField(
            name="chunk_id",
            type=SearchFieldDataType.String,
            searchable=True,
            filterable=True,
            hidden=False,
            key=True,
            analyzer_name="keyword",
        ),
        SimpleField(
            name="document_id",
            type=SearchFieldDataType.String,
            filterable=True,
        ),
        SimpleField(
            name="url",
            type=SearchFieldDataType.String,
        ),
        SimpleField(name="content_type", type=SearchFieldDataType.String),
        SimpleField(name="created_at", type=SearchFieldDataType.DateTimeOffset),
        SimpleField(name="storage_size", type=SearchFieldDataType.Int64),
        SearchableField(
            name="title",
            type=SearchFieldDataType.String,
        ),
        SearchableField(
            name="chunk",
            type=SearchFieldDataType.String,
            analyzer_name="en.lucene",
        ),
        SearchField(
            name="embedding",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="vinacarbon-vector-search-profile",
        ),
    ],
    similarity=BM25SimilarityAlgorithm(),
    semantic_search=SemanticSearch(
        default_configuration_name="vinacarbon-semantic-configuration",
        configurations=[
            SemanticConfiguration(
                name="vinacarbon-semantic-configuration",
                ranking_order="BoostedRerankerScore",
                prioritized_fields=SemanticPrioritizedFields(
                    title_field=SemanticField(field_name="title"),
                    content_fields=[SemanticField(field_name="chunk")],
                ),
            )
        ],
    ),
    vector_search=VectorSearch(
        algorithms=[
            HnswAlgorithmConfiguration(
                name="vinacarbon-vector-search-algorithm",
                parameters=HnswParameters(
                    metric="cosine", m=4, ef_construction=400, ef_search=500
                ),
            )
        ],
        profiles=[
            VectorSearchProfile(
                name="vinacarbon-vector-search-profile",
                algorithm_configuration_name="vinacarbon-vector-search-algorithm",
                vectorizer_name="vinacarbon-vectorizer",
                compression_name="vinacarbon-vector-search-scalar-quantization",
            )
        ],
        vectorizers=[
            AzureOpenAIVectorizer(
                vectorizer_name="vinacarbon-vectorizer",
                parameters=AzureOpenAIVectorizerParameters(
                    resource_url=VECTORIZER_RESOURCE_URL,
                    deployment_name=VECTORIZER_DEPLOYMENT_NAME,
                    api_key=VECTORIZER_API_KEY,
                    model_name=VECTORIZER_MODEL_NAME,
                ),
            )
        ],
        compressions=[
            ScalarQuantizationCompression(
                compression_name="vinacarbon-vector-search-scalar-quantization",
                parameters=ScalarQuantizationParameters(
                    quantized_data_type=VectorSearchCompressionTarget.INT8
                ),
                rescoring_options=RescoringOptions(
                    enable_rescoring=True,
                    default_oversampling=4,
                    rescore_storage_method=VectorSearchCompressionRescoreStorageMethod.PRESERVE_ORIGINALS,
                ),
            )
        ],
    ),
)


DATA_SOURCE = SearchIndexerDataSourceConnection(
    name="vinacarbon-search-datasource",
    type="azureblob",
    connection_string=AZURE_BLOB_STORAGE_CONNECTION_STRING,
    container=SearchIndexerDataContainer(name="vinacarbon", query="documents"),
)

SKILLSET = SearchIndexerSkillset(
    name="vinacarbon-search-skillset",
    skills=[
        SplitSkill(
            inputs=[InputFieldMappingEntry(name="text", source="/document/content")],
            outputs=[OutputFieldMappingEntry(name="textItems", target_name="pages")],
            context="/document",
            text_split_mode=TextSplitMode.PAGES,
            maximum_page_length=2000,
            page_overlap_length=200,
            maximum_pages_to_take=0,
        ),
        AzureOpenAIEmbeddingSkill(
            inputs=[InputFieldMappingEntry(name="text", source="/document/pages/*")],
            outputs=[
                OutputFieldMappingEntry(name="embedding", target_name="embedding")
            ],
            context="/document/pages/*",
            resource_url=VECTORIZER_RESOURCE_URL,
            deployment_name=VECTORIZER_DEPLOYMENT_NAME,
            api_key=VECTORIZER_API_KEY,
            model_name=VECTORIZER_MODEL_NAME,
            dimensions=1536,
        ),
    ],
    index_projection=SearchIndexerIndexProjection(
        selectors=[
            SearchIndexerIndexProjectionSelector(
                target_index_name="vinacarbon-search-index",
                parent_key_field_name="document_id",
                source_context="/document/pages/*",
                mappings=[
                    InputFieldMappingEntry(name="chunk", source="/document/pages/*"),
                    InputFieldMappingEntry(
                        name="embedding", source="/document/pages/*/embedding"
                    ),
                    InputFieldMappingEntry(
                        name="title", source="/document/metadata_storage_name"
                    ),
                    InputFieldMappingEntry(
                        name="url", source="/document/metadata_storage_path"
                    ),
                    InputFieldMappingEntry(
                        name="content_type",
                        source="/document/metadata_storage_content_type",
                    ),
                    InputFieldMappingEntry(
                        name="created_at",
                        source="/document/metadata_creation_date",
                    ),
                    InputFieldMappingEntry(
                        name="storage_size", source="/document/metadata_storage_size"
                    ),
                ],
            )
        ],
        parameters=SearchIndexerIndexProjectionsParameters(
            projection_mode=IndexProjectionMode.SKIP_INDEXING_PARENT_DOCUMENTS
        ),
    ),
)

INDEXER = SearchIndexer(
    name="vinacarbon-search-indexer",
    data_source_name="vinacarbon-search-datasource",
    target_index_name="vinacarbon-search-index",
    skillset_name="vinacarbon-search-skillset",
)

credential = AzureKeyCredential(AZURE_SEARCH_SERVICE_KEY)

index_client = SearchIndexClient(AZURE_SEARCH_SERVICE_ENDPOINT, credential=credential)

indexer_client = SearchIndexerClient(
    AZURE_SEARCH_SERVICE_ENDPOINT, credential=credential
)

index_client.delete_index(INDEX_SCHEMA)
indexer_client.delete_indexer(INDEXER)
indexer_client.delete_skillset(SKILLSET)
indexer_client.delete_data_source_connection(DATA_SOURCE)

index_client.create_index(INDEX_SCHEMA)
indexer_client.create_data_source_connection(DATA_SOURCE)
indexer_client.create_skillset(SKILLSET)
indexer_client.create_indexer(INDEXER)

print("Completed")
