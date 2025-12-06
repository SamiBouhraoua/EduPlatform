// scripts/cleanDatabase.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

import Grade from "../models/Grade.js";
import GradeItem from "../models/GradeItem.js";
import GradeCategory from "../models/GradeCategory.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

dotenv.config();

// 🔥 AUTO-DETECT local vs Docker
const isDocker = process.env.DOCKER === "true";

const MONGO_URI = isDocker
  ? "mongodb://mongo:27017/edu_academic"        // Docker mode
  : process.env.MONGO_URI || "mongodb://127.0.0.1:27017/edu_academic"; // Local mode

console.log("📌 Connexion MongoDB:", MONGO_URI);


// ------------------------------------------
// CONNECT
// ------------------------------------------
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Mongo connecté");
  } catch (err) {
    console.error("❌ Erreur Mongo:", err);
    process.exit(1);
  }
}


// ------------------------------------------
// MAIN CLEANING SCRIPT
// ------------------------------------------
async function cleanDatabase() {
  await connectDB();

  console.log("\n🧹 Nettoyage en cours...\n");

  // 1) Récupération des données
  const allItems = await GradeItem.find({});
  const allGrades = await Grade.find({});
  const allCourses = await Course.find({});
  const allCategories = await GradeCategory.find({});

  const courseIds = allCourses.map((c) => String(c._id));
  const itemIds = allItems.map((i) => String(i._id));

  // 2) Éléments fantômes
  const itemsGhost = allItems.filter(
    (i) => !courseIds.includes(String(i.courseId))
  );

  const gradesGhostItem = allGrades.filter(
    (g) => !itemIds.includes(String(g.itemId))
  );

  const gradesGhostCourse = allGrades.filter(
    (g) => !courseIds.includes(String(g.courseId))
  );

  const categoriesGhost = allCategories.filter(
    (c) => !courseIds.includes(String(c.courseId))
  );

  // 3) BACKUP avant suppression
  const backup = {
    timestamp: new Date(),
    itemsGhost,
    gradesGhostItem,
    gradesGhostCourse,
    categoriesGhost,
  };

  fs.writeFileSync("./scripts/backup_clean.json", JSON.stringify(backup, null, 2));
  console.log("📦 Backup créé → scripts/backup_clean.json");

  // 4) Suppression réelle des fantômes
  await GradeItem.deleteMany({ _id: { $in: itemsGhost.map((i) => i._id) } });
  await Grade.deleteMany({ _id: { $in: gradesGhostItem.map((g) => g._id) } });
  await Grade.deleteMany({ _id: { $in: gradesGhostCourse.map((g) => g._id) } });
  await GradeCategory.deleteMany({ _id: { $in: categoriesGhost.map((c) => c._id) } });

  console.log(`
✅ Nettoyage terminé :
   - Items fantômes supprimés : ${itemsGhost.length}
   - Notes avec item fantôme : ${gradesGhostItem.length}
   - Notes avec cours supprimé : ${gradesGhostCourse.length}
   - Catégories fantômes : ${categoriesGhost.length}
`);

  process.exit();
}

cleanDatabase();
