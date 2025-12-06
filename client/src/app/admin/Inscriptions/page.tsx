"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ===== TOAST =====
function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;

  return (
    <div className="
      fixed top-12 left-1/2 -translate-x-1/2
      bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl shadow-xl
      z-[70] animate-slideDown
    ">
      {message}
    </div>
  );
}

// ===== TYPES =====
type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type Enrollment = {
  _id: string;
  studentId: string | { _id: string };
  courseId: { _id: string; code: string; title: string };
  sessionId: { _id: string; name: string };
};

type Course = {
  _id: string;
  title: string;
  code: string;
  sessionId: string;
};

type Session = {
  _id: string;
  name: string;
};

export default function EnrollmentsAdmin() {
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  // ==== LOAD DATA ====
  const loadStudents = () =>
    api.get("/users").then((r) =>
      setStudents(r.data.filter((u: User) => u.role === "student"))
    );

  const loadCourses = () =>
    api
      .get("/academic/courses", {
        headers: { "x-college-id": "69130f6ec3818024a5c994c1" },
      })
      .then((r) => setCourses(r.data ?? []));

  const loadSessions = () =>
    api
      .get("/academic/sessions", {
        headers: { "x-college-id": "69130f6ec3818024a5c994c1" },
      })
      .then((r) => setSessions(r.data ?? []));

  const loadEnrollments = () =>
    api
      .get("/academic/enrollments", {
        headers: { "x-college-id": "69130f6ec3818024a5c994c1" },
      })
      .then((r) => setEnrollments(r.data ?? []));

  useEffect(() => {
    loadStudents();
    loadCourses();
    loadSessions();
    loadEnrollments();
  }, []);

  // ===== REMOVE =====
  const removeEnrollment = async (id: string) => {
    await api.delete(`/academic/enrollments/${id}`, {
      headers: { "x-college-id": "69130f6ec3818024a5c994c1" },
    });

    showToast("Cours enlevé !");
    await loadEnrollments();
  };

  // ===== ADD =====
  const addEnrollment = async (studentId: string, courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    if (!course) return;

    await api.post(
      "/academic/enrollments",
      {
        studentId,
        courseId,
        sessionId: course.sessionId,
        collegeId: "69130f6ec3818024a5c994c1",
      },
      { headers: { "x-college-id": "69130f6ec3818024a5c994c1" } }
    );

    showToast("Cours ajouté !");
    await loadEnrollments(); // 👈 affiche immédiatement
  };

  // ===== UI =====
  return (
    <div className="container-page py-10">
      <Toast message={toast.message} show={toast.show} />

      <h1 className="text-3xl font-bold text-white mb-10">
        Inscriptions
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
        {students.map((student) => {
          const studentEnrollments = enrollments.filter((e) => {
            const sid =
              typeof e.studentId === "string"
                ? e.studentId
                : e.studentId?._id;

            return String(sid) === String(student._id);
          });

          const enrolledCourseIds = studentEnrollments.map((e) => e.courseId._id);

          const availableCourses = courses.filter(
            (c) => !enrolledCourseIds.includes(c._id)
          );

          return (
            <div
              key={student._id}
              className="bg-slate-900/50 border border-white/5 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:border-indigo-500/30 transition"
            >
              {/* Student header */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-sm text-slate-400">{student.email}</p>
              </div>

              <div className="border-t border-white/10 my-4" />

              <h3 className="text-sm font-semibold text-slate-300 mb-2">
                Cours inscrits
              </h3>

              {/* DROPDOWN COURS INSCRITS */}
              <select
                id={`en-dropdown-${student._id}`}
                className="w-full bg-slate-800/50 border border-white/10 text-white p-2 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Cours inscrits…</option>

                {studentEnrollments.map((en) => (
                  <option key={en._id} value={en._id}>
                    {en.courseId.code} — {en.courseId.title} (Session : {en.sessionId.name})
                  </option>
                ))}
              </select>

              {/* REMOVE BUTTON */}
              {studentEnrollments.length > 0 && (
                <button
                  onClick={() => {
                    const select = document.querySelector(
                      `#en-dropdown-${student._id}`
                    ) as HTMLSelectElement;

                    if (select?.value) removeEnrollment(select.value);
                  }}
                  className="mt-2 w-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 font-medium p-2 rounded-lg transition"
                >
                  Enlever le cours sélectionné
                </button>
              )}

              {/* Add panel */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-300">
                  Ajouter un cours
                </label>

                <select
                  className="mt-1 w-full bg-slate-800/50 border border-white/10 text-white p-2 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(e) => {
                    if (e.target.value)
                      addEnrollment(student._id, e.target.value);
                  }}
                >
                  <option value="">Sélectionner un cours…</option>

                  {availableCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
