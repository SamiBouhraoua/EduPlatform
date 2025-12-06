"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FolderKanban,
  BookOpen,
  Users,
  Settings,
} from "lucide-react";

const Item = ({ href, label, Icon, isActive }: any) => (
  <Link
    href={href}
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

export default function SidebarAdmin() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-white/10 px-2 pt-6 z-30">
      <div className="px-6 pb-4 border-b border-white/10 mb-4">
        <div className="text-sm text-slate-500">Espace</div>
        <div className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Admin</div>
      </div>

      <nav>
        <Item href="/admin" label="Aperçu" Icon={LayoutGrid} isActive={pathname === "/admin"} />
        <Item href="/admin/programs" label="Programmes" Icon={FolderKanban} isActive={pathname?.startsWith("/admin/programs")} />
        <Item href="/admin/sessions" label="Sessions" Icon={LayoutGrid} isActive={pathname?.startsWith("/admin/sessions")} />
        <Item href="/admin/courses" label="Cours" Icon={BookOpen} isActive={pathname?.startsWith("/admin/courses")} />
        <Item href="/admin/users" label="Utilisateurs" Icon={Users} isActive={pathname?.startsWith("/admin/users")} />
        <Item href="/admin/Inscriptions" label="Inscriptions" Icon={Users} isActive={pathname?.startsWith("/admin/Inscriptions")} />
      </nav>
    </aside>
  );
}
