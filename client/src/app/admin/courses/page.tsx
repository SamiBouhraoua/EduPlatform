"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ============= TOAST =============
function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="
      fixed top-11 left-1/2 -translate-x-1/2 
      bg-gradient-to-r from-emerald-600 to-teal-600 text-white
      px-6 py-3 mt-7 rounded-xl shadow-xl 
      z-[60] animate-slideDown
    ">
      {message}
    </div>
  );
}

// ============= MODAL =============
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

// ============= TYPES =============
type Course = {
  _id: string;
  title: string;
  code: string;
  programId: string;
  teacherId?: string;
  sessionId?: string;
  collegeId: string;
};

type Program = {
  _id: string;
  name: string;
};

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
};

type Session = {
  _id: string;
  name: string;
};


// ============= PAGE =============
export default function CoursesAdmin() {
  const [items, setItems] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [toast, setToast] = useState({ show: false, message: "" });
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSessionOpen, setAssignSessionOpen] = useState(false);

  const [editItem, setEditItem] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  const [form, setForm] = useState({
    title: "",
    code: "",
    programId: ""
  });

  // ============= LOAD DATA =============
  const loadCourses = () => {
    api
      .get("/academic/courses", {
        headers: { "x-college-id": localStorage.getItem("collegeId") }
      })
      .then((r) => setItems(r.data ?? []));
  };

  const loadPrograms = () => {
    api
      .get("/academic/programs", {
        headers: { "x-college-id": localStorage.getItem("collegeId") }
      })
      .then((r) => setPrograms(r.data ?? []));
  };

  const loadTeachers = () => {
    api.get("/users").then((r) => {
      setTeachers(r.data.filter((u: User) => u.role === "teacher"));
    });
  };

  const loadSessions = () => {
    api
      .get("/academic/sessions", {
        headers: { "x-college-id": localStorage.getItem("collegeId") }
      })
      .then((r) => setSessions(r.data ?? []));
  };

  useEffect(() => {
    loadCourses();
    loadPrograms();
    loadTeachers();
    loadSessions();
  }, []);

  // ============= MODALS OPENERS =============
  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", code: "", programId: "" });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditItem(course);
    setForm({
      title: course.title,
      code: course.code,
      programId: course.programId
    });
    setError(null);
    setModalOpen(true);
  };

  const openAssignTeacher = (course: Course) => {
    setSelectedCourse(course);
    setSelectedTeacher(course.teacherId ?? "");
    setAssignOpen(true);
  };

  const openAssignSession = (course: Course) => {
    setSelectedCourse(course);
    setSelectedSession(course.sessionId ?? "");
    setAssignSessionOpen(true);
  };

  // ============= TOAST =============
  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  // ============= SAVE COURSE =============
  const save = async () => {
    setError(null);

    if (!form.code.trim() || !form.title.trim() || !form.programId.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      if (editItem) {
        await api.put(
          `/academic/courses/${editItem._id}`,
          form,
          { headers: { "x-college-id": localStorage.getItem("collegeId") } }
        );
        showToast("Cours modifié !");
      } else {
        await api.post(
          `/academic/courses`,
          form,
          { headers: { "x-college-id": localStorage.getItem("collegeId") } }
        );
        showToast("Cours ajouté !");
      }

      setModalOpen(false);
      loadCourses();
    } catch (e) {
      setError("Erreur lors de l’enregistrement.");
    }
  };

  // ============= DELETE COURSE =============
  const remove = async (id: string) => {
    if (!confirm("Supprimer ce cours ?")) return;

    await api.delete(`/academic/courses/${id}`, {
      headers: { "x-college-id": localStorage.getItem("collegeId") }
    });

    showToast("Cours supprimé !");
    loadCourses();
  };

  // ============= ASSIGN TEACHER =============
  const assignTeacher = async () => {
    if (!selectedCourse || !selectedTeacher) return;

    await api.post(
      "/academic/courses/assign-teacher",
      {
        courseId: selectedCourse._id,
        teacherId: selectedTeacher
      },
      { headers: { "x-college-id": localStorage.getItem("collegeId") } }
    );

    showToast("Professeur assigné !");
    setAssignOpen(false);
    loadCourses();
  };

  // ============= ASSIGN SESSION =============
  const assignSession = async () => {
    if (!selectedCourse || !selectedSession) return;

    await api.post(
      "/academic/courses/assign-session",
      {
        courseId: selectedCourse._id,
        sessionId: selectedSession
      },
      { headers: { "x-college-id": localStorage.getItem("collegeId") } }
    );

    showToast("Session assignée !");
    setAssignSessionOpen(false);
    loadCourses();
  };

  // ============= UI =============
  return (
    <div className="container-page py-8">

      <Toast message={toast.message} show={toast.show} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Cours</h1>

        <button
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl shadow-md transition"
          onClick={openCreate}
        >
          + Ajouter
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((c) => {
          const teacher = teachers.find((t) => t._id === c.teacherId);
          const session = sessions.find((s) => s._id === c.sessionId);
          const program = programs.find((p) => p._id === c.programId);

          return (
            <div
              key={c._id}
              className="
          rounded-2xl bg-slate-900/50 border border-white/5
          p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/30
          transition-all duration-300
          hover:-translate-y-1
        "
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white leading-tight">
                  {c.code} – {c.title}
                </h2>
              </div>

              {/* INFOS */}
              <div className="space-y-1 text-slate-300 text-sm mb-5">
                <p>
                  <span className="font-semibold text-white">Programme :</span>{" "}
                  {program?.name ?? "—"}
                </p>

                <p>
                  <span className="font-semibold text-white">Professeur :</span>{" "}
                  {teacher ? (
                    <span className="text-white">
                      {teacher.firstName} {teacher.lastName}
                    </span>
                  ) : (
                    <span className="text-red-400 font-medium">Aucun</span>
                  )}
                </p>

                <p>
                  <span className="font-semibold text-white">Session :</span>{" "}
                  {session ? (
                    <span className="text-white">{session.name}</span>
                  ) : (
                    <span className="text-red-400 font-medium">Aucune</span>
                  )}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-2">

                <button
                  onClick={() => openAssignTeacher(c)}
                  className="
              px-3 py-1.5 rounded-xl text-xs font-medium
              bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30
              transition
            "
                >
                  Assigner prof
                </button>

                <button
                  onClick={() => openAssignSession(c)}
                  className="
              px-3 py-1.5 rounded-xl text-xs font-medium
              bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30
              transition
            "
                >
                  Session
                </button>

                <button
                  onClick={() => openEdit(c)}
                  className="
              px-3 py-1.5 rounded-xl text-xs font-medium
              bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30
              transition
            "
                >
                  Modifier
                </button>

                <button
                  onClick={() => remove(c._id)}
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
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 text-white">
          {editItem ? "Modifier le cours" : "Ajouter un cours"}
        </h2>

        <div className="flex flex-col gap-4">

          <input
            className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <input
            className="bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Titre"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <select
            className="bg-slate-800/50 border border-white/10 text-white p-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={form.programId}
            onChange={(e) => setForm({ ...form, programId: e.target.value })}
          >
            <option value="">-- Choisir un programme --</option>
            {programs.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={save}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl mt-2 shadow transition"
          >
            Enregistrer
          </button>
        </div>
      </Modal>

      {/* ASSIGN TEACHER MODAL */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 text-white">Assigner un professeur</h2>

        <div className="flex flex-col gap-4">
          <input
            disabled
            className="bg-slate-800/30 border border-white/10 text-slate-500 p-2 rounded-xl cursor-not-allowed"
            value={selectedCourse?.title ?? ""}
          />

          <select
            className="bg-slate-800/50 border border-white/10 text-white p-2 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">-- Choisir un professeur --</option>

            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>

          <button
            onClick={assignTeacher}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl shadow transition"
          >
            Assigner
          </button>
        </div>
      </Modal>

      {/* ASSIGN SESSION MODAL */}
      <Modal open={assignSessionOpen} onClose={() => setAssignSessionOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 text-white">Assigner une session</h2>

        <div className="flex flex-col gap-4">
          <input
            disabled
            className="bg-slate-800/30 border border-white/10 text-slate-500 p-2 rounded-xl cursor-not-allowed"
            value={selectedCourse?.title ?? ""}
          />

          <select
            className="bg-slate-800/50 border border-white/10 text-white p-2 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">-- Choisir une session --</option>

            {sessions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={assignSession}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-2 rounded-xl shadow transition"
          >
            Assigner
          </button>
        </div>
      </Modal>

    </div>
  );
}
