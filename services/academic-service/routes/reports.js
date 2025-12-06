import express from "express";
import StudentReport from "../models/StudentReport.js";

const router = express.Router();

// Ajouter un nouveau rapport
router.post("/", async (req, res) => {
  try {
    const { courseId, studentId, teacherId, report } = req.body;

    const newReport = await StudentReport.create({
      courseId,
      studentId,
      teacherId,
      report,
    });

    res.json(newReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtenir les rapports d’un étudiant dans un cours
router.get("/:courseId/:studentId", async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    const reports = await StudentReport.find({
      courseId,
      studentId,
    }).sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marquer un rapport comme "lu par l'IA"
router.patch("/:id/ai-read", async (req, res) => {
  try {
    const report = await StudentReport.findByIdAndUpdate(
      req.params.id,
      { aiUsed: true },
      { new: true }
    );

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

// Supprimer un rapport
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await StudentReport.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Rapport introuvable" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
