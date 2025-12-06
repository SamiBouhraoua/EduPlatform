// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GraduationCap, MapPin, Building2 } from "lucide-react";

type College = { _id: string; name: string; code: string; city?: string };

export default function Home() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/colleges")
      .then(r => setColleges(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  function selectCollege(c: College) {
    localStorage.setItem("collegeId", c._id);
    localStorage.setItem("collegeName", c.name);
    localStorage.setItem("college", JSON.stringify(c));
    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4 animate-fadeIn">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-6 shadow-2xl shadow-indigo-500/20">
            <GraduationCap size={40} className="text-white" />
          </div>

          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200">
              EduPlatform
            </span>
          </h1>

          <p className="text-xl text-slate-400 font-light">
            Plateforme de gestion scolaire intelligente
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Sélectionnez votre établissement
          </h2>
          <p className="text-slate-400 mb-6">
            Choisissez votre collège pour accéder à votre espace personnel.
          </p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-800/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-500">Aucun établissement disponible</p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {colleges.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => selectCollege(c)}
                    className="group w-full rounded-xl border border-white/10 bg-slate-800/30 p-5 text-left transition-all duration-300 hover:bg-slate-800/50 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition">
                          <Building2 size={24} className="text-indigo-400" />
                        </div>

                        <div>
                          <div className="font-semibold text-white text-lg mb-1 group-hover:text-indigo-300 transition">
                            {c.name}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            {c.city && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {c.city}
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs font-mono">
                              {c.code}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Plateforme sécurisée • Données chiffrées</p>
        </div>
      </div>
    </main>
  );
}
