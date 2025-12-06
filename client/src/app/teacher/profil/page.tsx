"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { Lock, Mail, User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const u = auth.user();
    if (!u) router.push("/login");
    setUser(u);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function updatePassword() {
    if (!oldPassword || !newPassword) {
      return showToast("Tous les champs sont requis");
    }

    try {
      const res = await fetch("http://localhost:4000/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token()}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) return showToast(data.message);

      showToast("Mot de passe mis à jour !");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      showToast("Erreur serveur");
    }
  }

  if (!mounted || !user)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 text-lg animate-pulse">
          Chargement du profil…
        </div>
      </div>
    );

  const avatar = user.firstName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen py-16 px-6">
      {/* TOAST */}
      {toast && (
        <div className="
          fixed top-5 left-1/2 -translate-x-1/2 
          bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl shadow-xl 
          animate-fade-in z-[10000000]
        ">
          {toast}
        </div>
      )}

      <h1 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
        Mon Profil
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

        {/* LEFT CARD – PROFILE */}
        <div className="bg-slate-900/50 border border-white/5 p-10 rounded-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center text-center space-y-6">

            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {avatar}
            </div>

            <div>
              <p className="text-2xl font-semibold text-white flex items-center gap-2 justify-center">
                <User className="w-5 h-5 text-indigo-400" />
                {user.firstName} {user.lastName}
              </p>

              <p className="text-slate-400 flex items-center gap-2 justify-center mt-2">
                <Mail className="w-5 h-5 text-purple-400" />
                {user.email}
              </p>

              <p className="inline-block mt-4 px-4 py-1 text-sm rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT CARD – CHANGE PASSWORD */}
        <div className="bg-slate-900/50 border border-white/5 p-10 rounded-2xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
            <Lock className="text-purple-400" />
            Changer le mot de passe
          </h2>

          <div className="space-y-6">

            <div>
              <label className="block text-slate-400 font-medium mb-2 text-sm">Ancien mot de passe</label>
              <input
                type="password"
                placeholder="Ancien mot de passe"
                className="bg-slate-800/50 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition rounded-xl w-full p-3 text-white placeholder:text-slate-500"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-2 text-sm">Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                className="bg-slate-800/50 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition rounded-xl w-full p-3 text-white placeholder:text-slate-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button
              onClick={updatePassword}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition text-white font-semibold shadow-lg text-lg"
            >
              Mettre à jour
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
