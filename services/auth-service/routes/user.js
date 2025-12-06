import express from "express";
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser
} from "../controllers/user.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.get("/", requireAdmin, listUsers);
router.post("/", requireAdmin, createUser);
router.put("/:id", requireAdmin, updateUser);
router.delete("/:id", requireAdmin, deleteUser);

export default router;
