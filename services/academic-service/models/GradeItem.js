import mongoose from "mongoose";

const GradeItemSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GradeCategory",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  title: { type: String, required: true },
  maxPoints: { type: Number, required: true },

  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("GradeItem", GradeItemSchema);
