# search (ai search + blob storage)
## upload documents
files = admin.upload(files)
for file in files:
    chunks = split(file)
    for chunk in chunks:
        embedding = embed(chunk)
        chunk["vector"] = embedding
        search_client.add_to_index(chunk)

## search document
## qna chatbot

# social (cosmos db)
## post (with filter)
## newsfeed (public)
## search (public)
## interact (like, report, comment)
## follow

# notification

file -> frontend -> search service -> blob storage (data source) -> indexer -> index