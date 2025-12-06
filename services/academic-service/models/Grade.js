import mongoose from "mongoose";

const GradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GradeItem",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  score: { type: Number, required: true },
  maxPoints: { type: Number, required: true },

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Grade", GradeSchema);
