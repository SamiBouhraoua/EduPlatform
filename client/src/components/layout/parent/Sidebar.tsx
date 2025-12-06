"use client";
import Link from "next/link";
import { LayoutGrid, GraduationCap, MessageCircle } from "lucide-react";

const Item = ({ href, label, Icon }: any) => (
  <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
    <Icon size={18} className="text-pink-600" />
    <span>{label}</span>
  </Link>
);

export default function SidebarParent() {
  return (
    <aside className="w-56 border-r bg-white h-full">
      <div className="p-4 border-b">
        <div className="text-sm text-gray-500">Espace</div>
        <div className="font-semibold text-gray-800">Parent</div>
      </div>

      <nav className="py-2">
        <Item href="/parent" label="Aperçu" Icon={LayoutGrid} />
        <Item href="/parent/bulletin" label="Bulletin" Icon={GraduationCap} />
        <Item href="/parent/chat" label="Messagerie" Icon={MessageCircle} />
      </nav>
    </aside>
  );
}
