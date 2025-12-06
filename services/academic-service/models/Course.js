import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },

    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: false
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Course", CourseSchema);
