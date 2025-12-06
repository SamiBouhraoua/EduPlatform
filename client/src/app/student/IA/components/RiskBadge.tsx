import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function RiskBadge({ risk }: { risk?: string }) {
    const map: any = {
        élevé: {
            bg: "bg-red-500/10 border-red-500/20",
            text: "text-red-400",
            icon: <AlertTriangle size={14} />,
            label: "Risque Élevé",
        },
        moyen: {
            bg: "bg-amber-500/10 border-amber-500/20",
            text: "text-amber-400",
            icon: <AlertTriangle size={14} />,
            label: "Risque Moyen",
        },
        faible: {
            bg: "bg-emerald-500/10 border-emerald-500/20",
            text: "text-emerald-400",
            icon: <CheckCircle2 size={14} />,
            label: "Risque Faible",
        },
    };

    if (!risk || !map[risk]) return null;

    const r = map[risk];

    return (
        <span
            className={`${r.bg} border ${r.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-sm`}
        >
            {r.icon} {r.label.toUpperCase()}
        </span>
    );
}
