// routes/student.js
import express from "express";

const router = express.Router();

export default function studentRoutes({ ACADEMIC_SERVICE_URL }) {

  router.get("/stats", async (req, res) => {
    console.log("\n======= STUDENT /stats =======");

    try {
      const studentId = req.user?.userId;
      const token = req.headers.authorization;
      const collegeId = req.collegeId || req.headers["x-college-id"];

      console.log("👉 studentId:", studentId);
      console.log("👉 collegeId:", collegeId);

      if (!studentId)
        return res.status(401).json({ message: "Student ID required" });

      if (!collegeId)
        return res.status(400).json({ message: "x-college-id required" });

      // =============================================================
      // 1️⃣ ENROLLMENTS
      // =============================================================
      const enrollmentsResp = await fetch(
        `${ACADEMIC_SERVICE_URL}/academic/enrollments?collegeId=${collegeId}`,
        {
          headers: {
            Authorization: token,
            "x-college-id": collegeId,
          }
        }
      );

      const enrollments = await enrollmentsResp.json();
      const myEnrollments = enrollments.filter(e =>
        e.studentId?.toString() === studentId?.toString()
      );

      // Extract REAL course IDs
      const courseIds = myEnrollments.map(e => {
        if (typeof e.courseId === "object" && e.courseId !== null) {
          return e.courseId._id?.toString();
        }
        return e.courseId?.toString();
      }).filter(Boolean);

      console.log("📘 Real courseIds:", courseIds);


      // =============================================================
      // 2️⃣ COURSES
      // =============================================================
      const coursesResp = await fetch(
        `${ACADEMIC_SERVICE_URL}/academic/courses?collegeId=${collegeId}`,
        {
          headers: {
            Authorization: token,
            "x-college-id": collegeId,
          }
        }
      );

      const courses = await coursesResp.json();

      const myCourses = courses.filter(c =>
        courseIds.includes(c._id?.toString())
      );

      console.log("📘 myCourses length:", myCourses.length);


      // =============================================================
      // 3️⃣ DOCUMENTS PAR COURS
      // =============================================================
      let myDocuments = [];

      for (const courseId of courseIds) {
        const docsResp = await fetch(
          `${ACADEMIC_SERVICE_URL}/academic/documents/by-course/${courseId}`,
          {
            headers: {
              Authorization: token,
              "x-college-id": collegeId,
            }
          }
        );

        const docs = await docsResp.json().catch(() => []);

        myDocuments.push(...docs);
      }

      console.log("📄 Total documents:", myDocuments.length);


      // =============================================================
      // 4️⃣ PROFESSEURS
      // =============================================================
      const teachers = new Set(
        myCourses
          .map(c => c.teacherId?.toString())
          .filter(Boolean)
      );


      // =============================================================
      // 5️⃣ RESPONSE
      // =============================================================
      return res.json({
        stats: {
          courses: myCourses.length,
          teachers: teachers.size,
          documents: myDocuments.length
        }
      });

    } catch (err) {
      console.log("⛔ ERROR:", err);
      res.status(500).json({
        message: "Internal error in student stats",
        error: err.message
      });
    }
  });

  return router;
}
