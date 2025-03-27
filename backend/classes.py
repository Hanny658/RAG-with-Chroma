from pydantic import BaseModel, Field


# Data structure
class Document(BaseModel):
    id: str
    content: str


# Chat Request Structure
class ChatRequest(BaseModel):
    user_question: str
    llm: str = Field(default="ChatGPT")     # By default, ChatGPT
