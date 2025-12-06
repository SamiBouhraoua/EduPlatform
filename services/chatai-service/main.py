import os
import logging
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from groq import AsyncGroq
from bson import ObjectId
from context_engine import get_student_context

# Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/edu_platform")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI(title="EduPlatform ChatAI Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clients
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client.edu_platform

groq_client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    studentId: str
    message: str
    history: Optional[List[ChatMessage]] = []

# Routes
@app.get("/health")
async def health():
    return {"status": "ok", "service": "chatai-service"}

@app.post("/chat/message")
async def chat_message(request: ChatRequest):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI Service not configured")

    try:
        # 1. Build Context
        context = await get_student_context(db, request.studentId)
        logger.info(f"Generated Context for {request.studentId}:\n{context}") # Debug log

        # 2. System Prompt
        system_prompt = f"""You are an advanced AI educational tutor.
        
        Context Data:
        {context}
        
        Instructions:
        - Help the student succeed using ONLY the provided context.
        - BE CONCISE. Answer ONLY what is asked. 
        - DO NOT list all courses unless explicitly asked.
        - If asked "What is my program?", just state the Program Name from the context.
        
        - If the student asks about "reports" or "feedback":
          - CHECK the "TEACHER REPORTS" section above.
          - If it says "No teacher reports available", YOU MUST SAY there are no reports. DO NOT INVENT ONE.
          
        - Do not halluciation data that is not in the context.
        """

        # 3. Construct Messages
        messages = [{"role": "system", "content": system_prompt}]
        # Add history (limit to last 5 for context window)
        for msg in request.history[-5:]:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add current message
        messages.append({"role": "user", "content": request.message})

        # 4. Call Groq
        completion = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant", # Use fast model
            messages=messages,
            temperature=0.3, # Lower temperature to reduce hallucinations
            max_tokens=800
        )

        response = completion.choices[0].message.content
        return {"response": response, "context_used": True}

    except Exception as e:
        logger.error(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
