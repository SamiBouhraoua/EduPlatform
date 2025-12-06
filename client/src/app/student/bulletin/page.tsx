"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { downloadBulletinPDF } from "./utils/downloadBulletinPDF";

export default function StudentBulletin() {
  const [courses, setCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const collegeStr =
    typeof window !== "undefined" ? localStorage.getItem("college") : null;
  const college = collegeStr ? JSON.parse(collegeStr) : null;

  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const collegeId =
    typeof window !== "undefined" ? localStorage.getItem("collegeId") : "";

  useEffect(() => {
    if (!user?._id) return;

    async function loadBulletin() {
      try {
        /** ============================
         * 1) ENROLLMENTS = cours inscrits
         * ============================*/
        const enrollRes = await api.get(
          `/academic/enrollments?collegeId=${collegeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const myEnrollments = enrollRes.data.filter((e: any) => {
          const studentId =
            typeof e.studentId === "object" ? e.studentId._id : e.studentId;

          return String(studentId) === String(user._id);
        });

        const courseIds = myEnrollments.map((e: any) =>
          typeof e.courseId === "object" ? e.courseId._id : e.courseId
        );

        /** ============================
         * 2) FULL COURSES
         * ============================*/
        const coursesRes = await api.get(`/academic/courses/full`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-college-id": collegeId,
          },
        });

        const myCourses = coursesRes.data.filter((c: any) =>
          courseIds.includes(c._id)
        );
        setCourses(myCourses);

        /** ============================
         * 3) ALL GRADES
         * ============================*/
        const gradesRes = await api.get(`/academic/grades`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-college-id": collegeId,
          },
        });
        setGrades(gradesRes.data);

        /** ============================
         * 4) ALL GRADE ITEMS (par course)
         * ============================*/
        let allItems: any[] = [];

        for (const cid of courseIds) {
          const itemsRes = await api.get(
            `/academic/grades/items/by-course/${cid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "x-college-id": collegeId,
              },
            }
          );

          // ⚠️ Filtrer les items SANS categoryId (items fantômes)
          const validItems = itemsRes.data.filter(
            (i: any) => i.categoryId && i.categoryId._id
          );

          allItems = [...allItems, ...validItems];
        }

        setItems(allItems);
      } catch (err) {
        console.error("❌ BULLETIN LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBulletin();
  }, []);

  /** ===========================================
   *        CALCUL FINAL (version CORRIGÉE)
   * ============================================*/
  function computeFinalGrade(courseId: string) {
    const courseItems = items.filter(
      (i) =>
        String(i.courseId?._id || i.courseId) === String(courseId) &&
        i.categoryId &&
        i.categoryId._id
    );

    const courseGrades = grades.filter(
      (g) => String(g.courseId?._id || g.courseId) === String(courseId)
    );

    // DEBUG
    console.log("========================================");
    console.log("📘 ANALYSE COURS :", courseId);
    console.log("Items trouvés =", courseItems.length, courseItems);
    console.log("Grades trouvés =", courseGrades.length, courseGrades);

    // Aucun item = aucune note
    if (courseItems.length === 0) return null;

    // Vérifier que TOUS les items sont notés
    const missing = courseItems.filter(
      (it) =>
        !courseGrades.some(
          (g) =>
            String(g.itemId?._id || g.itemId) === String(it._id)
        )
    );

    if (missing.length > 0) {
      console.warn("⚠ PAS TOUS LES ITEMS NOTÉS :", missing);
      return null;
    }

    // Tous notés → calcul
    let earned = 0;
    let max = 0;

    for (const item of courseItems) {
      const grade = courseGrades.find(
        (g) =>
          String(g.itemId?._id || g.itemId) === String(item._id)
      );

      if (grade) {
        earned += grade.score;
        max += grade.maxPoints ?? item.maxPoints;
      }
    }

    if (max === 0) return null;

    return Math.round((earned / max) * 100);
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 text-lg animate-pulse">Chargement…</div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Bulletin Scolaire
        </h1>
        <p className="text-lg text-slate-400">
          {user.firstName} {user.lastName}
        </p>
      </header>

      <div className="flex justify-center">
        <button
          onClick={() =>
            downloadBulletinPDF({
              user,
              college,
              courses,
              computeFinalGrade,
            })
          }
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
        >
          📄 Télécharger mon bulletin
        </button>
      </div>

      <div className="space-y-6">
        {courses.map((course: any) => {
          const final = computeFinalGrade(course._id);

          return (
            <div
              key={course._id}
              className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm hover:border-indigo-500/30 transition-all"
            >
              <div className="flex justify-between items-start gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-indigo-300 border border-indigo-500/20">
                      {course.code}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4">
                    {course.title}
                  </h2>

                  <div className="space-y-1 text-sm">
                    <div className="flex gap-2">
                      <span className="text-slate-500">Programme:</span>
                      <span className="text-slate-300">{course.programId?.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-500">Session:</span>
                      <span className="text-slate-300">{course.sessionId?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-2 uppercase tracking-wider">Note finale</p>

                  {final === null ? (
                    <p className="text-slate-500 italic text-lg">
                      Non disponible
                    </p>
                  ) : (
                    <p
                      className={`text-5xl font-bold ${final >= 80 ? "text-emerald-400" :
                          final >= 60 ? "text-amber-400" : "text-red-400"
                        }`}
                    >
                      {final}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
