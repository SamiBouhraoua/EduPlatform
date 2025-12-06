import GradeCategory from "../models/GradeCategory.js";

export const createCategory = async (req, res) => {
  try {
    const data = await GradeCategory.create({
      ...req.body,
      collegeId: req.collegeId
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listCategories = async (req, res) => {
  try {
    const items = await GradeCategory.find({
      courseId: req.query.courseId,
      collegeId: req.collegeId
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listCategoriesByCourse = async (req, res) => {
  try {
    const items = await GradeCategory.find({
      courseId: req.params.courseId,
      collegeId: req.collegeId
    });

    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await GradeCategory.deleteOne({
      _id: req.params.id,
      collegeId: req.collegeId
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updated = await GradeCategory.findOneAndUpdate(
      {
        _id: req.params.id,
        collegeId: req.collegeId
      },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
