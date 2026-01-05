import { Stage, TrekTheme } from "@/types";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface StageCardProps {
    stage: Stage;
    theme: TrekTheme;
    onClick?: () => void;
}

export const StageCard = ({ stage, theme, onClick }: StageCardProps) => {
    const isSpirit = theme === "spirit";

    // Configuration des couleurs selon le thème
    const colors = isSpirit ? {
        sidebar: "bg-gradient-to-b from-blue-500 to-blue-700",
        sidebarBorder: "border-blue-600",
        textAccent: "text-blue-600",
        bgLight: "bg-blue-50",
    } : {
        sidebar: "bg-gradient-to-b from-orange-500 to-orange-700",
        sidebarBorder: "border-orange-600",
        textAccent: "text-orange-600",
        bgLight: "bg-orange-50",
    };

    // Extraction du numéro (ex: "E01" -> "01")
    const stageNumber = stage.code.replace(/\D/g, '');

    return (
        <div 
            onClick={onClick}
            className="group relative flex w-full bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-32"
        >
            {/* --- 1. BANDE LATÉRALE (Ribbon) --- */}
            <div className={cn(
                "w-16 shrink-0 flex flex-col items-center justify-center text-white relative", 
                colors.sidebar
            )}>
                {/* Texture subtile pour effet "matière" */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
                
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-[-2px]">
                    Jour
                </span>
                <span className="text-3xl font-black tracking-tighter leading-none">
                    {stageNumber}
                </span>
            </div>

            {/* --- 2. CONTENU PRINCIPAL --- */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                
                {/* Header: Titre + Tags */}
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-stone-900 leading-tight truncate pr-4 group-hover:text-stone-700 transition-colors">
                            {stage.title}
                        </h3>
                        {/* Tag Principal (si dispo) */}
                        {stage.tags && stage.tags.length > 0 && (
                            <span className="shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-stone-100 text-stone-500 border border-stone-200 hidden sm:inline-block">
                                {stage.tags[0]}
                            </span>
                        )}
                    </div>
                    {/* Petite description tronquée */}
                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                        {stage.description || "Voir le détail de l'itinéraire..."}
                    </p>
                </div>

                {/* Footer: Stats Techniques */}
                <div className="flex items-center gap-4 pt-3 border-t border-stone-100/50 mt-1">
                    
                    {/* Distance */}
                    <div className="flex items-center gap-1.5">
                        <Icons.StatsDistance className={cn("w-3.5 h-3.5", colors.textAccent)} />
                        <div className="flex flex-col leading-none">
                            <span className="text-sm font-bold text-stone-700">{stage.stats.dist}km</span>
                        </div>
                    </div>

                    {/* Dénivelé (Mise en avant) */}
                    <div className="flex items-center gap-1.5 pl-4 border-l border-stone-200">
                        <Icons.StatsElevation className={cn("w-3.5 h-3.5", colors.textAccent)} />
                        <div className="flex flex-col leading-none">
                            <span className="text-sm font-bold text-stone-700">+{stage.stats.dplus}m</span>
                        </div>
                    </div>

                    {/* Durée */}
                    {stage.stats.duration && (
                        <div className="flex items-center gap-1.5 ml-auto text-stone-400">
                            <Icons.StatsDuration className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{stage.stats.duration.replace('h', 'h')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 3. OVERLAY HOVER (Subtil) --- */}
            {/* Ajoute une bordure colorée interne au survol */}
            <div className={cn(
                "absolute inset-0 border-2 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100",
                colors.sidebarBorder
            )} />
        </div>
    );
};

export default StageCard;