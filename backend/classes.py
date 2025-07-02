from pydantic import BaseModel, Field


# Document data structure
class Document(BaseModel):
    id: str
    content: str


# Chat request structure
class ChatRequest(BaseModel):
    question: str
    llm: str = Field(default="ChatGPT")     # By default, ChatGPT


# Paragraph auto-seg request structure
class ParagraphInput(BaseModel):
    text: str = Field(..., min_length=1, description="Non-empty paragraph to be divided.")


# N-res setting request structure
class NResInput(BaseModel):
    n: int


# Paragraph auto-seg request structure
class QuestionInput(BaseModel):
    question: str = Field(..., min_length=1, description="Question cannot be empty.")
