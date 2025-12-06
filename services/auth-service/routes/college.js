import express from "express";
import College from "../models/College.js";

const router = express.Router();

// GET /colleges → liste des collèges
router.get("/", async (req, res) => {
  try {
    const list = await College.find().lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
