import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  collegeId: mongoose.Schema.Types.ObjectId
});

export default mongoose.model("User", userSchema);
