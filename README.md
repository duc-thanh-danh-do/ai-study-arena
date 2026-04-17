# AI Study Arena

## Project Description

AI Study Arena is a simple AI-powered study tutor web application built for the capstone project. A student types a study question in the React frontend, the Python backend sends that question to Google's Gemini model with a tutoring-focused system prompt, and the app returns a short educational answer.

The current implementation is a Level 1 project: a single-turn AI application with one prompt in and one response out. The chat interface keeps messages visible in the browser, but the backend only processes the latest user message.

## Architecture Overview

Current architecture:

`React frontend -> FastAPI backend -> Gemini API`

Flow:

1. The user enters a study question in the frontend.
2. The frontend sends an HTTP `POST` request to the FastAPI backend.
3. The backend combines the user question with a study-tutor system prompt.
4. The backend sends the final prompt to Gemini.
5. Gemini returns a response.
6. The backend returns the text response to the frontend for display.

Main parts:

- `frontend/`: React + Vite user interface
- `backend/`: FastAPI server and Gemini integration
- `backend/.env`: local environment variables such as the Gemini API key

## Technical Choices

### Frontend

- `React` was used to build the user interface because it is fast to develop with and works well for small interactive applications.
- `Vite` was used as the frontend tooling because it provides a simple development setup and fast local builds.
- The frontend stores messages in local React state so the UI feels like a chat app, even though the backend is still single-turn.

### Backend

- `FastAPI` was used because it is lightweight, easy to set up, and a good fit for JSON-based API endpoints.
- `Pydantic` was used for request and response models to keep the API structure clear.
- `python-dotenv` was used to load environment variables from a local `.env` file.

### LLM Provider

- `Google Gemini` was used as the LLM provider.
- The backend uses the `google-generativeai` Python package.
- The current model is `gemini-2.5-flash`, chosen because it is simple to integrate and suitable for quick study-help responses.

### Why this design

This design was chosen because it is the simplest complete full-stack AI application that satisfies the course requirements:

- React frontend
- Python backend
- LLM API integration
- Working frontend-backend communication
- Local runnable project structure

## Setup and Running Instructions

### Requirements

- Python 3.11 or newer recommended
- Node.js 18 or newer recommended
- A Gemini API key

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ai-study-arena
```

### 2. Set up the backend

Open a terminal in the `backend` folder:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the backend server:

```bash
uvicorn main:app --reload
```

The backend should run on:

```text
http://127.0.0.1:8000
```

### 3. Set up the frontend

Open a second terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend should run on the local Vite development URL shown in the terminal, usually:

```text
http://127.0.0.1:5173
```

### 4. Use the application

1. Start the backend.
2. Start the frontend.
3. Open the frontend URL in a browser.
4. Type a study-related question.
5. The app will return a simple tutor-style answer from Gemini.

## Known Limitations

- This is currently a Level 1 application only.
- The backend is single-turn: it only processes the newest prompt and does not use real conversation memory.
- The frontend shows chat history in the UI, but previous messages are not sent back to the model.
- The frontend currently uses a hardcoded backend URL (`http://127.0.0.1:8000/chat`), which is fine for local development but not ideal for deployment.
- There is no authentication, user account system, or database.
- There is no rate limiting or protection against abuse.
- Error handling is basic and mainly returns plain text messages.
- The app depends on an external API key and internet access to call Gemini.
- The current prompt design is simple and may not give equally good answers for all subjects.
- The UI is functional but still basic and would need more polish for public release.
- The repository currently includes only minimal project documentation beyond this README.

### What would need to change for public deployment

- Move secrets to proper deployment environment variables
- Replace the hardcoded backend URL with environment-based configuration
- Add structured logging and better error handling
- Add authentication and user/session management
- Add storage for chat history if multi-turn support is needed
- Add monitoring, rate limiting, and security controls
- Improve testing and deployment automation

## AI Tools Used

AI assistants were used as development support tools during this project.

- `OpenAI Codex / ChatGPT`: used for codebase review, debugging help, explaining architecture, and improving documentation
- Other AI coding assistants may also be used for boilerplate generation, UI ideas, or small bug fixes depending on team workflow

All code and design decisions were still reviewed and understood by the project author(s).

## Current Complexity Assessment

This project currently matches `Level 1` in the course rubric:

- single-turn prompt-response flow
- one LLM call per request
- no real memory
- no retrieval
- no tool use
- no multi-step orchestration

