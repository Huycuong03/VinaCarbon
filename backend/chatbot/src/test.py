from azure.ai.agents.models import MessageInputTextBlock

msg = MessageInputTextBlock({"value": "Hello"})

print(msg.as_dict())
