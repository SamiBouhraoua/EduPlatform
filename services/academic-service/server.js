import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import "./models/User.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Routes
import programRoutes from "./routes/programs.js";
import sessionRoutes from "./routes/sessions.js";
import courseRoutes from "./routes/courses.js";
import enrollmentRoutes from "./routes/enrollments.js";
import gradeRoutes from "./routes/grades.js";
import documentRoutes from "./routes/documents.js";
import reportRoutes from "./routes/reports.js";



import gradeCategoryRoutes from "./routes/gradeCategories.js";
import gradeItemRoutes from "./routes/gradeItems.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 4002,
  MONGO_URI = "mongodb://localhost:27017/edu_academic"
} = process.env;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("📚 academic-service: Mongo connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/academic/health", (req, res) => {
  res.json({ ok: true, service: "academic-service" });
});

app.use("/academic/programs", programRoutes);
app.use("/academic/sessions", sessionRoutes);
app.use("/academic/courses", courseRoutes);
app.use("/academic/enrollments", enrollmentRoutes);
app.use("/academic/grades", gradeRoutes);
app.use("/academic/documents", documentRoutes);
app.use("/academic/reports", reportRoutes);


// Catégories
app.use("/academic/grades/categories", gradeCategoryRoutes);

// Items
app.use("/academic/grades/items", gradeItemRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found in academic-service" });
});

app.listen(PORT, () =>
  console.log(`🚀 academic-service running on port :${PORT}`)
);
