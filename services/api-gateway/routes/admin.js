import express from "express";

const router = express.Router();

export default function adminRoutes({
  AUTH_SERVICE_URL,
  ACADEMIC_SERVICE_URL
}) {

  router.get("/stats", async (req, res) => {
    try {
      const token = req.headers.authorization;
      const collegeId = req.headers["x-college-id"];

      if (!collegeId) {
        return res.status(400).json({ message: "x-college-id required" });
      }

      // USERS
      const users = await fetch(
        `${AUTH_SERVICE_URL}/users?collegeId=${collegeId}`,
        { headers: { Authorization: token } }
      ).then(r => r.json());

      // PROGRAMS
      const programs = await fetch(
        `${ACADEMIC_SERVICE_URL}/academic/programs?collegeId=${collegeId}`,
        { headers: { Authorization: token } }
      ).then(r => r.json());

      // SESSIONS
      const sessions = await fetch(
        `${ACADEMIC_SERVICE_URL}/academic/sessions?collegeId=${collegeId}`,
        { headers: { Authorization: token } }
      ).then(r => r.json());

      // COURSES
      const courses = await fetch(
        `${ACADEMIC_SERVICE_URL}/academic/courses?collegeId=${collegeId}`,
        { headers: { Authorization: token } }
      ).then(r => r.json());

      const stats = {
        teachers: users.filter(u => u.role === "teacher").length,
        students: users.filter(u => u.role === "student").length,
        parents: users.filter(u => u.role === "parent").length,
        programs: programs.length,
        sessions: sessions.length,
        courses: courses.length
      };

      res.json({ stats });

    } catch (err) {
      console.error("STATS ERROR:", err);
      res.status(500).json({ message: "Failed to compute stats" });
    }
  });

  return router;
}
