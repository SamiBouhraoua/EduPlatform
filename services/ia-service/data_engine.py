import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

async def get_student_data(db, student_id: str, college_id: str = None) -> dict:
    """
    Fetches data for student analysis, REPLICATING iaStudentController.js logic:
    1. Filter by Active Session.
    2. Filter out Completed Courses (>99% evaluated).
    """
    try:
        try:
            sid = ObjectId(student_id)
        except:
            logger.error(f"Invalid student ID: {student_id}")
            return {"courses": []}

        # 1. Fetch Active Sessions
        session_query = {"state": "ACTIVE"}
        if college_id:
            try:
                session_query["collegeId"] = ObjectId(college_id)
            except:
                pass
        
        active_sessions = await db.sessions.find(session_query).to_list(length=100)
        active_session_ids = [s["_id"] for s in active_sessions]

        if not active_session_ids:
            return {"courses": []}

        # 2. Fetch Active Courses (in those sessions)
        courses_cursor = db.courses.find({"sessionId": {"$in": active_session_ids}})
        active_courses = await courses_cursor.to_list(length=500)
        active_course_ids = [c["_id"] for c in active_courses]
        courses_map = {c["_id"]: c for c in active_courses}
        
        if not active_course_ids:
            return {"courses": []}

        # 3. Fetch Enrollments (for this student, in these courses)
        enrollments_cursor = db.enrollments.find({
            "studentId": sid,
            "courseId": {"$in": active_course_ids}
        })
        enrollments = await enrollments_cursor.to_list(length=100)
        
        # 4. Fetch Grades, Items, Docs, Reports, CATEGORIES for these courses
        active_enrolled_course_ids = [e["courseId"] for e in enrollments]

        grades_cursor = db.grades.find({"studentId": sid, "courseId": {"$in": active_enrolled_course_ids}})
        all_grades = await grades_cursor.to_list(length=500)

        items_cursor = db.gradeitems.find({"courseId": {"$in": active_enrolled_course_ids}})
        all_items = await items_cursor.to_list(length=1000)

        categories_cursor = db.gradecategories.find({"courseId": {"$in": active_enrolled_course_ids}})
        all_categories = await categories_cursor.to_list(length=200)
        # Map for quick existence check
        # categoryId in items is an ObjectId.
        all_category_ids = set(c["_id"] for c in all_categories)

        docs_cursor = db.documents.find({"courseId": {"$in": active_enrolled_course_ids}})
        all_docs = await docs_cursor.to_list(length=200)

        reports_cursor = db.studentreports.find({"studentId": sid, "courseId": {"$in": active_enrolled_course_ids}})
        all_reports = await reports_cursor.to_list(length=100)

        # 5. Filter & Assemble
        result_courses = []

        for enrollment in enrollments:
            c_id = enrollment.get("courseId")
            if c_id not in courses_map:
                continue
            
            course_obj = courses_map[c_id]
            
            # Filter related data
            c_grades = [g for g in all_grades if g.get("courseId") == c_id]
            c_items_raw = [i for i in all_items if i.get("courseId") == c_id]
            c_categories = [c for c in all_categories if c.get("courseId") == c_id]
            
            # --- CHECK COMPLETION LOGIC (Replicating computeFinalGrade) ---
            # 1. Items with valid maxPoints AND Valid Category (Strict Parity)
            valid_items = []
            for item in c_items_raw:
                has_max = item.get("maxPoints", 0) > 0
                cat_id = item.get("categoryId")
                has_cat = cat_id in all_category_ids
                
                if has_max and has_cat:
                    valid_items.append(item)
            
            if not valid_items:
                # No items = Not started. Include it.
                pass
            else:
                total_course_points = sum(i["maxPoints"] for i in valid_items)
                
                # Check evaluated points
                total_evaluated_points = 0
                for item in valid_items:
                    # Find grade for item
                    has_grade = any(g for g in c_grades if g.get("itemId") == item["_id"])
                    if has_grade:
                        total_evaluated_points += item["maxPoints"]
                
                if total_course_points > 0:
                    completion_ratio = total_evaluated_points / total_course_points
                    # If > 99% complete, SKIP this course
                    if completion_ratio >= 0.99:
                        continue 
            
            # -------------------------------------------------------------

            c_docs = [d for d in all_docs if d.get("courseId") == c_id]
            c_reports = [r for r in all_reports if r.get("courseId") == c_id]

            result_courses.append({
                "course": _serialize_doc(course_obj),
                "grades": [_serialize_doc(g) for g in c_grades],
                "items": [_serialize_doc(i) for i in valid_items], # Only return valid items
                "categories": [_serialize_doc(c) for c in c_categories],
                "documents": [_serialize_doc(d) for d in c_docs],
                "reports": [_serialize_doc(r) for r in c_reports]
            })

        return {"courses": result_courses}

    except Exception as e:
        logger.error(f"Error in get_student_data: {e}")
        return {"courses": []}

def _serialize_doc(doc):
    """Helper to convert ObjectId to string for consistency"""
    if not doc:
        return {}
    new_doc = doc.copy()
    if "_id" in new_doc:
        new_doc["_id"] = str(new_doc["_id"])
    for k, v in new_doc.items():
        if isinstance(v, ObjectId):
            new_doc[k] = str(v)
    return new_doc
