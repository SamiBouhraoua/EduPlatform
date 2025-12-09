"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AddCategoryModal from "./AddCategoryModal";
import AddItemModal from "./AddItemModal";

/* ============================================================
   MODALE CATÉGORIES
============================================================ */
export default function CategoriesModal({
  categories,
  courseId,
  setShowCategoriesModal,
  showToast,
}: any) {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [showItemsModal, setShowItemsModal] = useState<any>(null);

  // ---- DELETE CATEGORY ----
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/academic/grades/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            "x-college-id": localStorage.getItem("collegeId")!,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) return showToast("Erreur lors de la suppression");

      showToast("Catégorie supprimée !");
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      showToast("Erreur serveur");
    }
  };

  // ---- EDIT CATEGORY ----
  const handleEditCategory = (cat: any) => {
    setEditCategory(cat);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999999]" onClick={() => setShowCategoriesModal(false)}>
        <div className="bg-slate-900 border border-white/10 w-[650px] p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-semibold text-white">Catégories d'évaluation</h2>
            <button onClick={() => setShowCategoriesModal(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
          </div>

          {/* LISTE DES CATÉGORIES */}
          {categories.length === 0 ? (
            <p className="text-slate-500 mb-5">Aucune catégorie.</p>
          ) : (
            <ul className="space-y-4 mb-6">
              {categories.map((cat: any) => (
                <li
                  key={cat._id}
                  className="p-4 bg-slate-800/50 border border-white/10 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{cat.name}</p>
                    <p className="text-sm text-slate-400">{cat.weight}%</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      className="text-blue-400 hover:text-blue-300 transition"
                      onClick={() => handleEditCategory(cat)}
                    >
                      Modifier
                    </button>

                    <button
                      className="text-red-400 hover:text-red-300 transition"
                      onClick={() => handleDeleteCategory(cat._id)}
                    >
                      Supprimer
                    </button>

                    <button
                      className="text-purple-400 hover:text-purple-300 transition"
                      onClick={() => setShowItemsModal(cat)}
                    >
                      Items →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* BOUTON AJOUTER */}
          <button
            onClick={() => setShowAddCategory(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition"
          >
            + Ajouter une catégorie
          </button>
        </div>
      </div>

      {/* ---- MODALE AJOUT ---- */}
      {showAddCategory && (
        <AddCategoryModal
          courseId={courseId}
          showToast={showToast}
          setShowAddCategory={setShowAddCategory}
        />
      )}

      {/* ---- MODALE MODIFICATION ---- */}
      {editCategory && (
        <AddCategoryModal
          courseId={courseId}
          showToast={showToast}
          setShowAddCategory={() => setEditCategory(null)}
          editData={editCategory}
        />
      )}

      {/* ---- MODALE ITEMS ---- */}
      {showItemsModal && (
        <ItemsModal
          category={showItemsModal}
          courseId={courseId}
          showToast={showToast}
          setShowItemsModal={setShowItemsModal}
        />
      )}
    </>,
    document.body
  );
}

/* ============================================================
   MODALE ITEMS D’UNE CATÉGORIE
============================================================ */
function ItemsModal({
  category,
  courseId,
  showToast,
  setShowItemsModal,
}: any) {
  const [items, setItems] = useState<any[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Charger items
  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/academic/grades/items/by-category/${category._id}`,
      {
        headers: {
          "x-college-id": localStorage.getItem("collegeId")!,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((r) => r.json())
      .then(setItems)
      .catch(() => showToast("Erreur chargement items"));
  }, []);

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer cet item ?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/academic/grades/items/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-college-id": localStorage.getItem("collegeId")!,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) return showToast("Erreur suppression");

      showToast("Item supprimé !");
      setItems(items.filter((i) => i._id !== id));
    } catch {
      showToast("Erreur serveur");
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999999]" onClick={() => setShowItemsModal(null)}>
      <div className="bg-slate-900 border border-white/10 w-[650px] p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-white">Items – {category.name}</h2>
          <button onClick={() => setShowItemsModal(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>

        {items.length === 0 ? (
          <p className="text-slate-500 mb-5">Aucun item.</p>
        ) : (
          <ul className="space-y-4 mb-6">
            {items.map((item: any) => (
              <li
                key={item._id}
                className="p-4 bg-slate-800/50 border border-white/10 rounded-xl flex justify-between"
              >
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">
                    {item.maxPoints} %
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    className="text-blue-400 hover:text-blue-300 transition"
                    onClick={() => setEditItem(item)}
                  >
                    Modifier
                  </button>

                  <button
                    className="text-red-400 hover:text-red-300 transition"
                    onClick={() => deleteItem(item._id)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setShowAddItem(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition"
        >
          + Ajouter un item
        </button>
      </div>

      {/* Modal ajout */}
      {showAddItem && (
        <AddItemModal
          category={category}
          courseId={courseId}
          showToast={showToast}
          close={() => setShowAddItem(false)}
        />
      )}

      {/* Modal modification */}
      {editItem && (
        <AddItemModal
          category={category}
          courseId={courseId}
          editData={editItem}
          showToast={showToast}
          close={() => setEditItem(null)}
        />
      )}
    </div>,
    document.body
  );
}

