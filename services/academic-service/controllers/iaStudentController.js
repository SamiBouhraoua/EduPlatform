import Session from "../models/Session.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Grade from "../models/Grade.js";
import Document from "../models/Document.js";
import StudentReport from "../models/StudentReport.js";
import GradeItem from "../models/GradeItem.js";
import GradeCategory from "../models/GradeCategory.js";

export const getActiveCoursesForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const collegeId = req.headers["x-college-id"];

    if (!collegeId) {
      return res.status(400).json({ error: "x-college-id header is required" });
    }

    // 1) Sessions actives
    const activeSessions = await Session.find({
      collegeId,
      state: "ACTIVE",
    }).select("_id");

    const activeSessionIds = activeSessions.map((s) => s._id);

    // 2) Cours actifs
    const courses = await Course.find({
      collegeId,
      sessionId: { $in: activeSessionIds },
    })
      .populate("sessionId")
      .populate("programId");

    const courseIds = courses.map((c) => c._id.toString());

    // 3) Inscriptions
    const enrollments = await Enrollment.find({
      studentId,
      courseId: { $in: courseIds },
    });

    const enrollmentCourseIds = enrollments.map((e) =>
      e.courseId.toString()
    );

    // 4) Notes + items + catégories
    const [grades, items, categories] = await Promise.all([
      Grade.find({
        studentId,
        courseId: { $in: enrollmentCourseIds },
      }),
      GradeItem.find({
        courseId: { $in: enrollmentCourseIds },
      }).populate("categoryId"),
      GradeCategory.find({
        courseId: { $in: enrollmentCourseIds },
      }),
    ]);

    /** ===========================================================
     * 🔥 computeFinalGrade — VERSION INTELLIGENTE (99% COMPLÉTION)
     * ===========================================================*/
    function computeFinalGrade(courseId) {
      // Items validés (pas fantômes)
      const courseItems = items.filter(
        (it) =>
          String(it.courseId) === String(courseId) &&
          it.categoryId && it.categoryId._id &&      // doit avoir une vraie catégorie
          it.maxPoints && it.maxPoints > 0           // doit avoir un vrai max
      );

      // Notes valides (pas fantômes)
      const courseGrades = grades.filter(
        (g) =>
          String(g.courseId) === String(courseId) &&
          g.itemId                                     // itemId doit exister
      );

      if (courseItems.length === 0) {
        return null; // Pas d'items = pas commencé
      }

      // Calcul du total des points possibles du cours
      let totalCoursePoints = 0;
      courseItems.forEach(item => {
        totalCoursePoints += item.maxPoints;
      });

      // Calcul des points évalués (ceux qui ont une note)
      let totalEvaluatedPoints = 0;
      let earned = 0;

      for (const item of courseItems) {
        const g = courseGrades.find(
          (gg) => String(gg.itemId) === String(item._id)
        );

        if (g) {
          totalEvaluatedPoints += item.maxPoints;
          earned += g.score;
        }
      }

      // Si le total est 0, on évite la division par zéro
      if (totalCoursePoints === 0) return null;

      const completionRatio = totalEvaluatedPoints / totalCoursePoints;

      console.log(`📘 ANALYSE ${courseId} : ${Math.round(completionRatio * 100)}% évalué`);

      // Si moins de 99% des points sont évalués, on considère le cours comme NON TERMINÉ
      if (completionRatio < 0.99) {
        return null;
      }

      // Sinon, on retourne la note finale
      const final = Math.round((earned / totalEvaluatedPoints) * 100);
      return final;
    }

    /** ===========================================================
     * 🔥 FILTRER — NE RETOURNER QUE LES COURS NON TERMINÉS
     * ===========================================================*/
    const result = [];

    for (const enr of enrollments) {
      const courseId = enr.courseId.toString();
      const course = courses.find((c) => c._id.toString() === courseId);
      if (!course) continue;

      const finalGrade = computeFinalGrade(courseId);

      // Si la note finale existe → le cours est terminé → on ignore
      if (finalGrade !== null) {
        console.log("➡ Cours terminé → EXCLU DE L’IA :", course.code);
        continue;
      }

      console.log("➡ Cours NON TERMINÉ → INCLUS dans IA :", course.code);

      const docs = await Document.find({ courseId });
      const reports = await StudentReport.find({
        courseId,
        studentId,
      }).sort({ createdAt: -1 });

      result.push({
        course,
        finalGrade: null,
        categories: categories.filter(
          (c) => String(c.courseId) === courseId
        ),
        items: items.filter(
          (i) => String(i.courseId) === courseId
        ),
        grades: grades.filter(
          (g) => String(g.courseId) === courseId
        ),
        documents: docs,
        reports,
      });
    }

    return res.json({ courses: result });
  } catch (err) {
    console.error("IA error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
