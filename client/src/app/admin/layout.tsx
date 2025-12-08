"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import SidebarAdmin from "@/components/layout/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* Desktop Sidebar (hidden on mobile) */}
      <SidebarAdmin className="hidden md:block w-64" />

      {/* Mobile Sidebar (controlled by state) */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        {/* Sidebar */}
        <div className={`absolute top-0 left-0 h-full w-64 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarAdmin className="w-full h-full" onMobileClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative md:ml-64 transition-all duration-300">

        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="pt-24 px-5 md:px-10 pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
