"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export default function AddCategoryModal({ courseId, setShowAddCategory, showToast, editData }: any) {

  const [name, setName] = useState(editData?.name || "");
  const [weight, setWeight] = useState<number>(editData?.weight || 0);
  const [loading, setLoading] = useState(false);

  async function saveCategory() {

    if (!name) return showToast("Entrez un nom");
    if (weight <= 0) return showToast("Entrez un poids (%) valide");

    setLoading(true);

    // Mode création ou édition
    const isEdit = !!editData;

    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/academic/grades/categories/${editData._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/academic/grades/categories`;

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
          name,
          weight,
          courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        return showToast("Erreur : " + data.message);
      }

      showToast(isEdit ? "Catégorie modifiée !" : "Catégorie ajoutée !");
      setShowAddCategory(false);

      setTimeout(() => window.location.reload(), 900);

    } catch (e) {
      showToast("Erreur serveur");
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999999]" onClick={() => setShowAddCategory(false)}>
      <div className="bg-slate-900 border border-white/10 w-[450px] p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>

        <h2 className="text-xl font-semibold mb-4 text-white">
          {editData ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </h2>

        <input
          type="text"
          placeholder="Nom de la catégorie"
          className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded w-full mb-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            type="number"
            className="bg-slate-800/50 border border-white/10 text-white p-2 rounded w-full pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={weight}
            min={0}
            max={100}
            step={5}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val < 0) val = 0;
              if (val > 100) val = 100;
              val = Math.round(val / 5) * 5;
              setWeight(val);
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            %
          </span>
        </div>

        <button
          onClick={saveCategory}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg w-full transition"
          disabled={loading}
        >
          {loading ? "..." : editData ? "Modifier" : "Ajouter"}
        </button>

        <button
          className="mt-3 text-slate-400 hover:text-white w-full transition"
          onClick={() => setShowAddCategory(false)}
        >
          Annuler
        </button>

      </div>
    </div>,
    document.body
  );
}
