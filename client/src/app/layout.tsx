// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduPlatform - Gestion Scolaire Intelligente",
  description: "Plateforme de gestion scolaire moderne avec intelligence artificielle pour les établissements d'enseignement",
  keywords: "éducation, gestion scolaire, plateforme éducative, IA, enseignement",
  authors: [{ name: "EduPlatform Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#6366f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
