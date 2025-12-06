import express from "express";
import { getActiveCoursesForStudent } from "../controllers/iaStudentController.js";

const router = express.Router();

router.get("/student/:studentId/active-courses", getActiveCoursesForStudent);

export default router;
