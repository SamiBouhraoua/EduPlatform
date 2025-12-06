import express from "express";
import { login, changePassword } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);

router.put("/change-password", authMiddleware, changePassword);

export default router;
