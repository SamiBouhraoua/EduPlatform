import express from "express";
import requireCollege from "../middleware/requireCollege.js";
import {
  createItem,
  listItemsByCategory,
  updateItem,
  deleteItem,
  listItemsByCourse,
} from "../controllers/gradeItem.controller.js";

const router = express.Router();

router.post("/", requireCollege, createItem);

router.get("/by-category/:categoryId", requireCollege, listItemsByCategory);
router.get("/by-course/:courseId", requireCollege, listItemsByCourse);

router.put("/:id", requireCollege, updateItem);
router.delete("/:id", requireCollege, deleteItem);

export default router;
