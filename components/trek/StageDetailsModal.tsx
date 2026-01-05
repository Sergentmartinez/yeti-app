"use client";

import { Stage, POI, TrekTheme } from '@/types';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { StageProfile3DStatic } from './StageProfile3DStatic'; 

interface StageDetailsModalProps {
    stage: Stage | null;
    trekTheme: TrekTheme;
    onClose: () => void;
}

export const StageDetailsModal = ({ stage, trekTheme, onClose }: StageDetailsModalProps) => {
    const [activePoi, setActivePoi] = useState<POI | null>(null);

    useEffect(() => {
        if (stage?.pois && stage.pois.length > 0) setActivePoi(stage.pois[0]);
    }, [stage]);

    if (!stage) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl transform transition-all scale-100 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* --- HEADER (Points supprimés ici) --- */}
                <div className="p-6 bg-[#242428] flex justify-between items-start text-white relative overflow-hidden shrink-0">
                    
                    {/* ✅ B/ Suppression des petits points d'arrière-plan */}
                    {/* <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:16px_16px]"></div> */}

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={cn("px-2 py-0.5 text-xs font-bold uppercase tracking-widest rounded-md bg-white/10 border border-white/5", trekTheme === 'spirit' ? "text-blue-400" : "text-orange-400")}>
                                {stage.code}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight leading-none mb-1">{stage.title}</h2>
                        
                        <div className="flex items-center gap-4 text-xs font-medium text-stone-400 mt-2 font-mono uppercase tracking-wide">
                            <span className="flex items-center gap-1"><Icons.StatsDistance className="w-3 h-3"/> {stage.stats.dist} km</span>
                            <span className="flex items-center gap-1"><Icons.StatsElevation className="w-3 h-3"/> +{stage.stats.dplus} m</span>
                            <span className="flex items-center gap-1"><Icons.StatsDuration className="w-3 h-3"/> {stage.stats.duration?.replace('h','h')}</span>
                        </div>
                    </div>
                    
                    <button onClick={onClose} className="text-stone-400 hover:text-white hover:bg-white/10 transition-colors p-2 rounded-full cursor-pointer z-50">
                        <Icons.Close className="w-6 h-6" />
                    </button>
                </div>

                {/* --- CORPS --- */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-50 custom-scrollbar">
                    
                    {/* ZONE 3D */}
                    <div className="mb-8 h-[400px] shadow-sm rounded-xl overflow-hidden border border-stone-200 bg-white relative group">
                         {stage.track ? (
                             <StageProfile3DStatic 
                                track={stage.track} 
                                pois={stage.pois || []} 
                                theme={trekTheme} 
                                activePoi={activePoi} 
                                onPoiClick={setActivePoi} 
                             />
                         ) : (
                             <div className="h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100/50">
                                <Icons.MapPin className="w-10 h-10 mb-2 opacity-20" />
                                <span>Pas de données GPS disponibles</span>
                             </div>
                         )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            
                            <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm">
                                <h3 className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                                    <Icons.Info className="w-3 h-3" /> À propos de l&apos;étape
                                </h3>
                                <p className="text-stone-700 text-sm md:text-base leading-relaxed">
                                    {stage.description || "Aucune description détaillée pour cette étape."}
                                </p>
                            </div>

                            {stage.pois && stage.pois.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-widest px-1">Points de Passage</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {stage.pois.map((poi, index) => (
                                            <button 
                                                key={index} 
                                                onClick={() => setActivePoi(poi)}
                                                className={cn(
                                                    "px-3 py-2 text-xs rounded-lg font-bold transition-all border text-left flex items-center gap-2 group", 
                                                    activePoi?.label === poi.label 
                                                        ? "bg-stone-800 text-white border-stone-800 shadow-lg scale-105" 
                                                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                                                )}
                                            >
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full ring-2 ring-white", 
                                                    poi.type === 'danger' ? 'bg-red-500' : 'bg-stone-400 group-hover:bg-stone-600'
                                                )}></span>
                                                {poi.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-0">
                                <h3 className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-widest px-1">Détail du Point</h3>
                                <div className={cn(
                                    "p-6 bg-white rounded-xl border shadow-sm min-h-[180px] flex flex-col justify-center transition-all duration-300",
                                    activePoi ? "border-stone-200" : "border-stone-100 border-dashed bg-stone-50/50"
                                )}>
                                    {activePoi ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <span className={cn(
                                                        "text-[10px] uppercase font-bold px-2 py-1 rounded mb-2 inline-block", 
                                                        activePoi.type === 'danger' ? "bg-red-100 text-red-600" : "bg-stone-100 text-stone-500"
                                                    )}>
                                                        {activePoi.type || 'Point'}
                                                    </span>
                                                    <h4 className="text-xl font-bold text-stone-900 leading-tight">{activePoi.label}</h4>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                                                {activePoi.type === 'refuge' ? "Hébergement gardé. Restauration chaude et bivouac possibles." : 
                                                 activePoi.type === 'danger' ? "Passage technique équipé de chaînes." :
                                                 "Point d&apos;intérêt remarquable sur l&apos;itinéraire."}
                                            </p>
                                            
                                            {activePoi.alt && (
                                                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                                                    <Icons.StatsElevation className="w-3 h-3"/> 
                                                    Altitude: ~{Math.round(activePoi.alt)}m
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center text-stone-400">
                                            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Icons.MapPin className="w-5 h-5 opacity-30" />
                                            </div>
                                            <p className="text-sm font-medium">Sélectionnez un point<br/>sur la carte 3D</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-[#242428] text-white font-bold rounded-xl hover:bg-black transition-all shadow-md active:scale-95">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StageDetailsModal;