import Enrollment from "../models/Enrollment.js";

export async function enrollStudent(req, res) {
  try {
    const { studentId, courseId, sessionId } = req.body;

    if (!studentId || !courseId || !sessionId)
      return res.status(400).json({ message: "studentId, courseId et sessionId requis" });

    // Empêche doublon
    const exists = await Enrollment.findOne({
      studentId,
      courseId,
      sessionId,
      collegeId: req.collegeId
    });

    if (exists)
      return res.status(400).json({ message: "Cet étudiant est déjà inscrit à ce cours." });

    const item = await Enrollment.create({
      studentId,
      courseId,
      sessionId,
      collegeId: req.collegeId
    });

    res.json({ message: "Inscription réussie !", enrollment: item });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function listEnrollments(req, res) {
  try {
    const { studentId } = req.query;

    const filter = {
      collegeId: req.collegeId
    };

    if (studentId) filter.studentId = studentId;

    const items = await Enrollment.find(filter)
      .populate("courseId", "code title")
      .populate("sessionId", "name");

    res.json(items);

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function deleteEnrollment(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Enrollment.findOneAndDelete({
      _id: id,
      collegeId: req.collegeId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Inscription non trouvée." });
    }

    res.json({ message: "Inscription supprimée !" });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export const listEnrollmentsByCourse = async (req, res) => {
  try {
    const items = await Enrollment.find({
      courseId: req.params.courseId,
      collegeId: req.collegeId,
    }).populate("studentId", "firstName lastName email");

    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

