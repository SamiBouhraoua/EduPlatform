"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, GraduationCap, School, Pencil, Trash2, UserPlus } from "lucide-react";

// --------------------------------------
const COLLEGE_ID = "69130f6ec3818024a5c994c1";
// --------------------------------------

// TYPES
type User = {
  _id: string;
  email: string;
  role: "teacher" | "student" | "parent";
  firstName?: string;
  lastName?: string;
};

// TOAST
function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="
      fixed top-12 left-1/2 -translate-x-1/2 z-[70]
      bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl shadow-xl
      animate-slideDown
    "
    >
      {message}
    </div>
  );
}

// MODAL
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

// MAIN PAGE
export default function UsersAdmin() {
  const [items, setItems] = useState<User[]>([]);
  const [filter, setFilter] = useState<"teacher" | "student" | "parent">("teacher");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "teacher",
    password: "",
  });

  const [toast, setToast] = useState({ show: false, message: "" });
  const [error, setError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  // LOAD USERS
  const load = () => {
    api.get("/users?collegeId=" + COLLEGE_ID).then((r) => setItems(r.data ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((u) => u.role === filter);

  // OPEN CREATE
  const openCreate = () => {
    setEditItem(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      role: filter,
      password: "",
    });
    setError(null);
    setModalOpen(true);
  };

  // OPEN EDIT
  const openEdit = (u: User) => {
    setEditItem(u);
    setForm({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email,
      role: u.role,
      password: "", // OPTIONNEL EN UPDATE
    });
    setError(null);
    setModalOpen(true);
  };

  // SAVE
  const save = async () => {
    setError(null);

    if (!form.email.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      if (editItem) {
        await api.put(`/users/${editItem._id}`, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          collegeId: COLLEGE_ID,
        });
        showToast("Utilisateur modifié !");
      } else {
        if (!form.password.trim()) {
          setError("Le mot de passe est obligatoire.");
          return;
        }

        await api.post(`/users`, {
          ...form,
          collegeId: COLLEGE_ID,
        });

        showToast("Utilisateur ajouté !");
      }

      setModalOpen(false);
      load();
    } catch (e: any) {
      setError("Erreur lors de l’enregistrement.");
    }
  };

  // DELETE
  const remove = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;

    await api.delete(`/users/${id}`);
    showToast("Utilisateur supprimé !");
    load();
  };

  // ROLE CARDS
  const roleCards = [
    {
      role: "teacher" as const,
      title: "Professeurs",
      color: "bg-blue-500",
      icon: <Users size={32} className="text-white" />,
    },
    {
      role: "student" as const,
      title: "Étudiants",
      color: "bg-green-500",
      icon: <GraduationCap size={32} className="text-white" />,
    },
    {
      role: "parent" as const,
      title: "Parents",
      color: "bg-orange-500",
      icon: <School size={32} className="text-white" />,
    },
  ];

  return (
    <div className="container-page py-8">
      <Toast message={toast.message} show={toast.show} />

      <h1 className="text-3xl font-bold text-white mb-6">Utilisateurs</h1>

      {/* ROLE CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {roleCards.map((c) => (
          <div
            key={c.role}
            onClick={() => setFilter(c.role)}
            className={`
              rounded-xl shadow-lg p-6 cursor-pointer transition transform hover:-translate-y-1
              ${filter === c.role ? "ring-4 ring-indigo-500/50" : ""}
              ${c.color}
            `}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">{c.icon}</div>
              <div>
                <h2 className="text-xl font-bold text-white">{c.title}</h2>
                <p className="text-white/80 text-sm">
                  {items.filter((u) => u.role === c.role).length} utilisateur(s)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">
          Liste des {roleCards.find((c) => c.role === filter)?.title}
        </h2>

        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow transition"
        >
          <UserPlus size={18} /> Ajouter
        </button>
      </div>

      {/* USER LIST */}
      <div className="space-y-3">
        {filtered.map((u) => (
          <div
            key={u._id}
            className="bg-slate-900/50 border border-white/5 p-4 shadow rounded-xl flex justify-between items-center hover:border-indigo-500/30 transition"
          >
            <div>
              <p className="text-lg font-semibold text-white">
                {u.firstName} {u.lastName}
              </p>
              <p className="text-slate-400 text-sm">{u.email}</p>
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded-lg flex items-center gap-1 transition"
                onClick={() => openEdit(u)}
              >
                <Pencil size={16} /> Modifier
              </button>

              <button
                className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center gap-1 transition"
                onClick={() => remove(u._id)}
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-slate-500 italic text-center py-10">
            Aucun utilisateur trouvé pour ce rôle.
          </p>
        )}
      </div>

      {/* MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 text-white">
          {editItem ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
        </h2>

        <div className="flex flex-col gap-4">

          <input
            className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Prénom"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />

          <input
            className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Nom"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />

          <input
            className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* ONLY WHEN CREATING */}
          {!editItem && (
            <input
              className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Mot de passe"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}

          <select
            className="bg-slate-800/50 border border-white/10 text-white p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as any })}
          >
            <option value="teacher">Professeur</option>
            <option value="student">Étudiant</option>
            <option value="parent">Parent</option>
          </select>

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
