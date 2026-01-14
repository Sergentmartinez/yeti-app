// app/basecamp/routes/page.tsx
"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

// Port dynamiquement la map pour éviter les erreurs SSR de Leaflet
const ExpeditionMap = dynamic(() => import('@/components/maps/ExpeditionMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-bg-surface-2 animate-pulse flex items-center justify-center rounded-2xl">
      <Icons.Map className="w-12 h-12 text-text-faint" />
    </div>
  )
});

const INITIAL_STAGES = [
  { id: 1, name: "Calenzana → Ortu di u Piobbu", dist: "10.5 km", elev: "1550", status: "completed" },
  { id: 2, name: "Ortu di u Piobbu → Carozzu", dist: "7.2 km", elev: "650", status: "completed" },
  { id: 3, name: "Carozzu → Asco Stagnu", dist: "4.8 km", elev: "780", status: "completed" },
  { id: 4, name: "Asco Stagnu → Tighjettu", dist: "8.5 km", elev: "1050", status: "active" },
  { id: 5, name: "Tighjettu → Ciottulu", dist: "6.2 km", elev: "620", status: "active" },
  { id: 6, name: "Ciottulu → Manganu", dist: "14.5 km", elev: "650", status: "active" },
];

export default function ItineraryPage() {
    const [stages, setStages] = useState(INITIAL_STAGES);
    const [activeStage, setActiveStage] = useState(4);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStageId, setEditingStageId] = useState<number | null>(null);
    
    // Form state
    const [stageName, setStageName] = useState("");
    const [stageCoords, setStageCoords] = useState("");
    const [stageElev, setStageElev] = useState("");
    const [stageDist, setStageDist] = useState("");

    const openEditModal = (id: number) => {
        const s = stages.find(x => x.id === id);
        if (s) {
            setEditingStageId(id);
            setStageName(s.name);
            setStageElev(s.elev);
            setStageDist(s.dist.replace(" km", ""));
            setStageCoords("");
            setIsModalOpen(true);
        }
    };

    const openAddModal = () => {
        setEditingStageId(null);
        setStageName("");
        setStageCoords("");
        setStageElev("");
        setStageDist("");
        setIsModalOpen(true);
    };

    const handleSaveStage = () => {
        if (!stageName) return;

        if (editingStageId !== null) {
            // Update existing
            setStages(prev => prev.map(s => s.id === editingStageId ? {
                ...s,
                name: stageName,
                elev: stageElev || "0",
                dist: (stageDist || "0") + " km"
            } : s));
        } else {
            // Add new
            const nextId = stages.length > 0 ? Math.max(...stages.map(s => s.id)) + 1 : 1;
            const newStage = {
                id: nextId,
                name: stageName,
                dist: (stageDist || "0") + " km",
                elev: stageElev || "0",
                status: "active" as const
            };
            setStages([...stages, newStage]);
        }
        
        setIsModalOpen(false);
    };

    const deleteStage = (id: number) => {
        if (confirm("Supprimer cette étape ?")) {
            setStages(prev => prev.filter(s => s.id !== id));
            if (activeStage === id) setActiveStage(stages[0]?.id || 0);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-bg-base transition-colors overflow-hidden">
            {/* HEADER */}
            <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-text-primary tracking-tight">Itinéraire</h1>
                    <div className="h-4 w-[1px] bg-border-subtle" />
                    <span className="text-sm text-text-muted font-medium uppercase tracking-widest">GR20 Nord</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-surface-1 bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[10px] font-black text-white">M</div>
                        ))}
                    </div>
                    <button className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-cyan-vibrant hover:bg-cyan-vibrant/10 transition-colors">
                        <Icons.Share className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Partager</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* STAGES SIDEBAR */}
                <aside className="w-80 border-r border-border-subtle bg-bg-surface-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em] px-2 mb-4">Étapes du Trek</div>
                    
                    <div className="space-y-2">
                        {stages.map((stage) => (
                            <div
                                key={stage.id}
                                onClick={() => setActiveStage(stage.id)}
                                onDoubleClick={() => openEditModal(stage.id)}
                                className={cn(
                                    "p-4 rounded-xl cursor-pointer transition-all border group relative",
                                    activeStage === stage.id
                                        ? "bg-bg-surface-2 border-orange-vibrant/50 shadow-lg shadow-orange-vibrant/5 scale-[1.02]"
                                        : "bg-transparent border-transparent hover:bg-bg-surface-3"
                                )}
                                title="Double-clic pour éditer"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                                        stage.status === 'completed' ? "bg-emerald-vibrant/10 text-emerald-vibrant" :
                                        stage.status === 'active' ? "bg-orange-vibrant/10 text-orange-vibrant animate-pulse" :
                                        "bg-bg-surface-4 text-text-faint"
                                    )}>
                                        Jour {stage.id}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black font-mono text-text-primary bg-bg-surface-3 px-1.5 py-0.5 rounded shadow-sm">{stage.dist}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openEditModal(stage.id); }}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-orange-vibrant transition-all"
                                        >
                                            <Icons.PlusCircle className="w-3 h-3 rotate-45" /> {/* Edit Icon */}
                                        </button>
                                    </div>
                                </div>
                                <h4 className={cn(
                                  "text-sm font-bold tracking-tight mb-1",
                                  activeStage === stage.id ? "text-text-primary" : "text-text-muted"
                                )}>{stage.name}</h4>
                                <div className="text-xs font-black text-cyan-vibrant uppercase tracking-wider flex items-center gap-1.5">
                                    <Icons.StatsElevation className="w-3 h-3" />
                                    {stage.elev}m D+
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={openAddModal}
                        className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-border-default text-text-faint hover:text-orange-vibrant hover:border-orange-vibrant/30 transition-all flex flex-col items-center justify-center gap-1 group bg-orange-vibrant/5"
                    >
                         <Icons.Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Ajouter une étape</span>
                    </button>
                </aside>

                {/* MAP AREA */}
                <main className="flex-1 relative flex flex-col">
                    <div className="flex-1 p-4">
                         <div className="w-full h-full premium-card rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-border-subtle">
                              <ExpeditionMap />
                              
                              {/* Overlays */}
                              <div className="absolute top-8 left-8 z-10 space-y-3">
                                   <div className="premium-card p-4 rounded-xl bg-bg-surface-1/80 backdrop-blur-md border-border-subtle flex items-center gap-4 shadow-xl">
                                        <div className="w-10 h-10 rounded-xl bg-orange-vibrant flex items-center justify-center shadow-lg shadow-orange-vibrant/20">
                                             <Icons.NavRoutes className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                             <div className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Dernière Position</div>
                                             <div className="text-sm font-black text-text-primary tracking-tight">
                                                {stages.find(s => s.id === activeStage)?.name.split('→')[0] || "Refuge d'Asco"}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* ELEVATION PROFILE */}
                    <div className="h-48 px-4 pb-4">
                         <div className="w-full h-full premium-card rounded-2xl p-6 relative group overflow-hidden">
                              <div className="flex items-center justify-between mb-6">
                                   <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Profil d&apos;Élévation Global</div>
                                   <div className="text-sm font-black text-orange-vibrant font-mono bg-orange-vibrant/5 px-3 py-1 rounded-lg ring-1 ring-orange-vibrant/20 shadow-lg shadow-orange-vibrant/5">
                                        {stages.reduce((acc, curr) => acc + parseInt(curr.elev || "0"), 0).toLocaleString()} m D+ Total
                                   </div>
                              </div>
                              
                              {/* Mock Elevation Chart */}
                              <div className="relative h-24 w-full flex items-end gap-[2px]">
                                   {Array.from({ length: 120 }).map((_, i) => {
                                        const h = 20 + Math.sin(i * 0.1) * 30 + Math.cos(i * 0.05) * 20 + (i/2);
                                        return (
                                             <div 
                                                key={i} 
                                                className={cn(
                                                    "flex-1 rounded-t-sm transition-all duration-500 hover:scale-y-110 hover:opacity-100",
                                                    i === 45 
                                                        ? "bg-gradient-to-t from-orange-vibrant to-orange-400 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.6)] z-20" 
                                                        : "bg-gradient-to-t from-orange-vibrant/30 to-orange-vibrant/5 group-hover:from-orange-vibrant/50"
                                                )} 
                                                style={{ height: `${h}%` }} 
                                             />
                                        );
                                   })}
                                   {/* Active Marker on chart */}
                                   <div className="absolute bottom-0 left-[37.5%] h-full w-[2px] bg-orange-vibrant shadow-[0_0_15px_rgba(249,115,22,0.8)] z-30" />
                              </div>

                              <div className="mt-6 flex justify-between text-[11px] font-black text-text-muted uppercase tracking-widest px-1">
                                   <span className="bg-bg-surface-4/50 px-2 py-1 rounded">Calenzana (0 km)</span>
                                   <span className="bg-bg-surface-4/50 px-2 py-1 rounded">Asco (32 km)</span>
                                   <span className="bg-bg-surface-4/50 px-2 py-1 rounded text-orange-vibrant ring-1 ring-orange-vibrant/20">Vizzavona (90 km)</span>
                                   <span className="bg-bg-surface-4/50 px-2 py-1 rounded">Conca (180 km)</span>
                              </div>
                         </div>
                    </div>
                </main>
            </div>

            {/* STAGE MODAL (ADD/EDIT) */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStageId ? "CONFIGURER L'ÉTAPE TACTIQUE" : "AJOUTER UNE ÉTAPE TACTIQUE"}>
                <div className="space-y-6 pt-2">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nom de l&apos;étape / Destination</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Refuge de Manganu..." 
                            value={stageName}
                            onChange={(e) => setStageName(e.target.value)}
                            className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-orange-vibrant/30 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Altitude D+ (m)</label>
                            <input 
                                type="number" 
                                placeholder="Ex: 850" 
                                value={stageElev}
                                onChange={(e) => setStageElev(e.target.value)}
                                className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-orange-vibrant/30 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Distance (km)</label>
                            <input 
                                type="number" 
                                placeholder="Ex: 12" 
                                value={stageDist}
                                onChange={(e) => setStageDist(e.target.value)}
                                className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-orange-vibrant/30 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Coordonnées GPS (Optionnel)</label>
                        <input 
                            type="text" 
                            placeholder="42.345, 8.912" 
                            value={stageCoords}
                            onChange={(e) => setStageCoords(e.target.value)}
                            className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-xs font-mono text-text-primary focus:ring-2 focus:ring-orange-vibrant/30 outline-none transition-all"
                        />
                    </div>

                    <div className="flex justify-between gap-3 pt-4">
                        <div>
                            {editingStageId && (
                                <button 
                                    onClick={() => deleteStage(editingStageId)}
                                    className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-accent-red/60 hover:text-accent-red transition-colors"
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleSaveStage}
                                className="px-8 py-3 rounded-xl bg-orange-vibrant text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-vibrant/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                {editingStageId ? "Mettre à jour" : "Confirmer l'étape"}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}