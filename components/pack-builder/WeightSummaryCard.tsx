"use client";

import React from "react";
import { useYetiStore } from "@/lib/store/useYetiStore";
import { SegmentedGauge } from "@/components/ui/SegmentedGauge";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const COLORS = {
  orange: "#f97316",
  cyan: "#06b6d4",
  emerald: "#10b981",
  violet: "#a78bfa",
  pink: "#f9a8d4",
  blue: "#60a5fa",
  red: "#ef4444",
  zinc: "#71717a"
};

const CATEGORY_COLORS: Record<string, string> = {
  shelter: COLORS.orange,
  sleep: COLORS.blue,
  kitchen: COLORS.cyan,
  clothing: COLORS.pink,
  food: COLORS.emerald,
  water: COLORS.cyan,
  tech: COLORS.violet,
  hygiene: COLORS.red,
  medikit: COLORS.red,
  tools: COLORS.zinc,
  documents: COLORS.zinc,
  other: COLORS.zinc,
};

const CATEGORY_LABELS: Record<string, string> = {
  shelter: "Abri",
  sleep: "Couchage",
  kitchen: "Cuisine",
  clothing: "Vêtements",
  food: "Nourriture",
  water: "Hydratation",
  tech: "Élec.",
  hygiene: "Hygiène",
  medikit: "Soins",
  tools: "Matériel",
  documents: "Papiers",
  other: "Divers",
};

export function WeightSummaryCard() {
  const { getPackStats, getWeightByCategory, activePackId } = useYetiStore();
  
  const stats = getPackStats(activePackId);
  const weights = getWeightByCategory(); // This currently uses activePack internally

  // Transform weights to segments for the gauge
  const segments = Object.entries(weights)
    .filter(([_, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1]) // Sort largest first
    .map(([cat, weight]) => ({
      id: cat,
      value: weight / 1000, // Convert to kg
      color: CATEGORY_COLORS[cat] || COLORS.zinc,
      label: CATEGORY_LABELS[cat] || cat,
    }));

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex items-baseline gap-2">
         <span className="text-5xl font-black text-white tracking-tighter">
            {(stats.totalWeight / 1000).toFixed(2)}
         </span>
         <span className="text-xl font-bold text-zinc-500">kg</span>
         <span className="ml-auto text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Total
         </span>
      </div>

      <div className="mb-8">
        <SegmentedGauge 
            segments={segments} 
            total={stats.totalWeight > 0 ? (stats.totalWeight / 1000) * 1.2 : 10} // dynamic max scale
            preset="custom"
        />
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 flex-1 content-start">
        {segments.map(seg => (
           <div key={seg.id} className="flex items-center justify-between text-xs group">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                 <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">
                    {seg.label}
                 </span>
              </div>
              <span className="font-bold text-zinc-300">
                 {seg.value.toFixed(2)} <span className="text-[9px] text-zinc-600">kg</span>
              </span>
           </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
         <div>
            <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Base</div>
            <div className="text-sm font-bold text-blue-400">{(stats.baseWeight / 1000).toFixed(1)}</div>
         </div>
         <div>
            <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Porté</div>
            <div className="text-sm font-bold text-zinc-300">{(stats.wornWeight / 1000).toFixed(1)}</div>
         </div>
         <div>
            <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Conso.</div>
            <div className="text-sm font-bold text-zinc-300">{(stats.consumableWeight / 1000).toFixed(1)}</div>
         </div>
      </div>
    </div>
  );
}
