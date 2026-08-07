from pydantic import BaseModel, Field
from typing import List, Dict

class ChatHistoryMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")

class CopilotChatRequest(BaseModel):
    chatId: str = Field(..., description="Unique ID for this conversation thread")
    userId: str = Field(..., description="The user's unique ID")
    messageText: str = Field(..., description="Current user prompt text")
    history: List[ChatHistoryMessage] = Field(default_factory=list, description="Recent conversation history messages")
