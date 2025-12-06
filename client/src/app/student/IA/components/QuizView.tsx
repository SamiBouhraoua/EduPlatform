import { useState } from "react";
import { Brain, CheckCircle, XCircle, ChevronRight, Target } from "lucide-react";

export function QuizView({ quiz, onClose }: { quiz: any[]; onClose: () => void }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    if (!quiz || quiz.length === 0) {
        return (
            <div className="text-center py-10 text-slate-400">
                <p>Aucun quiz disponible pour ce cours.</p>
                <button onClick={onClose} className="mt-4 text-indigo-400 hover:underline">
                    Retour
                </button>
            </div>
        );
    }

    const question = quiz[currentQ];
    const isLast = currentQ === quiz.length - 1;

    const handleAnswer = (idx: number) => {
        if (showResult) return;
        setSelected(idx);
        setShowResult(true);
        if (idx === question.correctAnswer) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (isLast) {
            // Show final score
            setShowResult(false);
            setCurrentQ(currentQ + 1); // Move to "score screen" state
        } else {
            setCurrentQ(currentQ + 1);
            setSelected(null);
            setShowResult(false);
        }
    };

    const progressPercentage = ((currentQ) / quiz.length) * 100;

    // Score Screen
    if (currentQ >= quiz.length) {
        return (
            <div className="text-center py-10 animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-500/20 mb-6">
                    <Target size={48} className="text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Quiz Terminé !</h3>
                <p className="text-slate-400 mb-8">Voici votre résultat final</p>

                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-8">
                    {score} / {quiz.length}
                </div>

                <button
                    onClick={onClose}
                    className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                    Retour au cours
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Brain className="text-purple-400" /> Quiz de Révision
                </h3>
                <div className="flex flex-col items-end">
                    <span className="text-sm text-slate-400">
                        Question {currentQ + 1} / {quiz.length}
                    </span>
                    <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10">
                <p className="text-lg font-medium text-white mb-6">{question.question}</p>

                <div className="space-y-3">
                    {question.options.map((opt: string, idx: number) => {
                        let style =
                            "w-full text-left p-4 rounded-xl border transition-all duration-200 ";

                        if (showResult) {
                            if (idx === question.correctAnswer) {
                                style += "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                            } else if (idx === selected) {
                                style += "bg-red-500/20 border-red-500/50 text-red-300";
                            } else {
                                style += "bg-slate-700/30 border-transparent opacity-50";
                            }
                        } else {
                            style +=
                                "bg-slate-700/30 border-transparent hover:bg-indigo-500/20 hover:border-indigo-500/50 text-slate-200";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={showResult}
                                className={style}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{opt}</span>
                                    {showResult && idx === question.correctAnswer && (
                                        <CheckCircle size={18} />
                                    )}
                                    {showResult && idx === selected && idx !== question.correctAnswer && (
                                        <XCircle size={18} />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {showResult && (
                    <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl animate-in fade-in zoom-in-95">
                        <p className="text-indigo-300 text-sm font-medium mb-1">Explication :</p>
                        <p className="text-slate-300 text-sm">{question.explanation}</p>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={nextQuestion}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {isLast ? "Voir mon score" : "Question Suivante"} <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
