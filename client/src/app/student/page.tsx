"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BookOpen, FileText, User, TrendingUp, Award, ArrowRight, Brain, BarChart3 } from "lucide-react";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default function StudentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/stats")
      .then((res) => {
        setStats(res.data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 text-lg animate-pulse">Chargement de votre espace...</div>
      </div>
    );

  const user = auth.user();

  return (
    <div className="space-y-8">

      {/* ===== HERO SECTION ===== */}
      <div className="relative rounded-2xl p-10 overflow-hidden border border-white/10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">
                Bienvenue, {user?.firstName} 👋
              </h1>
              <p className="text-lg text-indigo-200">
                Portail Étudiant • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-sm font-medium">Actif</span>
            </div>
          </div>

          <p className="max-w-2xl text-slate-300 leading-relaxed">
            Suivez vos cours, consultez vos notes et accédez à vos ressources pédagogiques en un seul endroit.
          </p>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          label="Cours actifs"
          value={stats.courses}
          color="text-blue-400"
          bg="bg-blue-500/10 border-blue-500/20"
          trend="+2 ce semestre"
        />

        <StatCard
          icon={User}
          label="Professeurs"
          value={stats.teachers}
          color="text-teal-400"
          bg="bg-teal-500/10 border-teal-500/20"
          trend="Enseignants"
        />

        <StatCard
          icon={FileText}
          label="Documents"
          value={stats.documents}
          color="text-purple-400"
          bg="bg-purple-500/10 border-purple-500/20"
          trend="Ressources"
        />
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-purple-400" size={24} />
            Actions rapides
          </h2>

          <div className="space-y-3">
            <QuickActionButton
              href="/student/bulletin"
              icon={BarChart3}
              label="Consulter mon bulletin"
              color="text-blue-400 bg-blue-500/10 border-blue-500/20"
            />

            <QuickActionButton
              href="/student/courses"
              icon={BookOpen}
              label="Mes cours"
              color="text-purple-400 bg-purple-500/10 border-purple-500/20"
            />

            <QuickActionButton
              href="/student/IA"
              icon={Brain}
              label="Assistant IA"
              color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            />

            <QuickActionButton
              href="/student/profile"
              icon={User}
              label="Mon profil"
              color="text-teal-400 bg-teal-500/10 border-teal-500/20"
            />
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 flex items-center">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Award size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Citation du jour</p>
              <p className="text-white font-medium italic leading-relaxed">
                "L'éducation est l'arme la plus puissante pour changer le monde."
              </p>
              <p className="text-xs text-slate-500 mt-2">— Nelson Mandela</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== INFO SECTION ===== */}
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-8 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
          Informations académiques
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Progression</h3>
            <p className="text-slate-300 leading-relaxed">
              Vous êtes inscrit à <strong className="text-white">{stats.courses}</strong> cours actifs
              avec <strong className="text-white">{stats.teachers}</strong> professeurs qualifiés.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Ressources</h3>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">{stats.documents}</strong> documents pédagogiques
              sont disponibles dans vos cours pour vous accompagner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================== Stat Card Component =================== */
function StatCard({ icon: Icon, label, value, color, bg, trend }: any) {
  return (
    <div
      className={`
        p-6 rounded-2xl border ${bg}
        transition-all duration-300
        hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800/50 rounded-full">
            {trend}
          </span>
        )}
      </div>

      <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

/* =================== Quick Action Button =================== */
function QuickActionButton({ href, icon: Icon, label, color }: any) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 p-3 border rounded-xl ${color} hover:scale-[1.02] transition-all`}
    >
      <Icon size={20} />
      <span className="font-medium flex-1">{label}</span>
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
