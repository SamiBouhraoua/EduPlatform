import os
import json
import logging
import httpx
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import utils
from utils import (
    calculate_course_stats,
    determine_context,
    call_ai
)

# Configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ACADEMIC_SERVICE_URL = os.getenv("ACADEMIC_SERVICE_URL", "http://academic-service:4002")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    logger.warning("⚠️ GROQ_API_KEY non défini!")

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
        "ai_configured": bool(GROQ_API_KEY)
    }


@app.post("/ia/assist/student")
@app.post("/ia/analyze/student")
async def analyze_student(request: StudentIaRequest):
    """Analyse complète d'un étudiant"""
    try:
        # Récupérer les cours
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(
                f"{ACADEMIC_SERVICE_URL}/academic/ia/student/{request.studentId}/active-courses",
                headers={"x-college-id": request.collegeId or ""},
                timeout=10.0
            )
            
            if response.status_code != 200:
                logger.error(f"Erreur Academic Service: {response.status_code}")
                return {"success": True, "courses": []}
            
            data = response.json()
            courses_data = data.get("courses", [])

        if not courses_data:
            return {"success": True, "courses": []}

        # Analyser chaque cours
        analyzed_courses = []

        for course_data in courses_data:
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
            
            analyzed_courses.append({
                "course": course,
                "grades": grades,
                "items": items,
                "documents": documents,
                "reports": reports,
                "stats": stats,
                "analysis": analysis
            })

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
