"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  User,
  School,
} from "lucide-react";

const Item = ({ href, label, Icon, isActive }: any) => (
  <Link
    href={href}
    className={`
      flex items-center gap-3 px-6 py-3 mx-3 mt-1
      rounded-xl transition-all duration-200
      ${isActive
        ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-white"
        : "hover:bg-white/5 text-slate-400 hover:text-white"
      }
    `}
  >
    <Icon size={20} className={isActive ? "text-orange-400" : ""} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function SidebarParent() {
  const pathname = usePathname();

  return (
    <aside
      className="
        fixed top-0 left-0 w-64 h-screen bg-slate-900/80 backdrop-blur-xl
        border-r border-white/10 pt-6 z-30
      "
    >
      {/* HEADER */}
      <div className="px-6 pb-4 border-b border-white/10 mb-4">
        <div className="text-sm text-slate-500">Espace</div>

        <div className="
          text-xl font-extrabold bg-clip-text text-transparent 
          bg-gradient-to-r from-orange-400 to-red-400
        ">
          Parent
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="mt-2 space-y-1">

        <Item href="/parent" label="Mes Enfants" Icon={LayoutGrid} isActive={pathname === "/parent"} />

        <Item href="/parent/profile" label="Profil" Icon={User} isActive={pathname === "/parent/profile"} />

      </nav>
    </aside>
  );
}
