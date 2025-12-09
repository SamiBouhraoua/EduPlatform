"use client";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function AddDocumentModal({ courseId, setShowAddDocumentModal, showToast }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");

  async function upload() {
    if (!file) return showToast("Choisissez un fichier");
    if (!name) return showToast("Entrez un nom");

    const form = new FormData();
    form.append("name", name);
    form.append("file", file);
    form.append("courseId", courseId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academic/documents/upload`, {
      method: "POST",
      headers: {
        "x-college-id": localStorage.getItem("collegeId")!,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: form,
    });

    if (!response.ok) return showToast("Erreur upload");

    showToast("Document ajouté !");
    setShowAddDocumentModal(false);
    setTimeout(() => window.location.reload(), 900);
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999999]" onClick={() => setShowAddDocumentModal(false)}>
      <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-[450px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4 text-white">Ajouter un document</h2>

        <input
          type="text"
          placeholder="Nom du document"
          className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded w-full mb-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="file"
          className="bg-slate-800/50 border border-white/10 text-white p-2 rounded w-full mb-4"
          onChange={(e: any) => setFile(e.target.files[0])}
        />

        <button onClick={upload} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white w-full py-2 rounded-lg transition">
          Ajouter
        </button>

        <button className="mt-3 text-slate-400 hover:text-white w-full transition" onClick={() => setShowAddDocumentModal(false)}>
          Annuler
        </button>
      </div>
    </div>,
    document.body
  );
}
