import express from "express";
import requireCollege from "../middleware/requireCollege.js";
import {
  createCategory,
  listCategories,
  listCategoriesByCourse,
  deleteCategory,
  updateCategory
} from "../controllers/gradeCategory.controller.js";

const router = express.Router();

router.post("/", requireCollege, createCategory);
router.get("/", requireCollege, listCategories);
router.get("/by-course/:courseId", requireCollege, listCategoriesByCourse);

router.delete("/:id", requireCollege, deleteCategory);
router.put("/:id", requireCollege, updateCategory);

export default router;
