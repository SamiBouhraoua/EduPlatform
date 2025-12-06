import Course from "../models/Course.js";

export const createCourse = async (req, res) => {
  const item = await Course.create({
    ...req.body,
    collegeId: req.collegeId
  });
  res.json(item);
};

export const listCourses = async (req, res) => {
  const items = await Course.find({ collegeId: req.collegeId });
  res.json(items);
};

export const listCoursesFull = async (req, res) => {
  try {
    const items = await Course.find({ collegeId: req.collegeId })
      .populate("programId", "name")
      .populate("sessionId", "name"); // ⚠️ PAS DE populate teacherId !

    res.json(items);
  } catch (err) {
    console.error("🔥 ERREUR listCoursesFull :", err);
    res.status(500).json({ message: err.message });
  }
};



export const updateCourse = async (req, res) => {
  const item = await Course.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.collegeId },
    req.body,
    { new: true }
  );
  res.json(item);
};

export const deleteCourse = async (req, res) => {
  await Course.deleteOne({ _id: req.params.id, collegeId: req.collegeId });
  res.json({ success: true });
};

export async function assignTeacher(req, res) {
  try {
    const { courseId, teacherId } = req.body;

    if (!courseId || !teacherId)
      return res.status(400).json({ message: "courseId et teacherId requis" });

    const updated = await Course.findByIdAndUpdate(
      courseId,
      { teacherId },
      { new: true }
    );

    res.json({
      message: "Professeur assigné avec succès",
      course: updated
    });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export async function assignSession(req, res) {
  try {
    const { courseId, sessionId } = req.body;

    if (!courseId || !sessionId) return res.status(400).json({ message: "courseId et sessionId requis" });

    const updated = await Course.findByIdAndUpdate(
      courseId, { sessionId }, { new: true });
    res.json({ message: "Session assignée au cours", course: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

export const getCourseById = async (req, res) => {
  try {
    console.log("➡️ getCourseById called, id =", req.params.id);

    const course = await Course.findOne({
      _id: req.params.id,
      collegeId: req.collegeId,
    })
      .populate("programId")
      .populate("sessionId");
      
    if (!course) {
      console.log("❌ Course not found");
      return res.status(404).json({ message: "Course not found" });
    }

    console.log("✅ Course found:", course);
    res.json(course);

  } catch (err) {
    console.error("🔥 ERROR getCourseById :", err);
    res.status(500).json({ message: err.message });
  }
};

