import express from "express";
import requireCollege from "../middleware/requireCollege.js";
import {
  createSession, listSessions, updateSession, deleteSession
} from "../controllers/session.controller.js";

const router = express.Router();

router.post("/", requireCollege, createSession);
router.get("/", requireCollege, listSessions);
router.put("/:id", requireCollege, updateSession);
router.delete("/:id", requireCollege, deleteSession);

export default router;
