from typing import List

from pydantic import BaseModel


class ChatMessage(BaseModel):

    role: str

    content: str


class ChatRequest(BaseModel):

    user_id: int

    message: str

    history: List[ChatMessage] = []


class ChatResponse(BaseModel):

    user_id: int

    message: str

    model: str