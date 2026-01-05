"use client";

import { usePathname } from "next/navigation";
import { useYetiStore } from "@/lib/store/useYetiStore";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function ContextBlock() {
  const pathname = usePathname();
  const { 
    projects, 
    currentProjectId, 
    getGlobalStats, 
    getBaseWeight,
    packedItems,
    selectedTrekName
  } = useYetiStore();

  const stats = getGlobalStats();

  // === RENDER HELPERS ===

  // 1. BASECAMP / DASHBOARD (Focus Mission)
  if (pathname === "/basecamp" || pathname === "/app/basecamp") {
    const activeProject = projects.find(p => p.id === currentProjectId) || projects[0];
    const baseWeight = getBaseWeight();
    
    return (
      <div className="p-4 rounded-xl bg-orange-600/10 border border-orange-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500/70">Focus Mission</span>
        </div>
        <div className="text-sm font-bold text-white mb-2 truncate">
          {activeProject?.trekName || selectedTrekName || "Aucun projet actif"}
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg p-2">
                <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Poids Base</div>
                <div className="text-sm font-mono font-bold text-white">{baseWeight.toFixed(1)}kg</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
                <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Items</div>
                <div className="text-sm font-mono font-bold text-white">{packedItems.length}</div>
            </div>
        </div>
      </div>
    );
  }

  // 2. GARAGE / INVENTORY
  if (pathname.includes("/garage") || pathname.includes("/gear")) {
    return (
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3 text-zinc-500">Locker Summary</div>
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-xs text-zinc-400">Total Gear</span>
                <span className="text-lg font-black text-white leading-none">{stats.totalGearCount}</span>
            </div>
            <div className="flex justify-between items-end">
                <span className="text-xs text-zinc-400">Total Value</span>
                <span className="text-lg font-black text-orange-500 leading-none">{stats.totalGearValue}€</span>
            </div>
            <div className="pt-2 border-t border-zinc-800">
                <div className="w-full bg-zinc-800 rounded-full h-1">
                    <div className="bg-orange-600 h-1 rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-zinc-600 uppercase">Capacité</span>
                    <span className="text-[8px] text-zinc-600">65%</span>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 3. PACK BUILDER
  if (pathname.includes("/pack")) {
    const baseWeight = getBaseWeight();
    const isOver = baseWeight > 8; // Mock target 8kg

    return (
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3 text-zinc-500">Pack Status</div>
        <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-black text-white">{baseWeight.toFixed(1)}<span className="text-xs text-zinc-500 ml-1">kg</span></div>
            <div className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                isOver ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
            )}>
                {isOver ? "Overweight" : "On Target"}
            </div>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
                className={cn("h-full transition-all", isOver ? "bg-red-500" : "bg-orange-500")} 
                style={{ width: `${Math.min((baseWeight / 10) * 100, 100)}%` }} 
            />
        </div>
      </div>
    );
  }

  // 4. TREKS / CATALOGUE
  if (pathname.includes("/treks") || pathname.includes("/select-trek")) {
      return (
        <div className="p-4 rounded-xl bg-orange-600 text-white">
            <Icons.NavTrek className="w-8 h-8 opacity-20 absolute right-4 top-4 rotate-12" />
            <div className="relative">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Catalogue</div>
                <div className="text-lg font-black mb-2 leading-tight">12 Itinéraires</div>
                <p className="text-[10px] opacity-80 leading-relaxed">
                    Explorez les plus beaux sentiers d'Europe sélectionnés par nos guides.
                </p>
            </div>
        </div>
      );
  }

  // DEFAULT
  return (
    <div className="p-4 rounded-xl border border-dashed border-stone-800">
        <p className="text-[10px] text-stone-600 text-center italic">
            Sélectionnez une section pour voir les détails contextuels.
        </p>
    </div>
  );
}
