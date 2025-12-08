"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
    GraduationCap,
    ChevronRight,
    Users,
    BookOpen,
    Activity,
    Calendar,
    Mail,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function ParentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [childrenData, setChildrenData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const collegeId = typeof window !== "undefined" ? localStorage.getItem("collegeId") : "";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    useEffect(() => {
        const u = auth.user();
        if (u) {
            setUser(u);
            loadChildrenData(u);
        }
    }, []);

    async function loadChildrenData(currentUser: any) {
        try {
            // 1. Get Parent's Children (via User List for now)
            const res = await api.get(`/users?collegeId=${currentUser.collegeId}`);
            const me = res.data.find((x: any) => x._id === currentUser.id || x._id === currentUser._id);

            if (me && me.children && me.children.length > 0) {

                // 2. Fetch extra stats for each child (e.g. course count)
                const enrichedChildren = await Promise.all(me.children.map(async (child: any) => {
                    try {
                        const enrollRes = await api.get(
                            `/academic/enrollments?collegeId=${collegeId}&studentId=${child._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        return {
                            ...child,
                            courseCount: enrollRes.data.length
                        };
                    } catch (e) {
                        return { ...child, courseCount: 0 };
                    }
                }));

                setChildrenData(enrichedChildren);
            } else {
                setChildrenData([]);
            }
        } catch (err) {
            console.error("Failed to load children", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto">

            {/* HEADER SECTION */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-white/10 p-10 shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Users size={200} className="text-white" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-white mb-3">
                        Bonjour, <span className="pt-1 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{user?.firstName}</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl">
                        Bienvenue dans votre espace parent. Suivez les progrès académiques de vos enfants, consultez leurs bulletins et restez informé de leur parcours scolaire.
                    </p>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Enfants Suivis</p>
                            <p className="text-3xl font-bold text-white">{childrenData.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Total Cours Actifs</p>
                            <p className="text-3xl font-bold text-white">
                                {childrenData.reduce((acc, c) => acc + (c.courseCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Période Actuelle</p>
                            <p className="text-xl font-bold text-white">Automne 2025</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHILDREN LIST */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <GraduationCap className="text-orange-400" />
                    Mes Enfants
                </h2>

                {childrenData.length === 0 ? (
                    <div className="bg-slate-900/50 border border-white/10 p-12 rounded-3xl text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Users size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Aucun enfant associé</h3>
                        <p className="text-slate-400">
                            Contactez l'administration de l'établissement pour lier les comptes étudiants à votre profil parent.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {childrenData.map((child: any) => (
                            <div
                                key={child._id}
                                className="group relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-1 overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-orange-500/10"
                            >
                                {/* Decorative Gradient Background */}
                                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-900 opacity-50" />

                                <div className="relative p-6 pt-0 flex flex-col h-full">

                                    {/* Avatar & Header */}
                                    <div className="flex items-end justify-between mt-6 mb-6">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-0.5 shadow-lg shadow-orange-500/20 transform translate-y-2 group-hover:-translate-y-1 transition-transform duration-300">
                                            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                                                <span className="text-3xl font-black bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent">
                                                    {child.firstName[0]}{child.lastName[0]}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wide">
                                            Inscrit
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                                            {child.firstName} {child.lastName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                                            <Mail size={14} /> {child.email}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                <p className="text-xs text-slate-500 mb-1">Cours suivis</p>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={16} className="text-indigo-400" />
                                                    <span className="text-lg font-bold text-white">{child.courseCount}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                <p className="text-xs text-slate-500 mb-1">Action requise</p>
                                                <div className="flex items-center gap-2">
                                                    <Activity size={16} className="text-emerald-400" />
                                                    <span className="text-lg font-bold text-white">Aucune</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Button */}
                                    <div className="mt-auto">
                                        <Link
                                            href={`/parent/bulletin/${child._id}`}
                                            className="
                           flex items-center justify-between w-full p-4 rounded-xl
                           bg-gradient-to-r from-slate-800 to-slate-800
                           hover:from-orange-600 hover:to-red-600
                           border border-white/10 hover:border-orange-500/20
                           text-white font-semibold transition-all group/btn
                        "
                                        >
                                            <span>Consulter le Bulletin</span>
                                            <div className="bg-white/10 p-2 rounded-lg group-hover/btn:bg-white/20 transition-colors">
                                                <ArrowUpRight size={18} />
                                            </div>
                                        </Link>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
