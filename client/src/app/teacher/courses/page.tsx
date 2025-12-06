"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BookOpen } from "lucide-react";

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const collegeId = typeof window !== "undefined" ? localStorage.getItem("collegeId") : "";

  useEffect(() => {
    if (!user?._id || !token) return;

    api
      .get(`/academic/courses/full`, {
        headers: {
          "x-college-id": collegeId,
          Authorization: `Bearer ${token}`,
        },
      })
      .then((r) => {
        const allCourses = r.data || [];

        // ⚡ Sélectionne seulement les cours du prof connecté
        const myCourses = allCourses.filter(
          (c: { teacherId: { _id: any; }; }) => String(c.teacherId?._id || c.teacherId) === String(user._id)
        );

        setCourses(myCourses);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 text-lg animate-pulse">
          Chargement…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Mes Cours
        </h1>
        <p className="text-slate-400">
          Gérez vos cours et vos étudiants.
        </p>
      </header>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/5">
          <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400 text-lg">Aucun cours pour le moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Link key={course._id} href={`/teacher/courses/${course._id}`}>
              <div className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={100} className="text-indigo-500" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-indigo-300 border border-indigo-500/20">
                      {course.code}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {course.title}
                  </h2>

                  <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Programme</span>
                      <span className="text-slate-300">{course.programId?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Session</span>
                      <span className="text-slate-300">{course.sessionId?.name ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
