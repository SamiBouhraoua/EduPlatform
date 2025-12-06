import Document from "../models/Document.js";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

const PDF_EXTRACTOR_URL = process.env.PDF_EXTRACTOR_URL || "http://pdf-extractor:5001";

/* ============================================================
   UPLOAD DOCUMENT (nom + fichier)
============================================================ */
export const uploadDocument = async (req, res) => {
  try {
    const { name, courseId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const fileUrl = `http://localhost:4002/uploads/documents/${req.file.filename}`;

    const doc = await Document.create({
      name,
      courseId,
      collegeId: req.collegeId,
      url: fileUrl,
    });

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur upload" });
  }
};


/* ============================================================
   LIST
============================================================ */
export const listDocuments = async (req, res) => {
  const items = await Document.find({ collegeId: req.collegeId });
  res.json(items);
};

export const listDocumentsByCourse = async (req, res) => {
  try {
    const docs = await Document.find({
      courseId: req.params.courseId,
      collegeId: req.collegeId
    });

    res.json(docs);

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ============================================================
   UPDATE DOCUMENT
============================================================ */
export const updateDocument = async (req, res) => {
  try {
    const updated = await Document.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.collegeId },
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   DELETE
============================================================ */
export const deleteDocument = async (req, res) => {
  try {
    // 1️⃣ Récupérer le document dans la BD
    const doc = await Document.findOne({
      _id: req.params.id,
      collegeId: req.collegeId,
    });

    if (!doc) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    const filename = doc.url.split("/").pop();

    const filePath = path.join("uploads", "documents", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("📌 Fichier supprimé :", filePath);
    } else {
      console.log("⚠️ Fichier introuvable :", filePath);
    }

    await Document.deleteOne({
      _id: req.params.id,
      collegeId: req.collegeId,
    });

    res.json({ success: true, message: "Document supprimé avec succès" });

  } catch (error) {
    console.error("❌ ERREUR DELETE:", error);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

/* ============================================================
   GET DOCUMENT CONTENT (TEXT)
============================================================ */
export const getDocumentContent = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      collegeId: req.collegeId,
    });

    if (!doc) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    const filename = doc.url.split("/").pop();
    const filePath = path.join("uploads", "documents", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier physique introuvable" });
    }

    // Simple extension check
    if (filename.toLowerCase().endsWith(".pdf")) {
      // Call PDF extractor service
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await fetch(`${PDF_EXTRACTOR_URL}/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('PDF extraction failed');
      }

      const data = await response.json();
      return res.json({ content: data.content });
    } else {
      // For text files, just read as utf-8
      const text = fs.readFileSync(filePath, "utf-8");
      return res.json({ content: text });
    }

  } catch (error) {
    console.error("❌ ERREUR CONTENT:", error);
    res.status(500).json({ message: "Erreur lors de la lecture du contenu" });
  }
};
