import express from "express";
import requireCollege from "../middleware/requireCollege.js";
import { enrollStudent, listEnrollments, deleteEnrollment, listEnrollmentsByCourse } from "../controllers/enrollment.controller.js";

const router = express.Router();

router.post("/", requireCollege, enrollStudent);
router.get("/", requireCollege, listEnrollments);
router.delete("/:id", requireCollege, deleteEnrollment);

router.get("/by-course/:courseId", requireCollege, listEnrollmentsByCourse);


export default router;
