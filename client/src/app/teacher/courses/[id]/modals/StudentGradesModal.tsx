"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function StudentGradesModal({ student, courseId, showToast, close }: any) {
    const [categories, setCategories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [score, setScore] = useState<number | null>(null);
    const [maxPoints, setMaxPoints] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Charger catégories + items + notes
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [catRes, itemRes, gradeRes] = await Promise.all([
                fetch(`http://localhost:4002/academic/grades/categories/by-course/${courseId}`, {
                    headers: {
                        "x-college-id": localStorage.getItem("collegeId")!,
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }),
                fetch(`http://localhost:4002/academic/grades/items/by-course/${courseId}`, {
                    headers: {
                        "x-college-id": localStorage.getItem("collegeId")!,
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }),
                fetch(`http://localhost:4002/academic/grades/${courseId}`, {
                    headers: {
                        "x-college-id": localStorage.getItem("collegeId")!,
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }),
            ]);

            setCategories(await catRes.json());
            setItems(await itemRes.json());
            setGrades(await gradeRes.json());

        } catch {
            showToast("Erreur chargement des notes");
        }
    }

    // Envoyer note
    async function saveGrade() {
        if (!selectedItem || score === null || maxPoints === null)
            return showToast("Entrez une note complète.");

        setLoading(true);

        const res = await fetch(`http://localhost:4002/academic/grades`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-college-id": localStorage.getItem("collegeId")!,
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                studentId: student._id,
                itemId: selectedItem._id,
                score,
                maxPoints,
                courseId,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setLoading(false);
            return showToast(data.message || "Erreur serveur");
        }

        showToast("Note enregistrée !");
        await loadData();
        setScore(null);
        setMaxPoints(null);
        setSelectedItem(null);
        setLoading(false);
    }

    function getStudentGrade(itemId: string) {
        return grades.find((g) => g.itemId?._id === itemId && g.studentId?._id === student._id);
    }

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999999]" onClick={close}>
            <div className="bg-slate-900 border border-white/10 w-[750px] p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-semibold text-white">
                        Notes – {student.firstName} {student.lastName}
                    </h2>
                    <button onClick={close} className="text-slate-400 hover:text-white text-2xl">✕</button>
                </div>

                {/* LISTE ITEMS PAR CATÉGORIE */}
                {categories.map((cat) => (
                    <div key={cat._id} className="mb-6">
                        <h3 className="font-semibold text-lg mb-2 text-white">
                            {cat.name} ({cat.weight}%)
                        </h3>

                        <ul className="space-y-3">
                            {items
                                .filter((it) => it.categoryId?._id === cat._id)
                                .map((it) => {
                                    const grade = getStudentGrade(it._id);
                                    return (
                                        <li
                                            key={it._id}
                                            className="p-4 bg-slate-800/50 border border-white/10 rounded-xl flex justify-between items-center"
                                        >
                                            <span className="text-white">
                                                <strong>{it.title}</strong> – {it.maxPoints} pts
                                                <br />
                                                {grade ? (
                                                    <span className="text-emerald-400">
                                                        Note: {grade.score}/{grade.maxPoints}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">Pas encore noté</span>
                                                )}
                                            </span>

                                            <button
                                                className="text-blue-400 hover:text-blue-300 transition"
                                                onClick={() => {
                                                    setSelectedItem(it);
                                                    setMaxPoints(it.maxPoints);
                                                    setScore(grade?.score || 0);
                                                }}
                                            >
                                                {grade ? "Modifier" : "Entrer note"}
                                            </button>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                ))}

                {/* FORMULAIRE NOTE */}
                {selectedItem && (
                    <div className="mt-6 p-4 border border-purple-500/20 rounded-xl bg-purple-500/10">
                        <h3 className="font-semibold text-lg mb-3 text-white">
                            {selectedItem.title} – {selectedItem.maxPoints} pts
                        </h3>

                        <div className="flex gap-4">
                            <input
                                type="number"
                                className="bg-slate-800/50 border border-white/10 text-white p-2 rounded w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Note"
                                value={score ?? ""}
                                min={0}
                                max={maxPoints ?? 500}
                                onChange={(e) => setScore(Number(e.target.value))}
                            />

                            <input
                                type="number"
                                className="bg-slate-800/30 border border-white/10 text-slate-500 p-2 rounded w-full cursor-not-allowed"
                                value={maxPoints ?? ""}
                                disabled
                            />
                        </div>

                        <button
                            onClick={saveGrade}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg w-full mt-4 transition"
                        >
                            {loading ? "..." : "Enregistrer"}
                        </button>
                    </div>
                )}

            </div>
        </div>,
        document.body
    );
}
