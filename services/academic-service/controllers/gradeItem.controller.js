import GradeItem from "../models/GradeItem.js";

// -----------------------------
// CREATE
// -----------------------------
export const createItem = async (req, res) => {
  try {
    const data = await GradeItem.create({
      ...req.body,
      collegeId: req.collegeId,
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// -----------------------------
// GET ITEMS BY CATEGORY
// -----------------------------
export const listItemsByCategory = async (req, res) => {
  try {
    const items = await GradeItem.find({
      categoryId: req.params.categoryId,
      collegeId: req.collegeId,
    }).populate("categoryId", "name weight");

    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// -----------------------------
// UPDATE
// -----------------------------
export const updateItem = async (req, res) => {
  try {
    const item = await GradeItem.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.collegeId },
      req.body,
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Item non trouvé" });

    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// -----------------------------
// DELETE
// -----------------------------
export const deleteItem = async (req, res) => {
  try {
    const deleted = await GradeItem.findOneAndDelete({
      _id: req.params.id,
      collegeId: req.collegeId,
    });

    if (!deleted) return res.status(404).json({ message: "Item non trouvé" });

    res.json({ message: "Item supprimé" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listItemsByCourse = async (req, res) => {
  try {
    const items = await GradeItem.find({
      courseId: req.params.courseId,
      collegeId: req.collegeId
    }).populate("categoryId", "name weight");

    res.json(items);

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
