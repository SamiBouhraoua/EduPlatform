"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export default function AddItemModal({
  category,
  courseId,
  showToast,
  close,
  editData,
}: any) {

  const [title, setTitle] = useState(editData?.title || "");
  const [maxPoints, setMaxPoints] = useState(editData?.maxPoints || 0);
  const [loading, setLoading] = useState(false);

  async function saveItem() {
    if (!title) return showToast("Entrez un titre");
    if (maxPoints <= 0) return showToast("Points invalides");

    setLoading(true);

    const isEdit = !!editData;

    const url = isEdit
      ? `http://localhost:4002/academic/grades/items/${editData._id}`
      : `http://localhost:4002/academic/grades/items`;

    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-college-id": localStorage.getItem("collegeId")!,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          maxPoints,
          courseId,
          categoryId: category._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        return showToast(data.message || "Erreur serveur");
      }

      showToast(isEdit ? "Item modifié !" : "Item ajouté !");
      close();

      setTimeout(() => window.location.reload(), 900);

    } catch (e) {
      showToast("Erreur serveur");
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999999]" onClick={close}>
      <div className="bg-slate-900 border border-white/10 w-[500px] p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>

        <h2 className="text-xl font-semibold mb-4 text-white">
          {editData ? "Modifier l'item" : "Nouvel item"}
        </h2>

        {/* Titre */}
        <input
          type="text"
          placeholder="Titre de l'item"
          className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded w-full mb-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Points */}
        <input
          type="number"
          className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded w-full mb-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          placeholder="Points"
          value={maxPoints}
          min={1}
          max={500}
          onChange={(e) => setMaxPoints(Number(e.target.value))}
        />

        {/* Save */}
        <button
          onClick={saveItem}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg w-full transition"
          disabled={loading}
        >
          {loading ? "..." : editData ? "Modifier" : "Ajouter"}
        </button>

        {/* Cancel */}
        <button
          onClick={close}
          className="mt-3 text-slate-400 hover:text-white w-full transition"
        >
          Annuler
        </button>

      </div>
    </div>,
    document.body
  );
}
