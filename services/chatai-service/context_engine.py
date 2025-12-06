import logging
from bson import ObjectId

# Configuration
logger = logging.getLogger(__name__)

async def get_student_context(db, student_id: str) -> str:
    """Fetches student courses and grades to build context."""
    try:
        # Correctly parsing ObjectId
        try:
            sid = ObjectId(student_id)
        except:
            return "Student ID invalid."

        # Fetch Student
        student = await db.users.find_one({"_id": sid, "role": "student"})
        if not student:
            return "Unknown student."

        student_name = f"{student.get('firstName', '')} {student.get('lastName', '')}"

        # 1. Fetch Active Sessions
        active_sessions_cursor = db.sessions.find({"state": "ACTIVE"})
        active_sessions = await active_sessions_cursor.to_list(length=20)
        active_session_ids = [s["_id"] for s in active_sessions]

        # 2. Fetch Enrollments
        enrollments_cursor = db.enrollments.find({"studentId": sid})
        enrollments = await enrollments_cursor.to_list(length=100)
        
        all_enrolled_course_ids = [e["courseId"] for e in enrollments if "courseId" in e]
        
        # 3. Filter Valid Courses (Active Session Only)
        courses_cursor = db.courses.find({
            "_id": {"$in": all_enrolled_course_ids},
            "sessionId": {"$in": active_session_ids}
        })
        courses = await courses_cursor.to_list(length=len(all_enrolled_course_ids))
        
        # Updated list of valid course IDs
        course_ids = [c["_id"] for c in courses]
        
        # 2. Fetch Grades (for performance context)
        grades_cursor = db.grades.find({"studentId": sid})
        grades = await grades_cursor.to_list(length=200)

        # 3. Build Context
        courses_context = []
        
        if courses:
            # We already have 'courses' list from step 1
            pass
            
            # Fetch Teachers
            teacher_ids = [c["teacherId"] for c in courses if "teacherId" in c and c["teacherId"]]
            teachers_map = {}
            if teacher_ids:
                teachers_cursor = db.users.find({"_id": {"$in": teacher_ids}})
                teachers = await teachers_cursor.to_list(length=len(teacher_ids))
                for t in teachers:
                    teachers_map[t["_id"]] = f"{t.get('firstName', '')} {t.get('lastName', '')}"

        # 4. Fetch GradeItems & Categories & Sessions
        # Batched fetching for performance
        
        # Items
        grade_items_cursor = db.gradeitems.find({"courseId": {"$in": course_ids}} if course_ids else {})
        grade_items = await grade_items_cursor.to_list(length=1000)
        items_map = {i["_id"]: i for i in grade_items} # ID -> Item
        
        # Categories
        categories_cursor = db.gradecategories.find({"courseId": {"$in": course_ids}} if course_ids else {})
        categories = await categories_cursor.to_list(length=200)
        categories_map = {} # courseId -> list of categories
        for cat in categories:
            cid = cat["courseId"]
            if cid not in categories_map:
                categories_map[cid] = []
            categories_map[cid].append(cat)
            
        # Sessions
        session_ids = [c["sessionId"] for c in courses if "sessionId" in c]
        sessions_cursor = db.sessions.find({"_id": {"$in": session_ids}} if session_ids else {})
        sessions = await sessions_cursor.to_list(length=50)
        sessions_map = {s["_id"]: s for s in sessions}

        # 5. Fetch Student Reports
        reports_cursor = db.studentreports.find({"studentId": sid})
        reports = await reports_cursor.to_list(length=50)
        reports_context = []
        for r in reports:
            # Match report to course title if possible
            r_course = next((c for c in courses if c["_id"] == r.get("courseId")), None)
            course_title = r_course.get("title", "Unknown Course") if r_course else "General"
            reports_context.append(f"- [{course_title}]: {r.get('report', '')}")

        # 6. Fetch Course Documents
        documents_cursor = db.documents.find({"courseId": {"$in": course_ids}} if course_ids else {})
        documents = await documents_cursor.to_list(length=100)
        docs_map = {}
        for d in documents:
            c_id = d.get("courseId")
            if c_id not in docs_map:
                docs_map[c_id] = []
            docs_map[c_id].append(d.get("name", "Untitled Doc"))

        # Re-build rich context
        rich_courses_context = []
        for course in courses:
            c_name = course.get("title", "Unnamed Course")
            c_id = course["_id"]
            
            # Session Info
            c_session_id = course.get("sessionId")
            session = sessions_map.get(c_session_id)
            session_str = f"{session.get('name', 'Unknown Session')}" if session else ""
            
            # Teacher
            c_teacher_id = course.get("teacherId")
            c_teacher_name = teachers_map.get(c_teacher_id, "Unknown Instructor")
            
            # Correct Weighted Grade Calculation (Overall)
            earned_points = 0
            total_possible_points = 0
            
            # Get grades for this course
            c_grades = [g for g in grades if g.get("courseId") == c_id]
            
            # Category Breakdown Calculation
            c_categories = categories_map.get(c_id, [])
            cat_strings = []
            
            for cat in c_categories:
                # Find items for this category
                cat_items = [i for i in grade_items if i.get("categoryId") == cat["_id"]]
                cat_item_ids = [i["_id"] for i in cat_items]
                
                # Find grades for these items
                cat_grades = [g for g in c_grades if g.get("itemId") in cat_item_ids]
                
                cat_earned = sum([g.get("score", 0) for g in cat_grades])
                cat_possible = sum([items_map.get(g.get("itemId"), {}).get("maxPoints", 100) for g in cat_grades])
                
                if cat_possible > 0:
                    cat_avg = (cat_earned / cat_possible) * 100
                    cat_strings.append(f"{cat['name']} ({cat['weight']}%): {cat_avg:.1f}%")
                else:
                    cat_strings.append(f"{cat['name']} ({cat['weight']}%): No grades")

            # Overall Calc
            for g in c_grades:
                g_item_id = g.get("itemId")
                item = items_map.get(g_item_id)
                possible = item["maxPoints"] if item and "maxPoints" in item else g.get("maxPoints", 100)
                score = g.get("score", 0)
                earned_points += score
                total_possible_points += possible
                
            if total_possible_points > 0:
                final_avg = (earned_points / total_possible_points) * 100
                avg_str = f"{final_avg:.1f}%"
            else:
                avg_str = "No grades yet"
            
            # Documents
            c_docs = docs_map.get(c_id, [])
            docs_str = ", ".join(c_docs) if c_docs else "No documents"
            
            course_details = f"Course: {c_name} ({session_str})\n"
            course_details += f"  - Professor: {c_teacher_name}\n"
            course_details += f"  - Overall Average: {avg_str}\n"
            if cat_strings:
                course_details += f"  - Breakdown: {', '.join(cat_strings)}\n"
            course_details += f"  - Materials: {docs_str}"

            rich_courses_context.append(course_details)
        
        if not rich_courses_context:
            rich_courses_context.append("No active courses found.")
            
        # 7. Fetch Program Info
        program_name = "Unknown Program"
        if courses and "programId" in courses[0]:
            p_id = courses[0]["programId"]
            program = await db.programs.find_one({"_id": p_id})
            if program:
                program_name = program.get("name", "Unknown Program")

        context_str = f"""Student: {student_name}
Program: {program_name}
Total Active Courses: {len(courses)}
        
=== ENROLLED COURSES & MATERIALS ===
{chr(10).join(rich_courses_context)}

=== TEACHER REPORTS ===
{chr(10).join(reports_context) if reports_context else "No teacher reports available."}
"""
        return context_str

    except Exception as e:
        logger.error(f"Error fetching context: {e}")
        return "Error fetching student context."
