"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Users,
  FileText,
  User,
  Settings,
} from "lucide-react";

export default function SidebarTeacher({ className, onMobileClose }: any) {
  const pathname = usePathname();

  const Item = ({ href, label, Icon, isActive }: any) => (
    <Link
      href={href}
      onClick={onMobileClose}
      className={`flex items-center gap-3 px-6 py-3 
      transition rounded-xl mx-2 mt-1
      ${isActive
          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white"
          : "hover:bg-white/5 text-slate-400 hover:text-white"
        }`}
    >
      <Icon size={20} className={isActive ? "text-indigo-400" : ""} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <aside className={`
        fixed top-0 left-0 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-white/10 px-2 pt-6 z-50 transition-transform duration-300
        ${className || "w-64 hidden md:block"}
      `}>

      {/* HEADER */}
      <div className="px-6 pb-4 border-b border-white/10 mb-4 flex justify-between items-center">
        <div>
          <div className="text-sm text-slate-500">Espace</div>
          <div className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Professeur</div>
        </div>
        {/* Mobile Close Button */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="md:hidden text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav>
        <Item href="/teacher" label="Aperçu" Icon={LayoutGrid} isActive={pathname === "/teacher"} />
        <Item href="/teacher/profil" label="Profil" Icon={User} isActive={pathname === "/teacher/profil"} />
        <Item href="/teacher/courses" label="Mes cours" Icon={BookOpen} isActive={pathname?.startsWith("/teacher/courses")} />
      </nav>
    </aside>
  );
}
