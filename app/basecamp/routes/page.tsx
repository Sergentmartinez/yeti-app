// app/basecamp/routes/page.tsx
"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

// Port dynamiquement la map pour éviter les erreurs SSR de Leaflet
const ExpeditionMap = dynamic(() => import('@/components/maps/ExpeditionMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-bg-surface-2 animate-pulse flex items-center justify-center rounded-2xl">
      <Icons.Map className="w-12 h-12 text-text-faint" />
    </div>
  )
});

const STAGES = [
  { id: 1, name: "Calenzana → Ortu di u Piobbu", dist: "10.5 km", elev: "+1550m", status: "completed" },
  { id: 2, name: "Ortu di u Piobbu → Carozzu", dist: "7.2 km", elev: "+650m", status: "completed" },
  { id: 3, name: "Carozzu → Asco Stagnu", dist: "4.8 km", elev: "+780m", status: "active" },
  { id: 4, name: "Asco Stagnu → Tighjettu", dist: "8.5 km", elev: "+1050m", status: "pending" },
  { id: 5, name: "Tighjettu → Ciottulu", dist: "6.2 km", elev: "+620m", status: "pending" },
  { id: 6, name: "Ciottulu → Manganu", dist: "14.5 km", elev: "+650m", status: "pending" },
];

export default function ItineraryPage() {
    const [activeStage, setActiveStage] = useState(3);

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
                        {STAGES.map((stage) => (
                            <div
                                key={stage.id}
                                onClick={() => setActiveStage(stage.id)}
                                className={cn(
                                    "p-4 rounded-xl cursor-pointer transition-all border",
                                    activeStage === stage.id
                                        ? "bg-bg-surface-2 border-cyan-vibrant/50 shadow-lg shadow-cyan-vibrant/5 scale-[1.02]"
                                        : "bg-transparent border-transparent hover:bg-bg-surface-3"
                                )}
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
                                    <span className="text-[10px] font-black font-mono text-text-faint">{stage.dist}</span>
                                </div>
                                <h4 className={cn(
                                  "text-sm font-bold tracking-tight",
                                  activeStage === stage.id ? "text-text-primary" : "text-text-muted"
                                )}>{stage.name}</h4>
                                <div className="mt-2 text-[10px] font-black text-cyan-vibrant uppercase tracking-widest">{stage.elev} D+</div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-border-default text-text-faint hover:text-text-muted hover:border-text-faint transition-all flex flex-col items-center justify-center gap-1 group">
                         <Icons.Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Ajouter une variante</span>
                    </button>
                </aside>

                {/* MAP AREA */}
                <main className="flex-1 relative flex flex-col">
                    <div className="flex-1 p-4">
                         <div className="w-full h-full premium-card rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-border-subtle">
                              <ExpeditionMap />
                              
                              {/* Overlays */}
                              <div className="absolute top-6 left-6 z-10 space-y-3">
                                   <div className="premium-card p-4 rounded-xl bg-bg-surface-1/80 backdrop-blur-md border-border-subtle flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-vibrant flex items-center justify-center shadow-lg shadow-cyan-vibrant/20">
                                             <Icons.NavRoutes className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                             <div className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Position Actuelle</div>
                                             <div className="text-sm font-black text-text-primary tracking-tight">Refuge d&apos;Asco Stagnu</div>
                                        </div>
                                   </div>
                              </div>

                              <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                                   <button className="w-10 h-10 premium-card rounded-xl flex items-center justify-center text-text-muted hover:text-cyan-vibrant transition-colors bg-bg-surface-1/80 backdrop-blur-md"><Icons.Plus className="w-5 h-5" /></button>
                                   <button className="w-10 h-10 premium-card rounded-xl flex items-center justify-center text-text-muted hover:text-cyan-vibrant transition-colors bg-bg-surface-1/80 backdrop-blur-md"><Icons.Plus className="w-5 h-5 rotate-45" /></button>
                              </div>
                         </div>
                    </div>

                    {/* ELEVATION PROFILE */}
                    <div className="h-48 px-4 pb-4">
                         <div className="w-full h-full premium-card rounded-2xl p-6 relative group overflow-hidden">
                              <div className="flex items-center justify-between mb-4">
                                   <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em]">Profil d&apos;Élévation Global</div>
                                   <div className="text-xs font-black text-cyan-vibrant font-mono">11,000 m D+ Total</div>
                              </div>
                              
                              {/* Mock Elevation Chart */}
                              <div className="relative h-20 w-full flex items-end gap-[2px]">
                                   {Array.from({ length: 120 }).map((_, i) => {
                                        const h = 20 + Math.sin(i * 0.1) * 30 + Math.cos(i * 0.05) * 20 + (i/2);
                                        return (
                                             <div 
                                                key={i} 
                                                className={cn(
                                                    "flex-1 bg-cyan-vibrant/20 rounded-t-sm transition-all duration-500 hover:bg-cyan-vibrant group-hover:opacity-100",
                                                    i === 45 ? "bg-orange-vibrant animate-pulse" : "opacity-40"
                                                )} 
                                                style={{ height: `${h}%` }} 
                                             />
                                        );
                                   })}
                                   {/* Active Marker on chart */}
                                   <div className="absolute bottom-0 left-[37.5%] top-0 w-[2px] bg-orange-vibrant shadow-[0_0_12px_rgba(249,115,22,0.5)] z-20" />
                              </div>

                              <div className="mt-4 flex justify-between text-[9px] font-black text-text-faint uppercase tracking-widest">
                                   <span>Calenzana (0 km)</span>
                                   <span>Asco (32 km)</span>
                                   <span>Vizzavona (90 km)</span>
                                   <span>Conca (180 km)</span>
                              </div>
                         </div>
                    </div>
                </main>
            </div>
        </div>
    );
}