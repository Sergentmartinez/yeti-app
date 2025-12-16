// components/pack/WeightGauge.tsx
import { getWeightStatus, WEIGHT_THRESHOLDS } from "@/lib/gear"; // <--- Import depuis LIB
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function WeightGauge({ weight, showLabel = true }: { weight: number; showLabel?: boolean }) {
  const status = getWeightStatus(weight);
  const kg = weight / 1000;
  
  const cfg = {
    optimal: { color: "text-green-600", bg: "bg-green-100", barColor: "bg-green-500", label: "Optimisé", icon: Icons.CheckCircle },
    "medium-risk": { color: "text-yellow-600", bg: "bg-yellow-100", barColor: "bg-yellow-500", label: "Lourd", icon: Icons.Warning },
    "high-risk": { color: "text-red-600", bg: "bg-red-100", barColor: "bg-red-500", label: "Trop lourd", icon: Icons.Close },
  }[status] ?? { color: "text-green-600", bg: "bg-green-100", barColor: "bg-green-500", label: "Optimisé", icon: Icons.CheckCircle };
  
  const pct = Math.min((weight / WEIGHT_THRESHOLDS.MAX_SAFE) * 100, 100);
  const IconComponent = cfg.icon;
  
  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className={cn("text-5xl font-bold font-mono", cfg.color)}>{kg.toFixed(2)}</div>
        <div className="text-stone-500 text-sm">kilogrammes</div>
      </div>
      
      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", cfg.barColor)} 
          style={{ width: `${pct}%` }} 
        />
      </div>
      
      <div className="flex justify-between text-[10px] text-stone-400 font-mono">
        <span>0 kg</span>
        <span className="text-green-600">8 kg</span>
        <span className="text-orange-500">12 kg</span>
        <span className="text-red-500">15 kg</span>
      </div>
      
      {showLabel && (
        <div className="text-center">
          <span className={cn("inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold", cfg.bg, cfg.color)}>
            <IconComponent className="w-4 h-4" />
            {cfg.label}
          </span>
        </div>
      )}
    </div>
  );
}