import os
from typing import Literal

from fastapi import FastAPI, HTTPException
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
MAX_HISTORY_MESSAGES = 12
SYSTEM_PROMPT = """
You are a helpful AI study tutor for university students.
Your job is to explain concepts clearly, simply, and accurately.
Keep answers concise but useful.
Use the conversation history to maintain continuity between turns.
If the student asks a follow-up question like "why?", "explain that again", or
"give me an example", use the earlier context instead of starting over.
When possible:
- explain step by step
- give a simple example
- avoid unnecessary jargon
- be supportive and educational
"""
MODE_PROMPTS = {
    "explain": """
Mode: Explain
- Focus on teaching the concept clearly.
- Use short step-by-step explanations when helpful.
- Give a simple example if it would improve understanding.
""".strip(),
    "quiz": """
Mode: Quiz
- Act like a study coach giving one short quiz question at a time.
- If the student answers, briefly say whether the answer is correct or partly correct.
- Give a short correction or explanation when needed.
- After feedback, ask one next quiz question to continue the practice.
- Keep the quiz concise and supportive.
""".strip(),
}


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    mode: Literal["explain", "quiz"] = "explain"


class ChatResponse(BaseModel):
    response: str


def build_conversation_prompt(
    messages: list[ChatMessage],
    mode: Literal["explain", "quiz"],
) -> str:
    trimmed_messages = []

    for message in messages[-MAX_HISTORY_MESSAGES:]:
        content = message.content.strip()

        if content:
            trimmed_messages.append(ChatMessage(role=message.role, content=content))

    if not trimmed_messages:
        raise HTTPException(status_code=400, detail="Please enter a prompt.")

    if trimmed_messages[-1].role != "user":
        raise HTTPException(
            status_code=400,
            detail="The latest message must come from the user.",
        )

    conversation_lines = []
    for message in trimmed_messages[:-1]:
        speaker = "Student" if message.role == "user" else "Tutor"
        conversation_lines.append(f"{speaker}: {message.content}")

    latest_question = trimmed_messages[-1].content
    previous_context = (
        "\n\n".join(conversation_lines)
        if conversation_lines
        else "No prior conversation yet."
    )
    mode_prompt = MODE_PROMPTS[mode]

    return f"""
{SYSTEM_PROMPT}

{mode_prompt}

Previous conversation:
{previous_context}

Latest student question:
Student: {latest_question}

Tutor response:
""".strip()


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
    final_prompt = build_conversation_prompt(request.messages, request.mode)

    try:
        gemini_response = model.generate_content(final_prompt)
        text = gemini_response.text if gemini_response.text else None

        if not text:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response.",
            )

        return {"response": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Error calling Gemini: {str(e)}",
        ) from e
