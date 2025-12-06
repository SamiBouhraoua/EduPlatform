"use client";
import { createPortal } from "react-dom";

export default function DocumentsModal({ documents, setShowDocsModal, setShowAddDocumentModal, showToast }: any) {

  async function deleteDoc(id: string) {
    try {
      const response = await fetch(`http://localhost:4002/academic/documents/${id}`, {
        method: "DELETE",
        headers: {
          "x-college-id": localStorage.getItem("collegeId")!,
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) return showToast("Erreur lors de la suppression");

      showToast("Document supprimé !");
      setTimeout(() => window.location.reload(), 900);

    } catch {
      showToast("Erreur serveur");
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center" onClick={() => setShowDocsModal(false)}>
      <div className="bg-slate-900 border border-white/10 w-[600px] p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-white">Documents du cours</h2>
          <button onClick={() => setShowDocsModal(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>

        <ul className="space-y-3 mb-5">
          {documents.map((d: any) => (
            <li key={d._id} className="flex justify-between items-center p-3 bg-slate-800/50 border border-white/10 rounded-xl">
              <span className="text-white">{d.name}</span>
              <div className="flex gap-4">
                <a href={d.url} target="_blank" className="text-blue-400 hover:text-blue-300 transition">voir</a>
                <button onClick={() => deleteDoc(d._id)} className="text-red-400 hover:text-red-300 transition">
                  supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setShowAddDocumentModal(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition"
        >
          + Ajouter un document
        </button>
      </div>
    </div>,
    document.body
  );
}
