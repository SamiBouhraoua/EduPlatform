import mongoose from "mongoose";

const studentReportSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    report: {
      type: String,
      required: true,
    },
    aiUsed: {
      type: Boolean,
      default: false, // True si l'IA a lu ce rapport récemment
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudentReport", studentReportSchema);
