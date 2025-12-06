import os
import json
import re
import logging
import asyncio
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import AsyncGroq
import httpx

# Import prompts
from prompts import (
    get_graded_prompt,
    get_reports_prompt,
    get_documents_prompt,
    get_both_prompt,
    get_none_prompt
)

# Configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ACADEMIC_SERVICE_URL = os.getenv("ACADEMIC_SERVICE_URL", "http://academic-service:4002")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    logger.warning("⚠️ GROQ_API_KEY non défini!")

client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

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


# ===== HELPER FUNCTIONS =====

def safe_parse_json(text: str) -> Dict[str, Any]:
    """Parse JSON même avec du texte autour"""
    try:
        return json.loads(text)
    except:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except:
                pass
    return {
        "risk": "inconnu",
        "shortSummary": "Analyse indisponible",
        "advice": "Service temporairement indisponible",
        "focusPoints": [],
        "quiz": []
    }


async def fetch_document_content(client: httpx.AsyncClient, doc_id: str, doc_name: str) -> str:
    """Fetch content for a single document asynchronously"""
    try:
        resp = await client.get(f"{ACADEMIC_SERVICE_URL}/documents/{doc_id}/content", timeout=10.0)
        if resp.status_code == 200:
            content = resp.json().get("content", "")
            return f"\n--- Document: {doc_name} ---\n{content[:2000]}"
    except Exception as e:
        logger.error(f"Error fetching doc {doc_id}: {e}")
    return ""


async def determine_context(has_grades: bool, reports: list, documents: list) -> tuple:
    """Determine analysis context based on available resources (Async)"""
    # Check for resources FIRST, regardless of grades
    has_reports = len(reports) > 0
    has_docs = len(documents) > 0
    
    docs_content = ""
    if has_docs:
        # Parallel fetch of document contents
        async with httpx.AsyncClient() as http_client:
            tasks = []
            # Fetch content for first 3 docs max
            for doc in documents[:3]:
                if "_id" in doc:
                    tasks.append(fetch_document_content(http_client, doc["_id"], doc.get("name", "")))
            
            if tasks:
                results = await asyncio.gather(*tasks)
                docs_content = "".join(results)
    
    if has_reports and has_docs:
        reports_text = " ".join([r.get("report", "") for r in reports[:3]])
        doc_names = [d.get("name", "") for d in documents[:5]]
        return "both", {"reports": reports_text[:1000], "documents": doc_names, "content": docs_content}
    elif has_reports:
        reports_text = " ".join([r.get("report", "") for r in reports[:3]])
        return "with_reports", {"reports": reports_text[:1000]}
    elif has_docs:
        doc_names = [d.get("name", "") for d in documents[:5]]
        return "with_documents", {"documents": doc_names, "content": docs_content}
    elif has_grades:
        return "graded", {}
    else:
        return "none", {}


async def call_ai(course_summary: str, context_type: str = "graded", context_data: dict = None) -> Dict[str, Any]:
    """Appel à l'IA Groq (Async)"""
    if not client:
        return {
            "risk": "inconnu",
            "shortSummary": "Service IA non configuré",
            "advice": "Contactez l'administrateur",
            "focusPoints": [],
            "quiz": []
        }

    if context_data is None:
        context_data = {}
    
    # Select prompt based on context
    if context_type == "graded":
        prompt = get_graded_prompt(course_summary)
    elif context_type == "with_reports":
        prompt = get_reports_prompt(course_summary, context_data.get("reports", ""))
    elif context_type == "with_documents":
        prompt = get_documents_prompt(
            course_summary, 
            context_data.get("documents", []), 
            context_data.get("content", "")
        )
    elif context_type == "both":
        prompt = get_both_prompt(
            course_summary,
            context_data.get("reports", ""),
            context_data.get("documents", []),
            context_data.get("content", "")
        )
    else:  # none
        prompt = get_none_prompt(course_summary)

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000,
        )
        response_text = completion.choices[0].message.content
        return safe_parse_json(response_text)
    except Exception as e:
        logger.error(f"Erreur IA: {e}")
        
        # Parse course_summary to get course info
        try:
            course_info = json.loads(course_summary)
            course_title = course_info.get("title", "ce cours")
        except:
            course_title = "ce cours"
        
        # Return context-appropriate fallback
        if context_type == "graded":
            return {
                "risk": None,
                "shortSummary": f"Continuez vos efforts en {course_title}",
                "advice": "Maintenez votre rythme de travail et concentrez-vous sur les concepts clés",
                "focusPoints": ["Réviser régulièrement", "Pratiquer les exercices", "Demander de l'aide si besoin"],
                "quiz": []
            }
        elif context_type == "with_reports":
            return {
                "risk": None,
                "shortSummary": "Conseils basés sur les attentes du professeur",
                "advice": "Lisez attentivement les commentaires de votre professeur pour comprendre ses attentes.",
                "focusPoints": ["Lire les rapports du prof", "Appliquer les conseils", "Poser des questions"],
                "quiz": []
            }
        elif context_type == "with_documents":
            return {
                "risk": None,
                "shortSummary": "Concentrez-vous sur les concepts clés des documents fournis",
                "advice": "Des documents ont été mis à disposition. Prenez le temps de les lire et d'en extraire les concepts clés.",
                "focusPoints": ["Lire tous les documents", "Prendre des notes", "Identifier les points importants"],
                "quiz": []
            }
        elif context_type == "both":
            return {
                "risk": None,
                "shortSummary": "En cours - Analyse complète disponible",
                "advice": "D'après les documents et les commentaires du prof, voici ce qui est important...",
                "focusPoints": ["Étudier les documents", "Suivre les rapports", "Pratiquer activement"],
                "quiz": []
            }
        else:  # none
            return {
                "risk": None,
                "shortSummary": "Aucun matériel disponible pour une analyse détaillée",
                "advice": f"Concentrez-vous sur la maîtrise des concepts fondamentaux de {course_title}.",
                "focusPoints": ["Approfondir les concepts clés", "Faire des exercices pratiques", "Consulter des ressources complémentaires"],
                "quiz": []
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

        # Process courses sequentially to avoid rate limits on Groq if necessary, 
        # or we could parallelize this too if rate limits allow. 
        # For now, let's keep course-level sequential but internal operations async.
        for course_data in courses_data:
            # Fix mapping: academic-service returns "course", not "courseId"
            course = course_data.get("course", {})
            grades = course_data.get("grades", [])
            items = course_data.get("items", [])
            documents = course_data.get("documents", [])
            reports = course_data.get("reports", [])

            # Calculer stats
            total_points = sum(item.get("maxPoints", 0) for item in items)
            
            # Identifier les items notés pour la moyenne courante
            graded_item_ids = set(g.get("itemId") for g in grades if g.get("itemId"))
            
            # Calculer les points gagnés SEULEMENT pour les items notés
            earned_points = 0
            total_evaluated_points = 0
            
            for item in items:
                item_id = item.get("_id")
                if item_id in graded_item_ids:
                    # Trouver la note correspondante
                    grade = next((g for g in grades if g.get("itemId") == item_id), None)
                    if grade:
                        earned_points += grade.get("score", 0)
                        total_evaluated_points += item.get("maxPoints", 0)

            if total_evaluated_points > 0:
                average = (earned_points / total_evaluated_points * 100)
                has_grades = True
            else:
                average = None  # None instead of 0 to indicate no grades
                has_grades = False
            
            completion = (len(grades) / len(items) * 100) if items else 0

            stats = {
                "average": round(average, 1) if average is not None else None,
                "completion": round(completion, 1),
                "totalPoints": total_points,
                "earnedPoints": earned_points,
                "hasGrades": has_grades
            }

            # Préparer le résumé pour l'IA
            course_summary = {
                "title": course.get("title", "Cours"),
                "code": course.get("code", ""),
                "description": course.get("description", ""),
                "average": stats["average"],
                "completion": stats["completion"],
                "hasGrades": has_grades,
            }

            # Déterminer le contexte d'analyse (Async)
            context_type, context_data = await determine_context(has_grades, reports, documents)
            
            # Appeler l'IA avec le contexte approprié (Async)
            analysis = await call_ai(json.dumps(course_summary), context_type, context_data)
            
            # Override risk level based on actual average (enforce rules)
            if has_grades and stats["average"] is not None:
                if stats["average"] < 60:
                    analysis["risk"] = "élevé"
                elif stats["average"] < 75:
                    analysis["risk"] = "moyen"
                else:
                    analysis["risk"] = "faible"
            else:
                # No risk classification for courses without grades
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
