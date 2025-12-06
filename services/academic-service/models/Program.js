import mongoose from "mongoose";

const ProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: String, required: true },
    code: { type: String, required: true },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Program", ProgramSchema);
