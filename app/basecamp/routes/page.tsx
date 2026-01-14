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
    elev: string; // This is D+ for the stage
    absElev: string; // Absolute elevation for the chart
    status: 'completed' | 'active' | 'pending';
    coords?: [number, number];
}

const INITIAL_STAGES: Stage[] = [
  { id: 1, name: "Calenzana", dist: "0", elev: "0", absElev: "300", status: "completed", coords: [42.5083, 8.8556] },
  { id: 2, name: "Ortu di u Piobbu", dist: "10.5", elev: "1310", absElev: "1550", status: "completed", coords: [42.4167, 8.8833] },
  { id: 3, name: "Carozzu", dist: "7.2", elev: "650", absElev: "1270", status: "completed", coords: [42.3667, 8.9167] },
  { id: 4, name: "Asco Stagnu", dist: "4.8", elev: "780", absElev: "1422", status: "active", coords: [42.3333, 8.8667] },
  { id: 5, name: "Tighjettu", dist: "8.5", elev: "1050", absElev: "1683", status: "active", coords: [42.3000, 8.9000] },
  { id: 6, name: "Ciottulu di i Mori", dist: "6.2", elev: "620", absElev: "1991", status: "active", coords: [42.2611, 8.9222] },
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
    const [stageAbsElev, setStageAbsElev] = useState("");
    const [stageDist, setStageDist] = useState("");

    // --- LOGIC: Fetch Real Elevation from API ---
    const fetchRealElevation = async (lat: number, lng: number) => {
        setIsFetchingElevation(true);
        try {
            const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
            const data = await res.json();
            if (data.results && data.results[0]) {
                const absoluteElevation = Math.round(data.results[0].elevation);
                setStageAbsElev(absoluteElevation.toString());
                
                const lastStage = [...stages].reverse().find(s => s.coords && (editingStageId ? s.id !== editingStageId : true));
                if (lastStage && lastStage.absElev) {
                    const gain = Math.max(0, absoluteElevation - parseInt(lastStage.absElev)); 
                    setStageElev(gain.toString());
                } else {
                    setStageElev("0");
                }
            }
        } catch (error) {
            console.error("Elevation API failed", error);
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
        } else {
            setStageDist("0");
        }
    };

    const handlePointPicked = (lat: number, lng: number) => {
        setStageCoords([lat, lng]);
        calculateDistance(lat, lng);
        fetchRealElevation(lat, lng);
        setIsPickingMode(false);
        setIsModalOpen(true);
    };

    const downloadGPX = () => {
        const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="YETI PWA" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Mon Itinéraire Tactique</name>
    <trkseg>
      ${stages.filter(s => s.coords).map(s => `
      <trkpt lat="${s.coords![0]}" lon="${s.coords![1]}">
        <ele>${s.absElev}</ele>
        <name>${s.name}</name>
      </trkpt>`).join('')}
    </trkseg>
  </trk>
</gpx>`;
        const blob = new Blob([gpx], { type: 'application/gpx+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'itineraire_yeti.gpx';
        a.click();
    };

    const openEditModal = (id: number) => {
        const s = stages.find(x => x.id === id);
        if (s) {
            setEditingStageId(id);
            setStageName(s.name);
            setStageElev(s.elev);
            setStageAbsElev(s.absElev);
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
        setStageAbsElev("");
        setStageDist("");
        setIsModalOpen(true);
    };

    const handleSaveStage = () => {
        if (!stageName) return;

        const stageData = {
            name: stageName,
            elev: stageElev || "0",
            absElev: stageAbsElev || "0",
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
    const totalDist = useMemo(() => stages.reduce((acc, curr) => acc + parseFloat(curr.dist || "0"), 0).toFixed(1), [stages]);

    // Data for elevation chart
    const chartPoints = useMemo(() => {
        if (stages.length === 0) return [];
        // Extract absolute elevations
        return stages.map(s => parseInt(s.absElev || "0"));
    }, [stages]);

    const maxAbsElev = Math.max(...chartPoints, 3000);

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
                    <div className="absolute left-1/2 -translate-x-1/2 px-6 py-2 bg-orange-vibrant text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl animate-pulse z-50 ring-4 ring-orange-vibrant/20">
                        Cliquez sur la carte pour définir l&apos;étape
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={downloadGPX}
                        className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-vibrant hover:bg-emerald-vibrant/10 transition-colors"
                    >
                        <Icons.Download className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Exporter GPX</span>
                    </button>
                    <button className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-cyan-vibrant hover:bg-cyan-vibrant/10 transition-colors">
                        <Icons.Share className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Partager</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* STAGES SIDEBAR */}
                <aside className="w-80 border-r border-border-subtle bg-bg-surface-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em]">Flux d&apos;étapes</div>
                        <div className="text-[10px] font-bold text-text-muted bg-bg-surface-3 px-2 py-0.5 rounded">{totalDist} km total</div>
                    </div>
                    
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
                                        {stage.coords ? "GPS OK" : "Draft"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black font-mono text-text-primary bg-bg-surface-3 px-1.5 py-0.5 rounded shadow-sm">{stage.dist} km</span>
                                        <button onClick={(e) => { e.stopPropagation(); openEditModal(stage.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-orange-vibrant"><Icons.PlusCircle className="w-3 h-3 rotate-45" /></button>
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold tracking-tight mb-1 text-text-primary">{stage.name}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-black text-cyan-vibrant uppercase tracking-wider flex items-center gap-1.5">
                                        <Icons.StatsElevation className="w-3 h-3" />
                                        +{stage.elev}m
                                    </div>
                                    <div className="text-[9px] font-bold text-text-faint uppercase">{stage.absElev}m alt.</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={openAddModal} className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-border-default text-text-faint hover:text-orange-vibrant hover:border-orange-vibrant/30 transition-all flex flex-col items-center justify-center gap-1 group bg-orange-vibrant/5">
                         <Icons.Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Nouvelle Étape Tactique</span>
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
                              <div className="flex items-center justify-between mb-4">
                                   <div className="flex items-center gap-3">
                                        <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Profil d&apos;Élévation Tactique</div>
                                        <div className="h-4 w-[1px] bg-border-subtle" />
                                        <div className="text-[10px] font-bold text-text-faint uppercase">Basé sur API Relief</div>
                                   </div>
                                   <div className="text-sm font-black text-orange-vibrant font-mono bg-orange-vibrant/5 px-3 py-1 rounded-lg ring-1 ring-orange-vibrant/20">
                                        {totalElev.toLocaleString()} m D+ Total
                                   </div>
                              </div>
                              
                              <div className="relative h-24 w-full flex items-end gap-1 px-2">
                                   {chartPoints.map((elev, i) => {
                                        const h = (elev / maxAbsElev) * 100;
                                        return (
                                             <div 
                                                key={i} 
                                                className={cn(
                                                    "flex-1 rounded-t-md transition-all duration-700 min-w-[20px]",
                                                    i < stages.length 
                                                        ? "bg-gradient-to-t from-orange-vibrant/40 to-orange-vibrant shadow-[0_-4px_12px_rgba(249,115,22,0.2)]" 
                                                        : "bg-bg-surface-4"
                                                )} 
                                                style={{ height: `${Math.max(10, h)}%` }}
                                             >
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-surface-1 px-2 py-1 rounded border border-border-subtle text-[9px] font-black text-text-primary pointer-events-none whitespace-nowrap whitespace-nowrap">
                                                    {elev}m
                                                </div>
                                             </div>
                                        );
                                   })}
                                   {/* Interpolation bars for visual richness */}
                                   {chartPoints.length > 1 && Array.from({ length: Math.max(0, 15 - chartPoints.length) }).map((_, i) => (
                                        <div key={`filler-${i}`} className="flex-1 bg-bg-surface-4 rounded-t-md h-4 opacity-30" />
                                   ))}
                              </div>
                              <div className="mt-4 flex justify-between text-[9px] font-black text-text-faint uppercase tracking-widest px-2">
                                     <span>{stages[0]?.name || "Départ"}</span>
                                     <span>{stages[stages.length - 1]?.name || "Arrivée"}</span>
                              </div>
                         </div>
                    </div>
                </main>
            </div>

            {/* STAGE MODAL */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStageId ? "CONFIGURATION ÉTAPE" : "NOUVELLE ÉTAPE"}>
                <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-bg-surface-2 border border-border-subtle group cursor-pointer hover:border-orange-vibrant/30 transition-all" onClick={() => { setIsModalOpen(false); setIsPickingMode(true); }}>
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-orange-vibrant/10 flex items-center justify-center">
                                 <Icons.MapPin className="w-4 h-4 text-orange-vibrant" />
                             </div>
                             <div>
                                 <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Localisation GPS</div>
                                 <div className="text-xs font-bold text-text-primary">
                                     {stageCoords ? `${stageCoords[0].toFixed(4)}, ${stageCoords[1].toFixed(4)}` : "Cliquer pour pointer sur carte"}
                                 </div>
                             </div>
                         </div>
                         <Icons.ChevronRight className="w-4 h-4 text-text-faint group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nom / Destination</label>
                        <input type="text" placeholder="Refuge, Col, Village..." value={stageName} onChange={(e) => setStageName(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Altitude (m)</label>
                            <div className="relative">
                                <input type="number" placeholder="Alt." value={stageAbsElev} onChange={(e) => setStageAbsElev(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                                {isFetchingElevation && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin border-2 border-orange-vibrant border-t-transparent rounded-full w-4 h-4" />}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Gain D+ (m)</label>
                            <input type="number" placeholder="Gain" value={stageElev} onChange={(e) => setStageElev(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Dist. (km)</label>
                            <input type="number" placeholder="Dist" value={stageDist} onChange={(e) => setStageDist(e.target.value)} className="w-full bg-bg-surface-3 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-orange-vibrant/30" />
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 pt-4 border-t border-border-subtle mt-6">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)} 
                            className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary"
                        >
                            Annuler
                        </button>
                        <button 
                            type="button"
                            onClick={handleSaveStage} 
                            className="px-8 py-3 rounded-xl bg-orange-vibrant text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-vibrant/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {editingStageId ? "Mettre à jour" : "Ajouter au flux"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}