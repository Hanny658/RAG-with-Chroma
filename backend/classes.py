from pydantic import BaseModel, Field


# Data structure
class Document(BaseModel):
    id: str
    content: str


# Chat Request Structure
class ChatRequest(BaseModel):
    user_question: str
    llm: str = Field(default="ChatGPT")     # By default, ChatGPT


class ParagraphInput(BaseModel):
    text: str = Field(..., min_length=1, description="Non-empty paragraph to be divided")
