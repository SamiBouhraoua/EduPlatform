import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },

  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Enrollment", EnrollmentSchema);
