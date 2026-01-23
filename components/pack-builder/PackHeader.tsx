"use client";

import React from "react";
import { useYetiStore } from "@/lib/store/useYetiStore";
import { Plus, Download, Upload, Backpack, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export function PackHeader({ onOpenLibrary }: { onOpenLibrary: () => void }) {
  const { 
    packs, 
    activePackId, 
    setActivePack, 
    createPack,
    getPackStats, 
    selectedTrekName,
    getDaysUntilDeparture,
    importState,
    gearLibrary
  } = useYetiStore();

  const activePack = packs.find(p => p.id === activePackId) || packs[0];
  const stats = getPackStats(activePackId);
  const daysUntil = getDaysUntilDeparture();

  // Export Logic
  const handleExport = () => {
    const dataStr = JSON.stringify({ packs, gearLibrary, activePackId }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `yeti-pack-${activePack?.name || "backup"}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Logic
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const success = useYetiStore.getState().importState(json); // direct usage or add to hook destructuring
        if (success) {
            alert("Import réussi !");
        } else {
            alert("Erreur: Format de fichier invalide.");
        }
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="flex flex-col xl:flex-row xl:items-end justify-between mb-8 gap-6">
      <div className="flex-1">
        {/* Top Status Line */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Pack Builder Actif</span>
        </div>

        {/* Main Title Area */}
        <div className="flex items-center gap-4 group cursor-pointer relative">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase mb-1">
            {activePack?.name || "Pack"}
            </h1>
            <ChevronDown className="text-zinc-600 w-8 h-8 group-hover:text-white transition-colors" />
            
            {/* Simple Pack Switcher Dropdown */}
            <select 
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={activePackId}
                onChange={(e) => setActivePack(e.target.value)}
            >
                {packs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>

        {/* Sub-stats Line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-400 font-medium text-sm mt-2">
           <span className="text-white font-bold">{selectedTrekName}</span>
           <span>•</span>
           <span className="text-orange-500 font-bold">J-{daysUntil ?? "?"}</span>
           <span className="w-px h-3 bg-zinc-700 mx-1" />
           
           <span className="flex items-center gap-1.5" title="Poids Total">
             <Backpack size={14} className="text-zinc-500" />
             <span className="text-white font-bold">{stats.totalWeight > 0 ? (stats.totalWeight/1000).toFixed(1) : 0}kg</span>
           </span>
           
           <span className="flex items-center gap-1.5 ml-2" title="Poids de base (sans porté/conso)">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
             <span>Base: <span className="text-blue-400 font-bold">{stats.baseWeight > 0 ? (stats.baseWeight/1000).toFixed(1) : 0}kg</span></span>
           </span>

           <span className="flex items-center gap-1.5 ml-2" title="Budget estimé">
             <span className="text-emerald-500 font-bold">{Math.round(stats.totalPrice)}€</span>
           </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-full font-bold text-xs transition-colors tracking-wide uppercase border border-zinc-700 hover:border-zinc-500 cursor-pointer">
           <Upload className="w-4 h-4" />
           <span className="hidden md:inline">Importer</span>
           <input type="file" className="hidden" accept=".json" onChange={handleImport} />
        </label>

        <button 
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-full font-bold text-xs transition-colors tracking-wide uppercase border border-zinc-700 hover:border-zinc-500"
            onClick={handleExport}
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Exporter</span>
        </button>

        <button 
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-full font-black text-xs transition-colors tracking-wide uppercase shadow-lg shadow-orange-600/20"
            onClick={onOpenLibrary}
        >
          <Plus className="w-4 h-4" />
          Ajouter Item
        </button>
      </div>
    </header>
  );
}
