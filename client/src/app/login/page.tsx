"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [college, setCollege] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "error" | "success" | "" }>({ text: "", type: "" });

  useEffect(() => {
    const collegeId = localStorage.getItem("collegeId");
    const collegeName = localStorage.getItem("collegeName");
    setCollege(collegeName ?? collegeId);
  }, []);

  useEffect(() => {
    if (msg.text) {
      const timer = setTimeout(() => setMsg({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    setLoading(true);

    try {
      const collegeId = localStorage.getItem("collegeId");
      const { data } = await api.post("/auth/login", { email, password, collegeId });

      setMsg({
        text: data.message,
        type: data.success ? "success" : "error",
      });

      if (data.success) {
        // Stockage sécurisé
        localStorage.setItem("token", data.token);

        localStorage.setItem(
          "user",
          JSON.stringify({
            _id: data._id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            collegeId: data.collegeId || localStorage.getItem("collegeId"),
          })
        );


        // Redirection
        setTimeout(() => {
          switch (data.role) {
            case "student":
              window.location.href = "/student";
              break;
            case "teacher":
              window.location.href = "/teacher";
              break;
            case "parent":
              window.location.href = "/parent";
              break;
            default:
              window.location.href = "/admin";
          }
        }, 800);
      }

    } catch (e: any) {
      const message = e?.response?.data?.message || "Erreur réseau.";
      setMsg({ text: message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative"
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <form
        onSubmit={submit}
        className="relative z-10 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl 
        p-10 w-full max-w-lg border border-white/10 animate-fade-in"
      >
        <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Connexion
          {college && <span className="text-indigo-400"> — {college}</span>}
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Entrez vos identifiants pour accéder à votre espace.
        </p>

        {msg.text && (
          <div
            className={`flex items-center gap-2 mb-6 rounded-xl border px-4 py-3 text-sm shadow-sm ${msg.type === "error"
              ? "border-red-500/20 bg-red-500/10 text-red-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              }`}
          >
            <span>{msg.text}</span>
          </div>
        )}

        <div className="mb-5">
          <label className="text-sm text-slate-400 font-medium">Email</label>
          <input
            className="bg-slate-800/50 border border-white/10 focus:border-indigo-500 focus:ring-2 
            focus:ring-indigo-500/20 transition rounded-xl w-full p-3 mt-1 text-white placeholder:text-slate-500"
            type="email"
            placeholder="votre@email.ca"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <label className="text-sm text-slate-400 font-medium">Mot de passe</label>
          <input
            className="bg-slate-800/50 border border-white/10 focus:border-indigo-500 focus:ring-2 
            focus:ring-indigo-500/20 transition rounded-xl w-full p-3 mt-1 text-white placeholder:text-slate-500"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white text-lg 
          flex items-center justify-center gap-2 shadow-lg transition
          ${loading
              ? "bg-indigo-400 cursor-not-allowed opacity-70"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            }`}
        >
          <LogIn size={20} />
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
