import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    response: str


@app.get("/")
def home():
    return {"message": "Backend running"}


@app.get("/models")
def list_models():
    try:
        models = []
        for model_info in genai.list_models():
            models.append({"name": model_info.name, "display_name": getattr(model_info, 'display_name', model_info.name)})
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    user_prompt = request.prompt.strip()

    if not user_prompt:
        return {"response": "Please enter a prompt."}

    try:
        gemini_response = model.generate_content(user_prompt)
        text = gemini_response.text if gemini_response.text else "No response from Gemini."
        return {"response": text}
    except Exception as e:
        return {"response": f"Error calling Gemini: {str(e)}"}