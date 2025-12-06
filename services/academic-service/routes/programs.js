import express from "express";
import requireCollege from "../middleware/requireCollege.js";
import {
  createProgram, listPrograms, updateProgram, deleteProgram
} from "../controllers/program.controller.js";

const router = express.Router();

router.post("/", requireCollege, createProgram);
router.get("/", requireCollege, listPrograms);
router.put("/:id", requireCollege, updateProgram);
router.delete("/:id", requireCollege, deleteProgram);

export default router;
