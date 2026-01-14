"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
    LayoutDashboard, 
    Mountain, 
    Package, 
    TrendingUp, 
    Euro, 
    ArrowRight,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Settings,
    Bell,
    Box,
    Globe
} from "lucide-react";
import { useYetiStore } from "@/lib/store/useYetiStore";
import { Logo } from "@/components/Logo";

export default function BasecampPage() {
    const { 
        projects, 
        currentProjectId,
        selectedTrekName,
        selectedTrekSlug,
        getGlobalStats,
        getBaseWeight,
        daysUntilDeparture,
        packedItems
    } = useYetiStore();

    // Use hydration fix
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    // === GLOBAL STATS ===
    const stats = getGlobalStats();
    
    // === ACTIVE MISSION (Focus) ===
    // Priority: Project selected -> First active project -> Default
    const activeProject = projects.find(p => p.id === currentProjectId) || projects[0];
    const baseWeight = getBaseWeight();
    
    // Mock Logic for missing items (similar to user logic)
    const missingItemsCount = Math.max(0, 34 - packedItems.length);
    const budgetTotal = packedItems.reduce((acc, i) => acc + i.price, 0);
    const score = 85; 

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            
            {/* === HEADER === */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/95 glass">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase overflow-hidden">
                            <LayoutDashboard className="w-3 h-3" />
                            Command Center
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* === GLOBAL KPIs (GRID 4) === */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Distance */}
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Distance Cumulée</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">{stats.totalDistance}</span>
                            <span className="text-sm font-bold text-zinc-500">km</span>
                        </div>
                    </div>

                    {/* D+ */}
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Dénivelé Cumulé</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">{(stats.totalElevation / 1000).toFixed(1)}</span>
                            <span className="text-sm font-bold text-zinc-500">km+</span>
                        </div>
                    </div>

                    {/* Inventory Value */}
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Valeur Inventaire</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">{stats.totalGearValue}</span>
                            <span className="text-sm font-bold text-zinc-500">€</span>
                        </div>
                    </div>

                    {/* Items Count */}
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Items Stockés</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">{stats.totalGearCount}</span>
                            <span className="text-sm font-bold text-zinc-500">refs</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* === FOCUS MISSION (ACCENT CARD) === */}
                    <div className="md:col-span-2 rounded-3xl overflow-hidden bg-zinc-900 relative group border border-zinc-800 hover:border-orange-500/30 transition-all">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <Image
                                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200"
                                alt="Focus Mission"
                                fill
                                className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                        </div>

                        <div className="relative p-8 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">FOCUS MISSION</div>
                                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
                                            {activeProject?.trekName || "Aucun projet"}
                                        </h2>
                                        <div className="flex items-center gap-3 text-zinc-400">
                                            <span className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded text-sm">
                                                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                                                Départ J-{daysUntilDeparture || 30}
                                            </span>
                                            <span className="text-sm">•</span>
                                            <span className="text-sm">En préparation</span>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-900/80 backdrop-blur rounded-2xl px-4 py-2 border border-white/5 text-center">
                                        <div className="text-2xl font-black text-white">{score}%</div>
                                        <div className="text-[10px] uppercase font-bold text-zinc-500">Score</div>
                                    </div>
                                </div>

                                {/* Mission Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Poids Base</div>
                                        <div className="font-mono font-bold text-lg">{baseWeight.toFixed(1)}kg</div>
                                    </div>
                                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Manquants</div>
                                        <div className={`font-mono font-bold text-lg ${missingItemsCount > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                                            {missingItemsCount}
                                        </div>
                                    </div>
                                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Budget</div>
                                        <div className="font-mono font-bold text-lg">{budgetTotal}€</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Link 
                                    href="/app/pack" 
                                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl text-center transition shadow-lg shadow-orange-900/20"
                                >
                                    Ouvrir Pack Builder
                                </Link>
                                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition backdrop-blur-sm">
                                    Check IA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* === QUICK NAVIGATION (Cards) === */}
                    <div className="flex flex-col gap-4">
                        
                        {/* Locker / Garage */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold">Locker</h3>
                                <Link 
                                    href="/app/garage" 
                                    className="text-xs font-bold bg-zinc-800 px-3 py-1.5 rounded-lg hover:bg-white hover:text-black transition"
                                >
                                    Gérer
                                </Link>
                            </div>
                            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                                Votre inventaire contient <span className="text-white font-bold">{stats.totalGearCount} références</span> prêtes à être déployées.
                            </p>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[75%]" />
                            </div>
                        </div>

                        {/* Catalogue */}
                         <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold">Catalogue</h3>
                                <Link 
                                    href="/app/select-trek" 
                                    className="text-xs font-bold bg-zinc-800 px-3 py-1.5 rounded-lg hover:bg-white hover:text-black transition"
                                >
                                    Explorer
                                </Link>
                            </div>
                             <p className="text-sm text-zinc-400 leading-relaxed">
                                <span className="text-white font-bold">6 treks</span> cartographiés disponibles pour votre prochaine aventure.
                            </p>
                        </div>

                        {/* Projects */}
                         <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold">Projets</h3>
                                <button className="text-xs font-bold bg-zinc-800 px-3 py-1.5 rounded-lg hover:bg-white hover:text-black transition">
                                    Voir tout
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {projects.slice(0, 3).map(p => (
                                    <span key={p.id} className="text-xs font-bold bg-zinc-800/50 border border-zinc-700 px-2.5 py-1 rounded text-zinc-300">
                                        {p.trekName}
                                    </span>
                                ))}
                                {projects.length === 0 && <span className="text-xs text-zinc-500">Aucun projet</span>}
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}

// Stats helper
const getTotal = (items: any[]) => {
    // ...
}
