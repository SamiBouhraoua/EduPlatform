"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Empêche Hydration Error
  useEffect(() => {
    setMounted(true);
    setUser(auth.user());
  }, []);

  if (!mounted) {
    // Rend exactement la même chose côté serveur ET client
    return (
      <header
        className="
          fixed top-0 h-16 flex items-center justify-between
          bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-8 z-50
        "
        style={{
          left: "var(--sidebar-width)",
          width: "calc(100% - var(--sidebar-width))",
        }}
      >
        <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          EduPlatform
        </div>

        {/* Placeholder identique pour SSR */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="font-semibold text-white">Utilisateur</div>
            <div className="text-xs text-slate-400">...</div>
          </div>

          <div className="w-10 h-10 rounded-full bg-indigo-500/20" />
        </div>
      </header>
    );
  }

  const fullName = `${user?.firstName} ${user?.lastName}`;
  const avatarLetter = user?.firstName?.charAt(0)?.toUpperCase() ?? "?";

  function logout() {
    auth.clear();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    window.location.href = "/login";
  }

  return (
    <header
      className="
        fixed top-0 h-16 flex items-center justify-between
        bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-8 z-20
      "
      style={{
        left: "var(--sidebar-width)",
        width: "calc(100% - var(--sidebar-width))",
      }}
    >
      <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        EduPlatform
      </div>

      <div className="flex items-center gap-6 text-sm">
        {/* Nom + rôle */}
        <div className="text-right">
          <div className="font-semibold text-white">{fullName}</div>
          <div className="text-xs text-slate-400">{user?.role}</div>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg">
          {avatarLetter}
        </div>

        {/* Déconnexion */}
        <button
          className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 hover:bg-red-500/20 transition font-medium"
          onClick={logout}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </header>
  );
}
