import json
import re
import logging
import asyncio
import httpx
import os
from typing import Dict, Any, List, Optional
from groq import AsyncGroq

# Import prompts from local module
from prompts import (
    get_graded_prompt,
    get_reports_prompt,
    get_documents_prompt,
    get_both_prompt,
    get_none_prompt
)

logger = logging.getLogger(__name__)

ACADEMIC_SERVICE_URL = os.getenv("ACADEMIC_SERVICE_URL", "http://academic-service:4002")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def safe_parse_json(text: str) -> Dict[str, Any]:
    """Parse JSON even with surrounding text"""
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
    has_reports = len(reports) > 0
    has_docs = len(documents) > 0
    
    docs_content = ""
    if has_docs:
        async with httpx.AsyncClient() as http_client:
            tasks = []
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
    """Call Groq AI logic"""
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
    
    # Select prompt
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

    # Retry logic
    max_retries = 3
    for attempt in range(max_retries):
        try:
            completion = await client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000,
            )
            response_text = completion.choices[0].message.content
            parsed = safe_parse_json(response_text)
            return parsed
        except Exception as e:
            if "429" in str(e):
                logger.warning(f"Rate limit hit (attempt {attempt+1}/{max_retries}). Retrying...")
                await asyncio.sleep(2 ** (attempt + 1))
            else:
                logger.error(f"IA Error (attempt {attempt+1}): {e}")
                if attempt == max_retries - 1:
                    break
    
    # Fallback response
    try:
        course_info = json.loads(course_summary)
        course_title = course_info.get("title", "ce cours")
    except:
        course_title = "ce cours"
    
    if context_type == "graded":
        return {
            "risk": None,
            "shortSummary": f"Continuez vos efforts en {course_title}",
            "advice": "Maintenez votre rythme.",
            "focusPoints": ["Réviser"],
            "quiz": []
        }
    # ... simplified fallback for clarity, the main point is structure
    return {
        "risk": None,
        "shortSummary": "Information indisponible",
        "advice": "Veuillez réessayer plus tard.",
        "focusPoints": [],
        "quiz": []
    }

def calculate_course_stats(grades: List[Dict], items: List[Dict]) -> Dict[str, Any]:
    """Calculate course average and stats"""
    total_points = sum(item.get("maxPoints", 0) for item in items)
    graded_item_ids = set(g.get("itemId") for g in grades if g.get("itemId"))
    
    earned_points = 0
    total_evaluated_points = 0
    
    for item in items:
        item_id = item.get("_id")
        if item_id in graded_item_ids:
            grade = next((g for g in grades if g.get("itemId") == item_id), None)
            if grade:
                earned_points += grade.get("score", 0)
                total_evaluated_points += item.get("maxPoints", 0)

    average = None
    has_grades = False
    
    if total_evaluated_points > 0:
        average = (earned_points / total_evaluated_points * 100)
        has_grades = True
    
    completion = (len(grades) / len(items) * 100) if items else 0

    return {
        "average": round(average, 1) if average is not None else None,
        "completion": round(completion, 1),
        "totalPoints": total_points,
        "earnedPoints": earned_points,
        "hasGrades": has_grades
    }
