import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    state: {
      type: String,
      enum: ["PLANNED", "ACTIVE", "FINISHED"],
      default: "PLANNED",
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Session", SessionSchema);
