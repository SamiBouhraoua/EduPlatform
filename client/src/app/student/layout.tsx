import SidebarStudent from "@/components/layout/student/Sidebar";
import NavbarTeacher from "@/components/layout/Navbar";

export default function StudentLayout({ children }: any) {
  return (
    <div
      className="flex min-h-screen bg-slate-950 text-white"
      style={{ ["--sidebar-width" as any]: "16rem" }}
    >
      <SidebarStudent />

      <div className="flex-1 relative" style={{ marginLeft: "var(--sidebar-width)" }}>
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <NavbarTeacher />
          <main id="page-content" className="px-10 pb-10 pt-24">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
