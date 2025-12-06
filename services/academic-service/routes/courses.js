import express from "express";
import requireCollege from "../middleware/requireCollege.js";

import {
  createCourse,
  listCourses,
  listCoursesFull,
  updateCourse,
  deleteCourse,
  assignTeacher,
  assignSession,
  getCourseById
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/", requireCollege, createCourse);
router.get("/", requireCollege, listCourses);
router.get("/full", requireCollege, listCoursesFull);
router.put("/:id", requireCollege, updateCourse);
router.delete("/:id", requireCollege, deleteCourse);

router.post("/assign-teacher", requireCollege, assignTeacher);
router.post("/assign-session", requireCollege, assignSession);

router.get("/:id", requireCollege, getCourseById);

export default router;
