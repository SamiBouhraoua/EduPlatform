"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { FileText, ClipboardList, MessageSquare } from "lucide-react";

export default function StudentCourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const collegeId = typeof window !== "undefined" ? localStorage.getItem("collegeId") : "";

  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const studentId = user?._id;

  useEffect(() => {
    if (!id) return;

    Promise.all([
      api.get(`/academic/courses/${id}`, {
        headers: { "x-college-id": collegeId, Authorization: `Bearer ${token}` },
      }),

      api.get(`/academic/documents/by-course/${id}`, {
        headers: { "x-college-id": collegeId, Authorization: `Bearer ${token}` },
      }),

      api.get(`/academic/grades/categories/by-course/${id}`, {
        headers: { "x-college-id": collegeId, Authorization: `Bearer ${token}` },
      }),

      api.get(`/academic/grades/items/by-course/${id}`, {
        headers: { "x-college-id": collegeId, Authorization: `Bearer ${token}` },
      }),

      api.get(`/academic/grades/${id}`, {
        headers: { "x-college-id": collegeId, Authorization: `Bearer ${token}` },
      }),

      api.get(`/academic/reports/${id}/${studentId}`, {
        headers: { "x-college-id": collegeId, Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([c, docs, cat, it, gr, rep]) => {
        setCourse(c.data);
        setDocuments(docs.data);
        setCategories(cat.data);
        setItems(it.data);
        setGrades(gr.data);
        setReports(rep.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!course)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 text-lg animate-pulse">Chargement…</div>
      </div>
    );

  function getStudentGrade(itemId: string) {
    return grades.find((g: any) => g.itemId?._id === itemId);
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="relative rounded-2xl p-10 overflow-hidden border border-white/10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-indigo-300 border border-indigo-500/20">
              {course.code}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            {course.title}
          </h1>

          <div className="space-y-1 text-slate-300">
            <p>Programme : {course.programId?.name}</p>
            <p>Session : {course.sessionId?.name}</p>
          </div>
        </div>
      </div>

      {/* NOTES */}
      <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
          <ClipboardList className="text-indigo-400" size={24} />
          Résultats et évaluations
        </h2>

        {categories.length === 0 ? (
          <p className="text-slate-500">Aucune évaluation disponible.</p>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat._id}>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                  {cat.name} ({cat.weight}%)
                </h3>

                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-400">
                      <tr>
                        <th className="p-3 font-medium">Évaluation</th>
                        <th className="p-3 font-medium">Points</th>
                        <th className="p-3 font-medium">Résultat</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items
                        .filter((it) => it.categoryId?._id === cat._id)
                        .map((it) => {
                          const grade = getStudentGrade(it._id);

                          return (
                            <tr key={it._id} className="border-t border-white/5 hover:bg-white/5 transition">
                              <td className="p-3 font-medium text-white">{it.title}</td>
                              <td className="p-3 text-slate-400">{it.maxPoints} pts</td>

                              <td className="p-3">
                                {grade ? (
                                  <span className="text-emerald-400 font-semibold">
                                    {grade.score}/{grade.maxPoints}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic">
                                    Pas encore noté
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DOCUMENTS */}
      <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
          <FileText className="text-purple-400" size={24} />
          Documents disponibles
        </h2>

        {documents.length === 0 ? (
          <p className="text-slate-500">Aucun document disponible.</p>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc, i) => (
              <li
                key={i}
                className="p-4 border border-white/10 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 flex justify-between items-center transition"
              >
                <span className="font-medium text-white">{doc.name}</span>

                <a
                  href={doc.url.replace("localhost", "127.0.0.1")}
                  target="_blank"
                  className="relative z-50 pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-500/20"
                >
                  Télécharger
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RAPPORTS DU PROFESSEUR */}
      <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
          <MessageSquare className="text-purple-400" /> Rapports du professeur
        </h2>

        {reports.length === 0 ? (
          <p className="text-slate-500">Aucun rapport disponible pour ce cours.</p>
        ) : (
          <ul className="space-y-4">

            {reports.map((r) => (
              <li
                key={r._id}
                className="p-5 bg-slate-800/30 border border-white/10 rounded-xl hover:bg-slate-800/50 transition flex items-start gap-4"
              >
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 p-3 rounded-xl">
                  <MessageSquare size={22} />
                </div>

                <div className="flex-1">
                  <p className="text-slate-300 leading-relaxed">{r.report}</p>
                  <p className="text-slate-500 text-sm mt-2">
                    {new Date(r.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </li>
            ))}

          </ul>
        )}
      </div>

    </div>
  );
}
