import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["superadmin", "admin", "teacher", "student", "parent"],
      required: true
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true
    },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
