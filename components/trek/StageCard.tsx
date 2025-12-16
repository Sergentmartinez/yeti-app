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

    // Configuration des couleurs avec transparence
    const style = isSpirit ? {
        // Sidebar (Fond teinté léger + Texte)
        sidebarBg: "bg-blue-500/5", 
        sidebarBorder: "border-blue-500/10",
        labelColor: "text-blue-400",
        numberColor: "text-blue-700",
        // Ligne décorative gauche
        accentLine: "bg-blue-500",
        // Interactions
        borderHover: "group-hover:border-blue-300",
        bgHover: "group-hover:bg-blue-50/30",
        iconColor: "text-blue-600",
    } : {
        // Sidebar (Fond teinté léger + Texte)
        sidebarBg: "bg-orange-500/5",
        sidebarBorder: "border-orange-500/10",
        labelColor: "text-orange-400",
        numberColor: "text-orange-700",
        // Ligne décorative gauche
        accentLine: "bg-orange-500",
        // Interactions
        borderHover: "group-hover:border-orange-300",
        bgHover: "group-hover:bg-orange-50/30",
        iconColor: "text-orange-600",
    };

    const stageNumber = stage.code.replace(/\D/g, '');

    return (
        <div 
            onClick={onClick}
            className={cn(
                "group relative w-full bg-white rounded-xl border border-stone-200 transition-all duration-300 cursor-pointer overflow-hidden",
                "hover:shadow-lg hover:-translate-y-0.5",
                style.borderHover
            )}
        >
            {/* Fine ligne de couleur saturée à gauche */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1 z-10", style.accentLine)} />

            <div className="flex items-stretch h-28">
                
                {/* --- 1. BLOC NUMÉRO (Teinté en transparence) --- */}
                <div className={cn(
                    "w-16 shrink-0 flex flex-col items-center justify-center border-r transition-colors",
                    style.sidebarBg,
                    style.sidebarBorder
                )}>
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest mb-0.5",
                        style.labelColor
                    )}>
                        Jour
                    </span>
                    <span className={cn(
                        "text-2xl font-black tracking-tighter leading-none",
                        style.numberColor
                    )}>
                        {stageNumber}
                    </span>
                </div>

                {/* --- 2. CONTENU --- */}
                <div className={cn("flex-1 p-4 flex flex-col justify-between transition-colors", style.bgHover)}>
                    
                    {/* Haut : Titre */}
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base font-bold text-stone-900 line-clamp-1 leading-tight group-hover:text-stone-700">
                                {stage.title}
                            </h3>
                            <Icons.ArrowRight className={cn(
                                "w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0",
                                style.iconColor
                            )} />
                        </div>
                        
                        <p className="text-xs text-stone-500 mt-1 line-clamp-1 leading-relaxed">
                            {stage.description || "Détails de l'itinéraire..."}
                        </p>
                    </div>

                    {/* Bas : Infos Techniques */}
                    <div className="flex items-center gap-6 mt-2 pt-3 border-t border-stone-100 border-dashed">
                        
                        <div className="flex items-center gap-2" title="Distance">
                            <Icons.StatsDistance className={cn("w-3.5 h-3.5", style.iconColor)} />
                            <span className="text-xs font-bold text-stone-700 font-mono">
                                {stage.stats.dist} <span className="text-stone-400 font-normal">km</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2 pl-4 border-l border-stone-100" title="Dénivelé">
                            <Icons.StatsElevation className={cn("w-3.5 h-3.5", style.iconColor)} />
                            <span className="text-xs font-bold text-stone-700 font-mono">
                                +{stage.stats.dplus} <span className="text-stone-400 font-normal">m</span>
                            </span>
                        </div>

                        {stage.stats.duration && (
                            <div className="flex items-center gap-2 ml-auto text-stone-400">
                                <Icons.StatsDuration className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium text-stone-500">
                                    {stage.stats.duration.replace('h', 'h')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StageCard;