

export function getGradeColor(grade: number) {
    if (grade >= 80) return "text-emerald-400";
    if (grade >= 60) return "text-amber-400";
    return "text-red-400";
}

export function getProgressColor(progress: number) {
    if (progress >= 100) return "bg-emerald-500";
    if (progress >= 50) return "bg-indigo-500";
    return "bg-slate-600";
}
