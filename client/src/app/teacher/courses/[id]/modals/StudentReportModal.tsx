"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function StudentReportModal({ student, courseId, showToast, close }: any) {
    const [reports, setReports] = useState<any[]>([]);
    const [reportText, setReportText] = useState("");
    const [loading, setLoading] = useState(false);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const collegeId =
        typeof window !== "undefined" ? localStorage.getItem("collegeId") : "";

    const userStr =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const teacherId = user?._id;

    useEffect(() => {
        loadReports();
    }, []);

    async function loadReports() {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/academic/reports/${courseId}/${student._id}`,
                {
                    headers: {
                        "x-college-id": collegeId!,
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            setReports(data);

        } catch {
            showToast("Erreur chargement des rapports");
        }
    }

    async function submitReport() {
        if (!reportText || reportText.length < 5)
            return showToast("Écrivez un rapport plus détaillé.");

        if (!teacherId)
            return showToast("Erreur: teacherId introuvable.");

        setLoading(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academic/reports`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-college-id": collegeId!,
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                courseId,
                studentId: student._id,
                teacherId,
                report: reportText,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setLoading(false);
            return showToast(data.error || "Erreur serveur");
        }

        setReportText("");
        showToast("Rapport ajouté !");
        await loadReports();
        setLoading(false);
    }

    async function deleteReport(reportId: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academic/reports/${reportId}`, {
                method: "DELETE",
                headers: {
                    "x-college-id": collegeId!,
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                return showToast(data.error || "Erreur suppression");
            }

            showToast("Rapport supprimé !");
            await loadReports();

        } catch (err) {
            showToast("Erreur réseau");
        }
    }

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999999]" onClick={close}>
            <div className="bg-slate-900 border border-white/10 w-[750px] p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-semibold text-white">
                        Rapport – {student.firstName} {student.lastName}
                    </h2>
                    <button onClick={close} className="text-slate-400 hover:text-white text-2xl">✕</button>
                </div>

                {/* FORMULAIRE DE RAPPORT */}
                <div className="mb-6">
                    <textarea
                        className="w-full bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 p-4 rounded-xl h-32 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="Écrire un rapport sur l'étudiant..."
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                    ></textarea>

                    <button
                        onClick={submitReport}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg mt-3 w-full transition"
                    >
                        {loading ? "Enregistrement..." : "Ajouter le rapport"}
                    </button>
                </div>

                {/* HISTORIQUE DES RAPPORTS */}
                <h3 className="text-xl font-semibold mb-3 text-white">Historique des rapports</h3>

                {reports.length === 0 ? (
                    <p className="text-slate-500">Aucun rapport pour cet étudiant.</p>
                ) : (
                    <ul className="space-y-4">
                        {reports.map((r) => (
                            <li key={r._id} className="p-4 bg-slate-800/50 border border-white/10 rounded-xl flex justify-between items-start">

                                {/* TEXTE DU RAPPORT */}
                                <div>
                                    <p className="text-white">{r.report}</p>
                                    <div className="text-sm text-slate-500 mt-2">
                                        {new Date(r.createdAt).toLocaleString("fr-FR")}
                                    </div>
                                </div>

                                {/* BOUTON SUPPRIMER */}
                                <button
                                    className="text-red-400 hover:text-red-300 ml-4 transition"
                                    onClick={() => deleteReport(r._id)}
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>,
        document.body
    );
}
