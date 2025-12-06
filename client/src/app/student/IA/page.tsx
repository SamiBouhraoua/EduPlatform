"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Brain, BookOpen } from "lucide-react";
import { RiskBadge } from "./components/RiskBadge";
import { CourseModal } from "./components/CourseModal";
import { getGradeColor, getProgressColor } from "./utils";

export default function IADashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [filter, setFilter] = useState("all"); // all, high, medium, low

  const user = auth.user();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const res = await api.post("/ia/analyze/student", {
        studentId: user.id || user._id,
        collegeId: user.collegeId
      });

      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Error fetching IA data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = data?.courses?.filter((c: any) => {
    if (filter === "all") return true;
    return c.analysis?.risk === filter;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Analyse de votre parcours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-950 border border-white/10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Brain className="text-indigo-400" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">Assistant Pédagogique IA</h1>
          </div>
          <p className="text-slate-300 max-w-2xl text-lg">
            Analyse en temps réel de vos performances et recommandations personnalisées pour réussir votre année.
          </p>
        </div>
      </div>



      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-indigo-400" size={20} />
          Vos Cours Analysés
        </h2>

        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-white/5">
          {["all", "élevé", "moyen", "faible"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {f === "all" ? "Tous" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((item: any, idx: number) => (
          <div
            key={idx}
            onClick={() => setSelectedCourse({
              ...item.course,
              grades: item.grades,
              items: item.items,
              ia: item.analysis,
              stats: item.stats,
              documentsCount: item.documents.length,
              reportsCount: item.reports.length
            })}
            className="group bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 cursor-pointer transition-all hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-indigo-300 border border-white/5">
                {item.course.code}
              </span>
              <RiskBadge risk={item.analysis.risk} />
            </div>

            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
              {item.course.title}
            </h3>

            <p className="text-slate-400 text-sm line-clamp-2 mb-6 h-10">
              {item.analysis.shortSummary}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Moyenne</span>
                <span className={`text-xl font-bold ${item.stats.average !== null ? getGradeColor(item.stats.average) : 'text-slate-500'}`}>
                  {item.stats.average !== null ? `${item.stats.average}%` : 'N/A'}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">Complétion</span>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getProgressColor(item.stats.completion)}`}
                    style={{ width: `${item.stats.completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-slate-400">Aucun cours ne correspond aux critères.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
