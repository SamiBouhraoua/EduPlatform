import Grade from "../models/Grade.js";

export const setGrade = async (req, res) => {
  try {
    const { studentId, itemId, score, maxPoints, courseId } = req.body;

    const grade = await Grade.findOneAndUpdate(
      { studentId, itemId, collegeId: req.collegeId },
      {
        studentId,
        itemId,
        score,
        maxPoints,
        courseId,
        teacherId: req.userId,
        collegeId: req.collegeId
      },
      { upsert: true, new: true }
    );

    res.json(grade);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listGrades = async (req, res) => {
  try {
    const items = await Grade.find({
      courseId: req.params.courseId,
      collegeId: req.collegeId
    })
      .populate("studentId", "firstName lastName email")
      .populate("itemId", "title maxPoints");

    res.json(items);

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export async function listAllGrades(req, res) {
  try {
    const collegeId = req.collegeId;

    const grades = await Grade.find({ collegeId })
      .populate("studentId")
      .populate("courseId")
      .populate("itemId");

    return res.json(grades);

  } catch (err) {
    console.error("❌ Error loading all grades:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}