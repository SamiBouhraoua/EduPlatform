"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ----------- TOAST -----------
function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;

  return (
    <div className="
      fixed top-11 left-1/2 -translate-x-1/2 
      bg-gradient-to-r from-emerald-600 to-teal-600 text-white
      px-6 py-3 rounded-xl shadow-xl 
      z-[60] animate-slideDown
    ">
      {message}
    </div>
  );
}

// ----------- MODAL -----------
function Modal({ open, onClose, children }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fadeIn relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl transition"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

// ----------- TYPES -----------
type Session = {
  _id: string;
  name: string;
  code: string;
  state: string;
  startDate: string;
  endDate: string;
};

// ----------- PAGE -----------
export default function SessionsAdmin() {
  const [items, setItems] = useState<Session[]>([]);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Session | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    state: "PLANNED",
    startDate: "",
    endDate: ""
  });

  // ----------- LOAD DATA -----------
  const load = () => {
    api
      .get("/academic/sessions", {
        headers: { "x-college-id": "69130f6ec3818024a5c994c1" }
      })
      .then((r) => setItems(r.data ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  // Toast
  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  // Open modal — create
  const openCreate = () => {
    setEditItem(null);
    setForm({
      name: "",
      code: "",
      state: "PLANNED",
      startDate: "",
      endDate: ""
    });
    setModalOpen(true);
  };

  // Open modal — edit
  const openEdit = (s: Session) => {
    setEditItem(s);
    setForm({
      name: s.name,
      code: s.code,
      state: s.state,
      startDate: s.startDate?.substring(0, 10),
      endDate: s.endDate?.substring(0, 10)
    });
    setModalOpen(true);
  };

  // ----------- SAVE -----------
  const save = async () => {
    setError(null);

    if (
      !form.name.trim() ||
      !form.code.trim() ||
      !form.startDate ||
      !form.endDate
    ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!editItem) {
      const exists = items.some(
        (s) =>
          s.name.toLowerCase() === form.name.toLowerCase() ||
          s.code.toLowerCase() === form.code.toLowerCase()
      );

      if (exists) {
        setError("Cette session existe déjà.");
        return;
      }
    }

    try {
      if (editItem) {
        await api.put(
          `/academic/sessions/${editItem._id}`,
          form,
          { headers: { "x-college-id": "69130f6ec3818024a5c994c1" } }
        );
        showToast("Session modifiée avec succès !");
      } else {
        await api.post(
          `/academic/sessions`,
          form,
          { headers: { "x-college-id": "69130f6ec3818024a5c994c1" } }
        );
        showToast("Session ajoutée avec succès !");
      }

      setModalOpen(false);
      load();
    } catch (e) {
      setError("Erreur lors de l’enregistrement.");
    }
  };

  // ----------- DELETE -----------
  const remove = async (id: string) => {
    if (!confirm("Supprimer cette session ?")) return;

    await api.delete(`/academic/sessions/${id}`, {
      headers: { "x-college-id": "69130f6ec3818024a5c994c1" }
    });

    showToast("Session supprimée avec succès !");
    load();
  };

  return (
    <div className="container-page py-8">

      {/* Toast */}
      <Toast message={toast.message} show={toast.show} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Sessions</h1>

        <button
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl shadow-md transition"
          onClick={openCreate}
        >
          + Ajouter
        </button>
      </div>

      {/* === CARDS GRID === */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((s) => (
          <div
            key={s._id}
            className="
        rounded-2xl bg-slate-900/50 border border-white/5
        p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/30
        transition-all duration-300
        hover:-translate-y-1
      "
          >
            {/* HEADER */}
            <h2 className="text-lg font-bold text-white leading-tight mb-1">
              {s.name}
            </h2>
            <p className="text-sm text-slate-500 mb-4">{s.code}</p>

            {/* BODY */}
            <div className="space-y-1 text-slate-300 text-sm mb-5">
              <p>
                <span className="font-semibold text-white">État :</span>{" "}
                {s.state}
              </p>

              <p>
                <span className="font-semibold text-white">Début :</span>{" "}
                {new Date(s.startDate).toLocaleDateString()}
              </p>

              <p>
                <span className="font-semibold text-white">Fin :</span>{" "}
                {new Date(s.endDate).toLocaleDateString()}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">

              <button
                onClick={() => openEdit(s)}
                className="
            px-3 py-1.5 rounded-xl text-xs font-medium
            bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30
            transition
          "
              >
                Modifier
              </button>

              <button
                onClick={() => remove(s._id)}
                className="
            px-3 py-1.5 rounded-xl text-xs font-medium
            bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30
            transition
          "
              >
                Supprimer
              </button>

            </div>
          </div>
        ))}
      </div>


      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 text-white">
          {editItem ? "Modifier la session" : "Ajouter une session"}
        </h2>

        <div className="flex flex-col gap-4">

          <input
            className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <select
            className="bg-slate-800/50 border border-white/10 text-white p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          >
            <option value="PLANNED">PLANNED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="FINISHED">FINISHED</option>
          </select>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-slate-400">Date début</label>
              <input
                type="date"
                className="bg-slate-800/50 border border-white/10 text-white p-2 rounded-xl w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm text-slate-400">Date fin</label>
              <input
                type="date"
                className="bg-slate-800/50 border border-white/10 text-white p-2 rounded-xl w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={save}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl shadow mt-2 transition"
          >
            Enregistrer
          </button>
        </div>
      </Modal>
    </div>
  );
}
