import asyncio
import os
import json
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient

# Import utils
from utils import (
    calculate_course_stats,
    determine_context,
    call_ai
)
# Import data engine
from data_engine import get_student_data

# Configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/edu_platform")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    logger.warning("⚠️ GROQ_API_KEY non défini!")

# Database Connection
client = AsyncIOMotorClient(MONGO_URI)
db = client.edu_platform

app = FastAPI(title="EduPlatform IA Service", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentIaRequest(BaseModel):
    studentId: str
    collegeId: Optional[str] = None

# Helper function for parallel processing
async def analyze_single_course(course_data):
    try:
        course = course_data.get("course", {})
        grades = course_data.get("grades", [])
        items = course_data.get("items", [])
        documents = course_data.get("documents", [])
        reports = course_data.get("reports", [])

        # Calculer stats via utils
        stats = calculate_course_stats(grades, items)
        has_grades = stats["hasGrades"]

        # Préparer le résumé pour l'IA
        course_summary = {
            "title": course.get("title", "Cours"),
            "code": course.get("code", ""),
            "description": course.get("description", ""),
            "average": stats["average"],
            "completion": stats["completion"],
            "hasGrades": has_grades,
        }

        # Déterminer le contexte d'analyse (Async) via utils
        context_type, context_data = await determine_context(has_grades, reports, documents)
        
        # Appeler l'IA via utils
        analysis = await call_ai(json.dumps(course_summary), context_type, context_data)
        
        # Application des règles de classification de risque
        if has_grades and stats["average"] is not None:
            if stats["average"] < 60:
                analysis["risk"] = "élevé"
            elif stats["average"] < 75:
                analysis["risk"] = "moyen"
            else:
                analysis["risk"] = "faible"
        else:
            analysis["risk"] = None
        
        return {
            "course": course,
            "grades": grades,
            "items": items,
            "documents": documents,
            "reports": reports,
            "stats": stats,
            "analysis": analysis
        }
    except Exception as e:
        logger.error(f"Error analyzing course {course_data.get('course',{}).get('title')}: {e}")
        # Return partial data or empty analysis on failure to not break the whole request
        return {
            "course": course_data.get("course", {}),
            "stats": {"error": "Analysis failed"},
            "analysis": {"risk": "inconnu", "shortSummary": "Erreur d'analyse", "advice": "Réessayez plus tard.", "focusPoints": [], "quiz": []}
        }

# ===== ROUTES =====

@app.get("/")
async def root():
    return {
        "service": "IA Service",
        "version": "2.0",
        "status": "running"
    }


@app.get("/ia/health")
async def health():
    return {
        "ok": True,
        "service": "ia-service",
        "status": "running",
        "ai_configured": bool(GROQ_API_KEY),
        "db_connected": True
    }


@app.post("/ia/assist/student")
@app.post("/ia/analyze/student")
async def analyze_student(request: StudentIaRequest):
    """Analyse complète d'un étudiant (Direct DB Access) - PARALLEL EXECUTION"""
    try:
        # Récupérer les données via Data Engine (MongoDB Direct)
        data = await get_student_data(db, request.studentId, request.collegeId)
        courses_data = data.get("courses", [])

        if not courses_data:
            return {"success": True, "courses": []}

        # Parallel Execution
        tasks = [analyze_single_course(c) for c in courses_data]
        analyzed_courses = await asyncio.gather(*tasks)

        return {
            "success": True,
            "courses": analyzed_courses
        }

    except Exception as e:
        logger.error(f"Erreur analyse: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 4003))
    uvicorn.run(app, host="0.0.0.0", port=port)
