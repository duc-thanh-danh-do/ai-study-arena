from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    user_prompt = request.prompt.strip()

    if not user_prompt:
        return {"response": "Please enter a prompt."}

    return {
        "response": f"You said: {user_prompt}"
    }