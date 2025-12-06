import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import collegeRoutes from "./routes/college.js";

const {
  PORT = 4001,
  MONGO_URI = "mongodb://localhost:27017/edu_auth"
} = process.env;

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log("auth-service: Mongo connected"))
  .catch(err => console.error("MongoDB error:", err));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/colleges", collegeRoutes);

app.listen(PORT, () => console.log(`auth-service running on :${PORT}`));
