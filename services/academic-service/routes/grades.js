import express from "express";
import requireCollege from "../middleware/requireCollege.js";
import { setGrade, listGrades, listAllGrades } from "../controllers/grade.controller.js";

const router = express.Router();

router.get("/:courseId", requireCollege, listGrades);
router.post("/", requireCollege, setGrade);
router.get("/", requireCollege, listAllGrades);

export default router;
