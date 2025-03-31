import os
from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import chromadb
from openai import OpenAI
import uvicorn
# import defined custom classes
from classes import ChatRequest, Document


# Load CORS settings from the JSON file
def load_cors_config(file_path: str):
    with open(file_path, 'r') as file:
        return json.load(file)


# Path to the JSON file (adjust if needed)
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'cors_config.json')
cors_config = load_cors_config(CONFIG_PATH)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_config.get("allow_origins", []),
    allow_credentials=cors_config.get("allow_credentials", False),
    allow_methods=cors_config.get("allow_methods", []),
    allow_headers=cors_config.get("allow_headers", []),
)

# Global Configs (Magic numbers? Hum-mm...)
PORT_NUM = 3053     # Port number used for this app to listen (Surely not in Carlton)
N_RES = 3           # Number of the closest result should we attach when running RAG

# Load env from root directory (backend/ by default. edit below for customed dir)
project_root = Path(__file__).resolve().parent
dotenv_path = project_root / '.env'
load_dotenv(dotenv_path=dotenv_path)
# ========================================================
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openAI_URL = os.getenv('OPENAI_API_URL')
openAI_model = os.getenv('OPENAI_MODEL')
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
deepseek_URL = os.getenv('DEEPSEEK_API_URL')
deepseek_model = os.getenv('DEEPSEEK_MODEL')

# Initialise Chroma db with persist setup
collection_name = "do_chatbot"
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(collection_name)

# LLM Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
deepseek_client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=deepseek_URL)


# Get text Embedding from OpenAI
def get_embedding(text):
    res = openai_client.embeddings.create(
        input=text,
        model='text-embedding-3-small'
    )
    return res.data[0].embedding


# Receiving user question, construct context with RAG, then send it to LLM APIs
@app.post("/chat")
def chat_with_llm(request: ChatRequest):
    if request.llm == "":
        raise HTTPException(status_code=400, detail="Please pass the name (ChatGPT | Deepseek) in this field.")
    if request.llm not in ["ChatGPT", "Deepseek"]:
        raise HTTPException(status_code=400, detail="Currently, only ChatGPT and Deepseek are supported for LLM.")

    question_embedding = get_embedding(request.user_question)
    results = collection.query(query_embeddings=[question_embedding], n_results=N_RES)

    context = "\n".join(results['documents'][0])

    user_prompt = f"Context: {context}\n\nQuestion: {request.user_question}\nAnswer:"

    print(f"[CUTE-RAG] Dealing with constructed message: ${user_prompt}")

    if request.llm == "ChatGPT":
        completion = openai_client.chat.completions.create(
            model=openAI_model,
            messages=[{"role": "user", "content": user_prompt}]
        )
        answer = completion.choices[0].message.content
    elif request.llm == "Deepseek":
        completion = deepseek_client.chat.completions.create(
            model=deepseek_model,
            messages=[{"role": "user", "content": user_prompt}]
        )
        answer = completion.choices[0].message.content
    else:
        raise HTTPException(status_code=400, detail="Currently, only ChatGPT and Deepseek are supported for LLM.")

    return {"status": "success", "answer": answer}


# Adding new one or update with name given
@app.post("/doc/upsert")
def upsert_document(doc: Document):
    embedding = get_embedding(doc.content)
    collection.upsert(
        embeddings=[embedding],
        documents=[doc.content],
        ids=[doc.id]
    )
    print(f"[CUTE-RAG] Embedded Document: '${doc.id}'")
    return {"status": "success", "action": "upsert", "id": doc.id}


# Delete one doc
@app.delete("/doc/{doc_id}")
def delete_document(doc_id: str):
    existing = collection.get(ids=[doc_id])
    if not existing["ids"]:
        raise HTTPException(status_code=404, detail="Document not found")

    collection.delete(ids=[doc_id])
    print(f"[CUTE-RAG] Deleted Document: '${doc_id}'")
    return {"status": "success", "action": "delete", "id": doc_id}


# Get the doc content (Shall not be use in production)
@app.get("/doc/{doc_id}")
def get_document(doc_id: str):
    result = collection.get(ids=[doc_id])
    if not result["ids"]:
        raise HTTPException(status_code=404, detail="Document not found")

    print(f"[CUTE-RAG] Showing content of Document: '${doc_id}'.")
    return {
        "id": result["ids"][0],
        "content": result["documents"][0]
    }


# Lookup all document ids
@app.get("/docs/ids")
def get_all_document_ids():
    result = collection.get()
    print(f"[CUTE-RAG] Showing all Document Ids.")
    return {"ids": result["ids"]}


# Start server | ``` To run, type < python .\main.py > in the commands ```
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT_NUM, reload=True)
