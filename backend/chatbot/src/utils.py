THREADS: dict[str, dict[str, str]] = {}


def get_thread_id(channel_id: str | None, conversation_id: str) -> str | None:
    if channel_id is None:
        channel_id = "unknown"
    if channel_id not in THREADS:
        return None
    thread_id = THREADS[channel_id].get(conversation_id, None)
    return thread_id


def set_thread_id(channel_id: str | None, conversation_id: str, thread_id: str):
    if channel_id is None:
        channel_id = "unknown"
    if channel_id not in THREADS:
        THREADS[channel_id] = {}
    THREADS[channel_id][conversation_id] = thread_id
