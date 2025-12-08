// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  GraduationCap,
  MapPin,
  Building2,
  Brain,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

type College = { _id: string; name: string; code: string; city?: string };

export default function Home() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/colleges")
      .then(r => setColleges(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  function selectCollege(c: College) {
    localStorage.setItem("collegeId", c._id);
    localStorage.setItem("collegeName", c.name);
    localStorage.setItem("college", JSON.stringify(c));
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">

      {/* 🔮 Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] opacity-20" />
      </div>

      {/* 🏷️ Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">EduPlatform</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Fonctionnalités</a>
            <a href="#testimonials" className="hover:text-white transition">Témoignages</a>
            <button onClick={() => document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2.5 bg-white text-slate-950 rounded-full hover:bg-slate-200 transition font-semibold">
              Espace Connexion
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* 🚀 Hero Section */}
        <section className="pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

            {/* Text Content */}
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Nouvelle Version Disponible
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                L'école de demain, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  dès aujourd'hui.
                </span>
              </h1>

              <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                Connectez étudiants, parents et professeurs sur une plateforme unifiée, intelligente et sécurisée.
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                  Commencer
                  <ArrowRight size={20} />
                </button>
                <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-2xl font-semibold text-lg transition text-slate-300">
                  Voir la démo
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>RGPD Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>

            {/* Login / Selector Card */}
            <div id="login" className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Accès Portail</h3>
                  <p className="text-slate-400 text-sm">Sélectionnez votre établissement pour vous connecter</p>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : colleges.length === 0 ? (
                  <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <Building2 className="mx-auto text-slate-600 mb-2" />
                    <p className="text-slate-500 text-sm">Aucun établissement</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {colleges.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => selectCollege(c)}
                        className="w-full text-left group/btn p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-slate-950/50 text-indigo-400 group-hover/btn:bg-white/20 group-hover/btn:text-white transition">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover/btn:text-white transition">{c.name}</div>
                            <div className="text-xs text-slate-500 group-hover/btn:text-indigo-200 flex items-center gap-1">
                              {c.city && <><MapPin size={10} /> {c.city}</>}
                              <span className="opacity-50 mx-1">•</span>
                              <span className="font-mono">{c.code}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-indigo-500 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 group-hover/btn:text-white transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ✨ Features Grid */}
        <section id="features" className="py-24 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Une suite complète d'outils</h2>
              <p className="text-slate-400 text-lg">Tout ce dont vous avez besoin pour gérer votre établissement, intégré dans une interface unique.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Brain className="text-purple-400" size={32} />,
                  title: "IA Pédagogique",
                  desc: "Des assistants virtuels pour aider les élèves dans leurs devoirs et révisions, 24/7."
                },
                {
                  icon: <ShieldCheck className="text-emerald-400" size={32} />,
                  title: "Données Sécurisées",
                  desc: "Vos données sont chiffrées de bout en bout et hébergées sur des serveurs certifiés."
                },
                {
                  icon: <Users className="text-blue-400" size={32} />,
                  title: "Espace Parents",
                  desc: "Suivez la progression de vos enfants en temps réel et communiquez avec les professeurs."
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-950 border border-white/5 hover:border-white/10 transition hover:-translate-y-1">
                  <div className="mb-6 w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🗣️ Testimonials */}
        <section id="testimonials" className="py-24 bg-slate-950 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Ils nous font confiance</h2>
              <p className="text-slate-400 text-lg">Découvrez pourquoi plus de 50 établissements ont choisi EduPlatform.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "EduPlatform a révolutionné notre gestion administrative. Tout est fluide, intuitif et ultra-rapide.",
                  author: "Marie L.",
                  role: "Directrice de Collège"
                },
                {
                  quote: "J'adore pouvoir suivre mes notes et mes devoirs directement sur mon téléphone. L'IA m'aide beaucoup !",
                  author: "Thomas B.",
                  role: "Élève de 3ème"
                },
                {
                  quote: "Enfin un outil qui simplifie la relation avec les parents. Je gagne un temps précieux chaque semaine.",
                  author: "Jean-Pierre C.",
                  role: "Professeur de Maths"
                }
              ].map((t, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur border border-white/5 hover:bg-slate-900 transition hover:border-indigo-500/30 group">
                  <div className="mb-6 text-indigo-500">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="opacity-50 group-hover:opacity-100 transition">
                      <path d="M14.017 21L14.017 18C14.017 16.054 13.521 15.08 12.527 15.08C12.378 15.08 12.22 15.111 12.054 15.174L11.516 15.385C11.135 15.534 10.745 15.611 10.347 15.611C9.65 15.611 9.062 15.42 8.58 15.04C8.1 14.659 7.828 14.12 7.828 13.433C7.828 12.637 8.169 11.965 8.847 11.417C9.525 10.869 10.329 10.595 11.261 10.595C12.09 10.595 12.877 10.793 13.621 11.191L14.881 11.854L16.273 6.946C15.361 6.315 14.349 6 13.238 6C11.546 6 10.038 6.556 8.714 7.667C7.39 8.779 6.728 10.237 6.728 12.043C6.728 14.547 7.507 16.669 9.066 18.411C10.625 20.152 12.563 21.011 14.881 20.988V21H14.017ZM19.881 21L19.881 18C19.881 16.054 19.385 15.08 18.391 15.08C18.242 15.08 18.084 15.111 17.918 15.174L17.38 15.385C17 15.534 16.609 15.611 16.211 15.611C15.514 15.611 14.926 15.42 14.444 15.04C13.962 14.659 13.692 14.12 13.692 13.433C13.692 12.637 14.031 11.965 14.71 11.417C15.389 10.869 16.193 10.595 17.125 10.595C17.954 10.595 18.741 10.793 19.485 11.191L20.745 11.854L22.137 6.946C21.225 6.315 20.213 6 19.102 6C17.41 6 15.902 6.556 14.578 7.667C13.254 8.779 12.592 10.237 12.592 12.043C12.592 14.547 13.371 16.669 14.93 18.411C16.489 20.152 18.427 21.011 20.745 20.988V21H19.881Z" />
                    </svg>
                  </div>
                  <p className="text-lg text-slate-300 mb-6 italic leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{t.author}</div>
                      <div className="text-sm text-indigo-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🦶 Footer */}
        <footer className="py-12 border-t border-white/5 bg-slate-950 text-slate-500 text-sm">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={20} className="text-indigo-500" />
                <span className="font-bold text-white text-lg">EduPlatform</span>
              </div>
              <p className="max-w-xs">
                La plateforme de référence pour l'éducation numérique de nouvelle génération.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Tarifs</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition">Mentions légales</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center">
            &copy; {new Date().getFullYear()} EduPlatform. Tous droits réservés.
          </div>
        </footer>
      </main>
    </div>
  );
}
