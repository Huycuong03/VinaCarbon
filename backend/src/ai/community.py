import pickle

with open("src/ai/models/text-embedder.pkl", "rb") as file:
    text_embedder = pickle.load(file)

with open("src/ai/models/content-moderator.pkl", "rb") as file:
    content_moderator = pickle.load(file)


def moderate_content(content: str) -> bool:
    embeddings = text_embedder.transform([content])
    label = content_moderator.predict(embeddings)[0]
    passed = label == 0
    return passed
