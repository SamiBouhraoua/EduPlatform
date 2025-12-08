"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { User, Mail, School, Lock } from "lucide-react";

export default function ParentProfile() {
    const [user, setUser] = useState<any>(null);
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUser(auth.user());
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMsg({ type: "error", text: "Les nouveaux mots de passe ne correspondent pas." });
            return;
        }

        // Removed length check check as per user request

        setLoading(true);
        try {
            await api.put("/auth/change-password", {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            setMsg({ type: "success", text: "Mot de passe modifié avec succès !" });
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Erreur lors du changement de mot de passe.";
            setMsg({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Mon Profil</h1>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                {/* User Info Header */}
                <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                        {user.firstName[0]}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {user.firstName} {user.lastName}
                        </h2>
                        <div className="flex items-center gap-2 text-indigo-400 mt-1">
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded text-sm font-medium border border-orange-500/30">
                                Parent
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-500">Email</label>
                        <div className="flex items-center gap-3 text-slate-200 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                            <Mail size={18} className="text-slate-400" />
                            {user.email}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-500">Rôle</label>
                        <div className="flex items-center gap-3 text-slate-200 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                            <User size={18} className="text-slate-400" />
                            Parent d'élève
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="mt-8 bg-slate-900/30 border border-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                            <Lock className="text-indigo-400" size={20} />
                        </div>
                        Sécurité
                    </h3>

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Ancien mot de passe</label>
                            <input
                                type="password"
                                value={passwords.oldPassword}
                                onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Nouveau mot de passe</label>
                            <input
                                type="password"
                                value={passwords.newPassword}
                                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Confirmer le nouveau mot de passe</label>
                            <input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                required
                            />
                        </div>

                        {msg.text && (
                            <div className={`p-3 rounded-lg text-sm ${msg.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                {msg.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? "Modification..." : "Changer le mot de passe"}
                        </button>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 items-start">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <School size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-300 text-sm">Espace Parent</h4>
                        <p className="text-blue-200/70 text-sm mt-1">
                            Vous pouvez consulter les bulletins et l'avancement de vos enfants depuis le tableau de bord.
                            Pour toute modification de vos informations personnelles (hors mot de passe), veuillez contacter l'administration de l'établissement.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
