// app/basecamp/routes/page.tsx
"use client";

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
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

interface Stage {
    id: number;
    name: string;
    dist: string;
    elev: string;
    status: 'completed' | 'active' | 'pending';
    coords?: [number, number];
}

const INITIAL_STAGES: Stage[] = [
  { id: 1, name: "Calenzana", dist: "0", elev: "300", status: "completed", coords: [42.5083, 8.8556] },
  { id: 2, name: "Ortu di u Piobbu", dist: "10.5", elev: "1550", status: "completed", coords: [42.4167, 8.8833] },
  { id: 3, name: "Carozzu", dist: "7.2", elev: "650", status: "completed", coords: [42.3667, 8.9167] },
  { id: 4, name: "Asco Stagnu", dist: "4.8", elev: "780", status: "active", coords: [42.3333, 8.8667] },
  { id: 5, name: "Tighjettu", dist: "8.5", elev: "1050", status: "active", coords: [42.3000, 8.9000] },
  { id: 6, name: "Ciottulu di i Mori", dist: "6.2", elev: "620", status: "active", coords: [42.2611, 8.9222] },
];

export default function ItineraryPage() {
    const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
    const [activeStage, setActiveStage] = useState(4);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStageId, setEditingStageId] = useState<number | null>(null);
    const [isPickingMode, setIsPickingMode] = useState(false);
    const [isFetchingElevation, setIsFetchingElevation] = useState(false);
    
    // Form state
    const [stageName, setStageName] = useState("");
    const [stageCoords, setStageCoords] = useState<[number, number] | null>(null);
    const [stageElev, setStageElev] = useState("");
    const [stageDist, setStageDist] = useState("");

    // --- LOGIC: Fetch Real Elevation from API ---
    const fetchRealElevation = async (lat: number, lng: number) => {
        setIsFetchingElevation(true);
        try {
            // Using a public elevation API (Open-Elevation)
            const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
            const data = await res.json();
            if (data.results && data.results[0]) {
                const absoluteElevation = Math.round(data.results[0].elevation);
                
                // Calculate D+ relative to last stage
                const lastStage = [...stages].reverse().find(s => s.coords && (editingStageId ? s.id !== editingStageId : true));
                if (lastStage && lastStage.coords) {
                    // This is a simplification. Usually D+ is cumulative gain along a path.
                    // Here we estimate gain between two points.
                    const gain = Math.max(0, absoluteElevation - parseInt(lastStage.elev)); 
                    setStageElev(gain.toString());
                } else {
                    setStageElev(absoluteElevation.toString());
                }
            }
        } catch (error) {
            console.error("Elevation API failed", error);
            // Fallback to previous mock gain
        } finally {
            setIsFetchingElevation(false);
        }
    };

    const calculateDistance = (lat: number, lng: number) => {
        const lastStageWithCoords = [...stages].reverse().find(s => s.coords && (editingStageId ? s.id !== editingStageId : true));
        if (lastStageWithCoords && lastStageWithCoords.coords) {
            const [lat1, lon1] = lastStageWithCoords.coords;
            const R = 6371; // km
            const dLat = (lat - lat1) * Math.PI / 180;
            const dLon = (lng - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const d = R * c;
            setStageDist(d.toFixed(1));
        }
    };

    const handlePointPicked = (lat: number, lng: number) => {
        setStageCoords([lat, lng]);
        calculateDistance(lat, lng);
        fetchRealElevation(lat, lng);
        setIsPickingMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (id: number) => {
        const s = stages.find(x => x.id === id);
        if (s) {
            setEditingStageId(id);
            setStageName(s.name);
            setStageElev(s.elev);
            setStageDist(s.dist);
            setStageCoords(s.coords || null);
            setIsModalOpen(true);
        }
    };

    const openAddModal = () => {
        setEditingStageId(null);
        setStageName("");
        setStageCoords(null);
        setStageElev("");
        setStageDist("");
        setIsModalOpen(true);
    };

    const handleSaveStage = () => {
        if (!stageName) return;

        const stageData = {
            name: stageName,
            elev: stageElev || "0",
            dist: stageDist || "0",
            coords: stageCoords || undefined,
            status: 'active' as const
        };

        if (editingStageId !== null) {
            setStages(prev => prev.map(s => s.id === editingStageId ? { ...s, ...stageData } : s));
        } else {
            const nextId = stages.length > 0 ? Math.max(...stages.map(s => s.id)) + 1 : 1;
            setStages([...stages, { id: nextId, ...stageData }]);
        }
        
        setIsModalOpen(false);
    };

    const totalElev = useMemo(() => stages.reduce((acc, curr) => acc + parseInt(curr.elev || "0"), 0), [stages]);

    return (
        <div className="h-screen flex flex-col bg-bg-base transition-colors overflow-hidden">
            {/* HEADER */}
            <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-text-primary tracking-tight">Itinéraire</h1>
                    <div className="h-4 w-[1px] bg-border-subtle" />
                    <span className="text-sm text-text-muted font-medium uppercase tracking-widest leading-none">Intelligence Tactique</span>
                </div>
                {isPickingMode && (
                    <div className="absolute left-1/2 -translate-x-1/2 px-6 py-2 bg-orange-vibrant text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl animate-pulse z-50">
                        Cliquez sur la carte : Données réelles altimétriques
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <div className="text-[10px] font-black text-emerald-vibrant px-3 py-1 bg-emerald-vibrant/5 rounded-lg border border-emerald-vibrant/20 uppercase tracking-widest">Live API Elevation</div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* STAGES SIDEBAR */}
                <aside className="w-80 border-r border-border-subtle bg-bg-surface-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em] px-2 mb-4">Itinéraire Réel</div>
                    
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
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                                        stage.coords ? "bg-orange-vibrant/10 text-orange-vibrant" : "bg-bg-surface-4 text-text-faint"
                                    )}>
                                        {stage.coords ? "Précis" : "Manual"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black font-mono text-text-primary bg-bg-surface-3 px-1.5 py-0.5 rounded shadow-sm">{stage.dist} km</span>
                                        <button onClick={(e) => { e.stopPropagation(); openEditModal(stage.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-orange-vibrant"><Icons.PlusCircle className="w-3 h-3 rotate-45" /></button>
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold tracking-tight mb-1 text-text-primary">{stage.name}</h4>
                                <div className="text-xs font-black text-cyan-vibrant uppercase tracking-wider flex items-center gap-1.5">
                                    <Icons.StatsElevation className="w-3 h-3" />
                                    {stage.elev}m D+
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={openAddModal} className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-border-default text-text-faint hover:text-orange-vibrant hover:border-orange-vibrant/30 transition-all flex flex-col items-center justify-center gap-1 group bg-orange-vibrant/5">
                         <Icons.Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Nouvelle Étape</span>
                    </button>
                </aside>

                {/* MAP AREA */}
                <main className="flex-1 relative flex flex-col">
                    <div className="flex-1 p-4">
                         <div className="w-full h-full premium-card rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-border-subtle">
                              <ExpeditionMap stages={stages} pickingMode={isPickingMode} onSelectPoint={handlePointPicked} />
                         </div>
                    </div>

                    {/* ELEVATION PROFILE */}
                    <div className="h-48 px-4 pb-4">
                         <div className="w-full h-full premium-card rounded-2xl p-6 relative group overflow-hidden">
                              <div className="flex items-center justify-between mb-6">
                                   <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Profil d&apos;Élévation Calculé</div>
                                   <div className="text-sm font-black text-orange-vibrant font-mono bg-orange-vibrant/5 px-3 py-1 rounded-lg ring-1 ring-orange-vibrant/20">
                                        {totalElev.toLocaleString()} m D+ Réel
                                   </div>
                              </div>
                              
                              <div className="relative h-24 w-full flex items-end gap-[2px]">
                                   {Array.from({ length: 120 }).map((_, i) => {
                                        const h = 20 + Math.sin(i * 0.1) * 30 + Math.cos(i * 0.05) * 20 + (i/2);
                                        return (
                                             <div key={i} className={cn("flex-1 rounded-t-sm transition-all duration-500", i < (stages.length * 10) ? "bg-gradient-to-t from-orange-vibrant to-orange-400 opacity-80" : "bg-gradient-to-t from-orange-vibrant/20 to-orange-vibrant/5")} style={{ height: `${h}%` }} />
                                        );
                                   })}
                              </div>
                         </div>
                    </div>
                </main>
            </div>

            {/* STAGE MODAL */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStageId ? "CONFIGURER L'ÉTAPE" : "NOUVELLE ÉTAPE"}>
                <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Coordonnées GPS</label>
                         <button onClick={() => { setIsModalOpen(false); setIsPickingMode(true); }} className="text-[10px] font-black uppercase text-orange-vibrant hover:underline">
                            {stageCoords ? `Fix: ${stageCoords[0].toFixed(4)}, ${stageCoords[1].toFixed(4)}` : "Pointer sur Carte..."}
                         </button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nom de l&apos;étape</label>
                        <input type="text" placeholder="Destination..." value={stageName} onChange={(e) => setStageName(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3 relative">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Altitude D+ (m)</label>
                            <input type="number" placeholder="Calcul..." value={stageElev} onChange={(e) => setStageElev(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                            {isFetchingElevation && <div className="absolute right-3 bottom-3 animate-spin border-2 border-orange-vibrant border-t-transparent rounded-full w-4 h-4" />}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Distance (km)</label>
                            <input type="number" placeholder="Calcul..." value={stageDist} onChange={(e) => setStageDist(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary">Annuler</button>
                        <button onClick={handleSaveStage} className="px-8 py-3 rounded-xl bg-orange-vibrant text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-vibrant/20 transition-all hover:scale-105 active:scale-95">
                            {editingStageId ? "Enregistrer" : "Confirmer"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}