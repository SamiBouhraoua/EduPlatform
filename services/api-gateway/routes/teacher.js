import express from "express";

const router = express.Router();

export default function teacherRoutes({ ACADEMIC_SERVICE_URL }) {

  router.get("/stats", async (req, res) => {
    try {
      const teacherId = req.user?.userId || req.user?._id;
      const token = req.headers.authorization;
      const collegeId = req.headers["x-college-id"];

      if (!teacherId) {
        return res.status(401).json({ message: "Teacher ID required" });
      }

      // Load all courses
      const courses = await fetch(
        `${ACADEMIC_SERVICE_URL}/academic/courses?collegeId=${collegeId}`,
        { headers: { Authorization: token } }
      ).then(r => r.json());

      const myCourses = courses.filter(c =>
        c.teacherId?.toString() === teacherId?.toString()
      );

      const courseIds = myCourses.map(c => c._id?.toString());

      // Load enrollments per course
      let myStudents = [];

      for (const courseId of courseIds) {
        const studentsForCourse = await fetch(
          `${ACADEMIC_SERVICE_URL}/academic/enrollments/by-course/${courseId}`,
          {
            headers: {
              Authorization: token,
              "x-college-id": collegeId,
            }
          }
        ).then(r => r.json());

        myStudents.push(...studentsForCourse);
      }

      // Load documents per course
      let myDocs = [];

      for (const courseId of courseIds) {
        const docsForCourse = await fetch(
          `${ACADEMIC_SERVICE_URL}/academic/documents/by-course/${courseId}`,
          {
            headers: {
              Authorization: token,
              "x-college-id": collegeId,
            }
          }
        ).then(r => r.json());

        myDocs.push(...docsForCourse);
      }

      // Final response
      return res.json({
        stats: {
          courses: myCourses.length,
          students: myStudents.length,
          documents: myDocs.length,
        }
      });

    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
}
