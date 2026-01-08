import pickle
from typing import Any

from src.settings import SETTINGS

with open("model/text-embedder.pkl", "rb") as f:
    text_embedder = pickle.load(f)

with open("model/content-moderator.pkl", "rb") as f:
    content_moderator = pickle.load(f)


def clean_document(document: dict[str, Any]) -> dict[str, Any]:
    document = {k: v for k, v in document.items() if not k.startswith("_")}
    return document


def moderate_content(content: str) -> bool:
    embeddings = text_embedder.transform([content])
    label = content_moderator.predict(embeddings)[0]
    passed = label == 0
    return passed


def construct_query(query_params: dict | None) -> tuple[str, list[dict[str, Any]]]:
    query = "SELECT * FROM c {where} ORDER BY {order_by} {order_dir}"
    order_by = SETTINGS.default_order_by
    order_dir = SETTINGS.default_order_dir
    where = ""
    params = []

    if query_params is None or len(query_params) == 0:
        query = query.format(order_by=order_by, order_dir=order_dir, where=where)
        return query, params

    if "order_by" in query_params:
        field = query_params["order_by"]
        order_by = f"c.{field}"

    if "order_dir" in query_params:
        order_dir = query_params["order_dir"]

    filters = []
    if "filters" in query_params:
        for i, filter in enumerate(query_params["filters"]):
            field = filter["field"]
            operation = filter["operation"]
            value = filter["value"]

            filters.append(f"c.{field} {operation} @value{i}")
            params.append({"name": f"@value{i}", "value": value})

    if len(filters) > 0:
        where = "WHERE " + " AND ".join(filters)

    query = query.format(order_by=order_by, order_dir=order_dir, where=where)
    return query, params
