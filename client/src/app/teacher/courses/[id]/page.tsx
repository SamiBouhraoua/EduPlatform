"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { FileText, ClipboardList, Users } from "lucide-react";

// Import modals
import DocumentsModal from "./modals/DocumentsModal";
import AddDocumentModal from "./modals/AddDocumentModal";
import CategoriesModal from "./modals/CategoriesModal";
import StudentGradesModal from "./modals/StudentGradesModal";
import StudentReportModal from "./modals/StudentReportModal";

export default function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Modals state
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState<any>(null);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const collegeId = typeof window !== "undefined" ? localStorage.getItem("collegeId") : "";

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  useEffect(() => {
    if (!id) return;

    Promise.all([
      api.get(`/academic/courses/${id}`, {
        headers: {
          "x-college-id": collegeId,
          Authorization: `Bearer ${token}`,
        },
      }),

      api.get(`/academic/enrollments/by-course/${id}`, {
        headers: {
          "x-college-id": collegeId,
          Authorization: `Bearer ${token}`,
        },
      }),

      api.get(`/academic/documents/by-course/${id}`, {
        headers: {
          "x-college-id": collegeId,
          Authorization: `Bearer ${token}`,
        },
      }),

      api.get(`/academic/grades/categories/by-course/${id}`, {
        headers: {
          "x-college-id": collegeId,
          Authorization: `Bearer ${token}`,
        },
      }),
    ])
      .then(([c, s, d, cat]) => {
        setCourse(c.data);
        setStudents(s.data);
        setDocuments(d.data);
        setCategories(cat.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!course)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 text-lg animate-pulse">Chargement du cours…</div>
      </div>
    );

  const courseId = Array.isArray(id) ? id[0] : id;

  return (
    <div className="space-y-8">

      {/* TOAST */}
      {toast.show && (
        <div
          className="
            fixed top-5 left-1/2 -translate-x-1/2 
            bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl shadow-xl 
            z-[10000000] animate-slideDown
          "
        >
          {toast.message}
        </div>
      )}

      {/* TITRE */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl p-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-indigo-300 border border-indigo-500/20">
              {course.code}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">
            {course.title}
          </h1>
          <p className="text-indigo-200">Gestion complète du cours</p>
        </div>
      </div>

      {/* INFOS DU COURS */}
      <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
          Informations du cours
        </h2>

        <div className="space-y-2 text-slate-300">
          <p><b className="text-white">Programme :</b> {course.programId?.name}</p>
          <p><b className="text-white">Session :</b> {course.sessionId?.name}</p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ÉTUDIANTS */}
        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <Users className="text-indigo-400" size={24} />
            Étudiants inscrits
          </h2>

          {students.length === 0 ? (
            <p className="text-slate-500">Aucun étudiant inscrit.</p>
          ) : (
            <ul className="space-y-3">
              {students.map((e: any, i: number) => (
                <li
                  key={i}
                  className="
                    p-5 bg-slate-800/30 rounded-xl flex justify-between 
                    items-center border border-white/10
                    hover:bg-slate-800/50 transition
                  "
                >
                  <span className="font-medium text-white">
                    {e.studentId?.firstName} {e.studentId?.lastName}
                  </span>

                  <div className="flex gap-4">
                    <button
                      className="text-blue-400 hover:text-blue-300 font-medium transition"
                      onClick={() => setShowNotesModal(e.studentId)}
                    >
                      Notes
                    </button>

                    <button
                      className="text-purple-400 hover:text-purple-300 font-medium transition"
                      onClick={() => setShowReportModal(e.studentId)}
                    >
                      Rapport
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DOCUMENTS + CATÉGORIES */}
        <div className="space-y-6">

          {/* DOCUMENTS */}
          <div
            className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all"
            onClick={() => setShowDocsModal(true)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="text-purple-400" size={24} />
                Documents du cours
              </h2>
              <span className="text-purple-400 font-semibold">
                {documents.length}
              </span>
            </div>
            <p className="text-slate-500 mt-2">Cliquez pour gérer les documents.</p>
          </div>

          {/* CATÉGORIES */}
          <div
            className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all"
            onClick={() => setShowCategoriesModal(true)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ClipboardList className="text-indigo-400" size={24} />
                Catégories d'évaluation
              </h2>
              <span className="text-indigo-400 font-semibold">
                {categories.length}
              </span>
            </div>
            <p className="text-slate-500 mt-2">Cliquez pour gérer les catégories et items.</p>
          </div>

        </div>
      </div>

      {/* MODALS */}
      {showDocsModal && (<DocumentsModal documents={documents} setShowDocsModal={setShowDocsModal} setShowAddDocumentModal={setShowAddDocumentModal} showToast={showToast} />)}
      {showAddDocumentModal && (<AddDocumentModal courseId={courseId} setShowAddDocumentModal={setShowAddDocumentModal} showToast={showToast} />)}
      {showCategoriesModal && (<CategoriesModal categories={categories} courseId={courseId} setShowCategoriesModal={setShowCategoriesModal} showToast={showToast} />)}
      {showNotesModal && (<StudentGradesModal student={showNotesModal} courseId={courseId} showToast={showToast} close={() => setShowNotesModal(null)} />)}
      {showReportModal && (<StudentReportModal student={showReportModal} courseId={courseId} showToast={showToast} close={() => setShowReportModal(null)} />)}

    </div>
  );
}
