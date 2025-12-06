import mongoose from "mongoose";

export default function requireCollegeId(req, res, next) {
  let collegeId =
    req.headers["x-college-id"] ||
    req.query.collegeId ||
    req.body.collegeId;

  if (!collegeId)
    return res.status(400).json({
      message: "collegeId is required (header x-college-id)"
    });

  // Transformation en ObjectId (comme dans auth-service)
  try {
    req.collegeId = new mongoose.Types.ObjectId(collegeId);
  } catch {
    return res.status(400).json({ message: "Invalid collegeId format" });
  }

  next();
}
