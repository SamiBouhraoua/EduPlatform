import express from "express";
import requireCollege from "../middleware/requireCollege.js";
import { upload } from "../middleware/multer.js";

import {
  uploadDocument,
  listDocuments,
  updateDocument,
  deleteDocument,
  listDocumentsByCourse,

} from "../controllers/document.controller.js";

const router = express.Router();

// Upload réel → champs : file
router.post("/upload", requireCollege, upload.single("file"), uploadDocument);

// List
router.get("/", requireCollege, listDocuments);

// List documents d'un cours
router.get("/by-course/:courseId", requireCollege, listDocumentsByCourse);

// Modifier
router.put("/:id", requireCollege, updateDocument);

// Supprimer
router.delete("/:id", requireCollege, deleteDocument);



export default router;
