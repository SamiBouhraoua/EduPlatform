"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  User,
  GraduationCap,
  Bot,
} from "lucide-react";

export default function SidebarStudent({ className, onMobileClose }: any) {
  const pathname = usePathname();

  const Item = ({ href, label, Icon, isActive }: any) => (
    <Link
      href={href}
      onClick={onMobileClose}
      className={`
        flex items-center gap-3 px-6 py-3 mx-3 mt-1
        rounded-xl transition-all duration-200
        ${isActive
          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white"
          : "hover:bg-white/5 text-slate-400 hover:text-white"
        }
      `}
    >
      <Icon size={20} className={isActive ? "text-indigo-400" : ""} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-slate-900/95 backdrop-blur-xl
        border-r border-white/10 pt-6 z-50 transition-transform duration-300
        ${className || "w-64 hidden md:block"} 
      `}
    >
      {/* HEADER */}
      <div className="px-6 pb-4 border-b border-white/10 mb-4 flex justify-between items-center">
        <div>
          <div className="text-sm text-slate-500">Espace</div>
          <div className="
              text-xl font-extrabold bg-clip-text text-transparent 
              bg-gradient-to-r from-indigo-400 to-purple-400
            ">
            Étudiant
          </div>
        </div>
        {/* Mobile Close Button */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="md:hidden text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="mt-2 space-y-1">

        <Item href="/student" label="Aperçu" Icon={LayoutGrid} isActive={pathname === "/student"} />

        <Item href="/student/profile" label="Profil" Icon={User} isActive={pathname === "/student/profile"} />

        <Item href="/student/courses" label="Mes cours" Icon={BookOpen} isActive={pathname?.startsWith("/student/courses")} />

        <Item href="/student/bulletin" label="Bulletins" Icon={GraduationCap} isActive={pathname === "/student/bulletin"} />

        <Item href="/student/IA" label="IA Assistée" Icon={Bot} isActive={pathname?.startsWith("/student/IA")} />

      </nav>
    </aside>
  );
}
