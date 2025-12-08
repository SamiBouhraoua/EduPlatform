"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { LogOut, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
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
          fixed top-0 right-0 h-16 flex items-center justify-between
          bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 z-20
          left-0 md:left-64 transition-all duration-300
        "
      >
        <div className="flex items-center gap-4">
          {/* Placeholder Menu Button */}
          {onMenuClick && <div className="md:hidden w-6 h-6 bg-white/10 rounded"></div>}
          <div className="text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            EduPlatform
          </div>
        </div>

        {/* Placeholder identique pour SSR */}
        <div className="flex items-center gap-4 md:gap-6 text-sm">
          <div className="text-right hidden sm:block">
            <div className="font-semibold text-white">Utilisateur</div>
            <div className="text-xs text-slate-400">...</div>
          </div>

          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-500/20" />
          {/* Placeholder for Logout button */}
          <div className="p-2 md:px-4 md:py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 font-medium">
            <LogOut size={18} />
            <span className="hidden md:inline">Déconnexion</span>
          </div>
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
        fixed top-0 right-0 h-16 flex items-center justify-between
        bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 z-20
        left-0 md:left-64 transition-all duration-300
      "
    >
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        )}
        <div className="text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          EduPlatform
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 text-sm">
        {/* Nom + rôle (masqué sur très petits mobiles) */}
        <div className="text-right hidden sm:block">
          <div className="font-semibold text-white">{fullName}</div>
          <div className="text-xs text-slate-400">{user?.role}</div>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg text-sm md:text-base">
          {avatarLetter}
        </div>

        {/* Déconnexion */}
        <button
          className="p-2 md:px-4 md:py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 hover:bg-red-500/20 transition font-medium"
          onClick={logout}
          title="Déconnexion"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
