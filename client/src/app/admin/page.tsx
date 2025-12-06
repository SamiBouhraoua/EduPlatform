"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data.stats))
      .catch(() => { });
  }, []);

  if (!stats)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 text-lg animate-pulse">Chargement...</div>
      </div>
    );

  return (
    <div className="space-y-10">

      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl h-52 flex items-center px-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            Bienvenue, {auth.user()?.firstName}
          </h1>

          <p className="text-indigo-200 text-lg">
            Votre espace {auth.user()?.role === "teacher" ? "Professeur" :
              auth.user()?.role === "student" ? "Étudiant" :
                "Administrateur"}.
          </p>
        </div>
      </div>

      {/* ----- STAT CARDS ----- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard
          icon={Users}
          label="Professeurs"
          value={stats.teachers}
          color="text-blue-400"
          bg="bg-blue-500/10 border-blue-500/20"
        />

        <StatCard
          icon={Users}
          label="Étudiants"
          value={stats.students}
          color="text-teal-400"
          bg="bg-teal-500/10 border-teal-500/20"
        />

        <StatCard
          icon={Users}
          label="Parents"
          value={stats.parents}
          color="text-orange-400"
          bg="bg-orange-500/10 border-orange-500/20"
        />
      </div>

      {/* ----- COURSES / PROGRAMS / SESSIONS ----- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard
          icon={BookOpen}
          label="Cours"
          value={stats.courses}
          color="text-purple-400"
          bg="bg-purple-500/10 border-purple-500/20"
        />

        <StatCard
          icon={GraduationCap}
          label="Programmes"
          value={stats.programs}
          color="text-cyan-400"
          bg="bg-cyan-500/10 border-cyan-500/20"
        />

        <StatCard
          icon={ArrowRight}
          label="Sessions"
          value={stats.sessions}
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
      </div>

      {/* ----- BLOG / NEWS ----- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Actualités du collège
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlogCard
            title="Nouvelle salle informatique prête"
            desc="40 nouveaux ordinateurs ont été installés."
            image="/images/blog1.jpg"
          />
          <BlogCard
            title="Conférence IA — vendredi 14h"
            desc="Discussion sur l'intelligence artificielle appliquée à l'éducation."
            image="/images/blog2.jpg"
          />
        </div>
      </div>

    </div>
  );
}

// COMPONENTS ----------------------

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className={`p-6 rounded-2xl border ${bg} flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10`}>
      <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function BlogCard({ title, desc, image }: any) {
  return (
    <div className="rounded-2xl overflow-hidden bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 transition-all">
      <Image src={image} alt={title} width={600} height={300} className="w-full h-40 object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-slate-400 mb-4">{desc}</p>

        <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition">
          Lire plus <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
