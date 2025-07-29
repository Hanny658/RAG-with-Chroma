import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import chromadb
from openai import OpenAI
import uvicorn
# import defined custom classes
from classes import ChatRequest, Document, ParagraphInput, NResInput, QuestionInput
# import functions that is defined in functions.py
# from functions import FUNCTIONS


def load_config(file_path: str):
    """ Load CORS settings from the JSON file """
    with open(file_path, 'r') as file:
        return json.load(file)


# Path to the JSON file (adjust if needed)
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.json')
curr_config = load_config(CONFIG_PATH)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=curr_config.get("allow_origins", []),
    allow_credentials=curr_config.get("allow_credentials", False),
    allow_methods=curr_config.get("allow_methods", []),
    allow_headers=curr_config.get("allow_headers", []),
)

# Global Configs (or Magic numbers? Hum-mm...)
PORT_NUM = curr_config.get("PORT", 3053)     # Port number with default 3053 (Surely not in Carlton)
N_RES = curr_config.get("N_RES", 3)           # Number of the closest result should we attach when running RAG

# ========================================================
OPENAI_API_KEY = curr_config.get('OPENAI_API_KEY')
openAI_URL = curr_config.get('OPENAI_API_URL')
openAI_model = curr_config.get('OPENAI_MODEL')
DEEPSEEK_API_KEY = curr_config.get('DEEPSEEK_API_KEY')
deepseek_URL = curr_config.get('DEEPSEEK_API_URL')
deepseek_model = curr_config.get('DEEPSEEK_MODEL')

# Initialise Chroma db with persist setup
collection_name = curr_config.get("COLLECTION_NAME")
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(collection_name)

# LLM Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
deepseek_client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=deepseek_URL)


# ============================= Util functions =============================

def save_config(data):
    """ Save config.json as persistent """
    with open(CONFIG_PATH, 'w') as f:
        json.dump(data, f, indent=2)


def get_embedding(text):
    """ Get text Embedding from OpenAI """
    res = openai_client.embeddings.create(
        input=text,
        model='text-embedding-3-small'
    )
    return res.data[0].embedding


def is_valid_response(response_text: str) -> bool:
    """
    Check if the response is a JSON-formatted list of dicts with 'id' and 'content' keys.
    """
    try:
        parsed = json.loads(response_text)
        if isinstance(parsed, list):
            for item in parsed:
                if not isinstance(item, dict) or "id" not in item or "content" not in item:
                    print("Failed to get division, instead we got:")
                    print(response_text)
                    return False
            return True
        print("Failed to get division, instead we got:")
        print(response_text)
        return False
    except json.JSONDecodeError:
        print("Failed to get division, instead we got:")
        print(response_text)
        return False


def construct_context(question: str) -> str:
    """
    Construct the context based on the user's question with embedding
    """
    question_embedding = get_embedding(question)
    results = collection.query(query_embeddings=[question_embedding], n_results=N_RES)
    context_found = "\n".join(results['documents'][0])
    return context_found


def ask_openai(user_prompt: str) -> str:
    """
    Sends prompt to OpenAI Chat API and returns the response text.
    """
    response = openai_client.chat.completions.create(
        model=openAI_model,
        messages=[{"role": "user", "content": user_prompt}]
    )
    return response.choices[0].message.content


# =============================== APIs ===============================

# Receiving user question, construct context with RAG, then send it to LLM APIs
@app.post("/chat")
def chat_with_llm(request: ChatRequest):
    if request.llm == "":
        raise HTTPException(status_code=400, detail="Please pass the name (ChatGPT | Deepseek) in this field.")
    if request.llm not in ["ChatGPT", "Deepseek"]:
        raise HTTPException(status_code=400, detail="Currently only ChatGPT and Deepseek are supported for LLM.")

    context = construct_context(request.question)

    user_prompt = f"Context: {context}\n\nQuestion: {request.question}\n" \
                  f"Note: Please answer with No Markdown. Plain text only.\nAnswer:"

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
    
    # TODO: Adding function call handling logics and return that to your frontend.

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


# [Beta] Let ChatGPT to help to divide the long paragraph to multiple short-ones
@app.post("/chat/paragraph-divide")
async def paragraph_divide(request_data: ParagraphInput):
    base_prompt = (
        "Please help me to separate this paragraph with different segments based on smaller topics, "
        "with each segment around 2–5 sentences, and give them a short title. "
        "Please answer in a JSON formatted list: (plain text without wrapping in ```json ```) "
        "[{id: <the title>, content: <segment>}, {id: <the title>, content: <segment>}, ...].\n\n"
    )
    prompt = base_prompt + request_data.text

    max_retries = 3
    for attempt in range(max_retries):
        response_text = ask_openai(prompt)
        if is_valid_response(response_text):
            return {"result": json.loads(response_text)}
        elif attempt < max_retries - 1:
            prompt = (
                base_prompt +
                "\n\nYour last response wasn't in valid JSON format or wrapped in other texts like MarkDown notation. "
                "Please retry and return exactly what is asked:\n" +
                request_data.text
            )

    raise HTTPException(status_code=500, detail="Failed to get valid response from OpenAI after 3 attempts.")


# [Global Setting] Get or Set the current N for resource query to chroma
@app.post("/update-n")
def update_n(input_data: NResInput):
    num = input_data.n

    if not (0 <= num <= 5):
        raise HTTPException(
            status_code=400,
            detail="Invalid number, please provide a number between 0-5"
        )

    # Load global settings to change
    global curr_config
    global N_RES

    if num == 0:
        print(f"[CUTE-RAG] Showing N={N_RES}.")
        return {"n": N_RES}
    else:
        curr_config["N_RES"] = num
        save_config(curr_config)
        print(f"[CUTE-RAG] Updating N from {N_RES} to {num}.")
        N_RES = num
        return {"n": N_RES}


# Get the context only from inputted question (to be used in configuration)
@app.post("/test/get-context")
def get_context(question_input: QuestionInput):
    test_question = question_input.question
    constructed_context = f"Context got with current setting: \n{construct_context(test_question)}"
    return {"context": constructed_context}


# Start server | ``` To run, type < python .\main.py > in the commands ```
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT_NUM, reload=True)
