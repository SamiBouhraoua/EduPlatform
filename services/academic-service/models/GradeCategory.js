import mongoose from "mongoose";

const GradeCategorySchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  name: { type: String, required: true },
  weight: { type: Number, required: true }, // ex: 40 (%)
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("GradeCategory", GradeCategorySchema);
