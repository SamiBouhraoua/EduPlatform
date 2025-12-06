import { useState } from "react";
import { X, Brain, TrendingUp, ArrowRight, Target, PlayCircle, Lightbulb, FileText } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { QuizView } from "./QuizView";
import { getGradeColor, getProgressColor } from "../utils";

export function CourseModal({ course, onClose }: { course: any; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<"analysis" | "quiz" | "recommendations">("analysis");

    if (!course) return null;
    const stats = course.stats;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Header Image / Gradient */}
                <div className="h-32 bg-gradient-to-r from-indigo-900 to-purple-900 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute bottom-6 left-8">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 bg-black/30 rounded text-xs font-mono text-indigo-200 border border-white/10">
                                {course.code}
                            </span>
                            <RiskBadge risk={course.ia?.risk} />
                        </div>
                        <h2 className="text-3xl font-bold text-white">{course.title}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto">

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-white/10 mb-8">
                        <button
                            onClick={() => setActiveTab("analysis")}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "analysis" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Analyse & Conseils
                            {activeTab === "analysis" && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("quiz")}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "quiz" ? "text-purple-400" : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Quiz Interactif
                            {activeTab === "quiz" && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("recommendations")}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "recommendations" ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Plan d'Action
                            {activeTab === "recommendations" && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full" />
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "analysis" ? (
                        <div className="grid md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2 duration-300">

                            {/* Left: Stats & Summary */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Brain size={20} className="text-indigo-400" /> Analyse IA
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-lg">
                                        {course.ia?.shortSummary}
                                    </p>
                                </div>

                                <div className="bg-purple-500/5 rounded-2xl p-6 border border-purple-500/10">
                                    <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                                        <TrendingUp size={20} /> Conseils Stratégiques
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <ArrowRight size={18} className="text-purple-400 mt-1 shrink-0" />
                                            <span className="text-slate-300">{course.ia?.advice}</span>
                                        </li>
                                        {course.ia?.focusPoints?.map((pt: string, i: number) => (
                                            <li key={i} className="flex gap-3">
                                                <Target size={18} className="text-purple-400 mt-1 shrink-0" />
                                                <span className="text-slate-300">{pt}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right: Stats Card */}
                            <div className="space-y-6">
                                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                                    <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Performance</h4>

                                    <div className="mb-6 text-center">
                                        <div className={`text-5xl font-bold mb-2 ${stats?.average !== null ? getGradeColor(stats?.average || 0) : 'text-slate-500'}`}>
                                            {stats?.average !== null ? `${stats?.average}%` : 'N/A'}
                                        </div>
                                        <p className="text-slate-400 text-sm">Moyenne actuelle</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>Progression</span>
                                                <span>{stats?.completion}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${getProgressColor(stats?.completion || 0)}`}
                                                    style={{ width: `${stats?.completion}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <p className="text-xl font-bold text-white">{course.documentsCount}</p>
                                                <p className="text-xs text-slate-500">Documents</p>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-white">{course.reportsCount}</p>
                                                <p className="text-xs text-slate-500">Rapports</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveTab("quiz")}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <PlayCircle className="group-hover:scale-110 transition-transform" />
                                    Lancer le Quiz
                                </button>
                            </div>

                        </div>
                    ) : activeTab === "quiz" ? (
                        <QuizView quiz={course.ia?.quiz} onClose={() => setActiveTab("analysis")} />
                    ) : (
                        /* Plan d'Action Tab */
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Lightbulb size={24} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-emerald-300">Plan d'Action Personnalisé</h3>
                                        <p className="text-sm text-slate-400">Basé sur l'analyse des documents et rapports</p>
                                    </div>
                                </div>

                                {/* Main Recommendation */}
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                                    <h4 className="text-sm font-semibold text-emerald-300 mb-3 uppercase tracking-wider">Recommandation Principale</h4>
                                    <p className="text-slate-200 leading-relaxed text-lg">
                                        {course.ia?.advice}
                                    </p>
                                </div>

                                {/* Focus Points - Detailed */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                                        <Target size={16} />
                                        Points Clés à Maîtriser
                                    </h4>
                                    {course.ia?.focusPoints?.map((point: string, idx: number) => (
                                        <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-white/10 group">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                                                    <span className="text-sm font-bold text-emerald-400">{idx + 1}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-slate-200 leading-relaxed font-medium">{point}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Resources Used */}
                                {(course.documentsCount > 0 || course.reportsCount > 0) && (
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <FileText size={16} className="text-emerald-400" />
                                                <span>Analyse basée sur :</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                                    <span className="text-xs text-slate-400">{course.documentsCount} Document(s)</span>
                                                </div>
                                                <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                                    <span className="text-xs text-slate-400">{course.reportsCount} Rapport(s)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setActiveTab("quiz")}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 group"
                                >
                                    <PlayCircle className="group-hover:scale-110 transition-transform" />
                                    Tester mes connaissances avec le Quiz
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
