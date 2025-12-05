from azure.search.documents._paging import SearchItemPaged


def aggregate_search_hits(hits: SearchItemPaged) -> list[dict]:
    docs = {}
    for hit in hits:
        id = hit["snippet_parent_id"]
        doc = {
            "id": hit["snippet_parent_id"],
            "score": hit["@search.score"],
            "text": hit["snippet"],
            "url": hit["blob_url"],
        }

        if (id not in docs) or (id in docs and doc["score"] < docs[id]["score"]):
            docs[id] = doc

    docs = [d for d in docs.values()]

    return docs
