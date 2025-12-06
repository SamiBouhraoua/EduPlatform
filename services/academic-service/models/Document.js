import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    name: { type: String, required: true },
    url: { type: String, required: true },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Document", DocumentSchema);
