"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { GearItemCard } from "@/components/pack";
import { GEAR_ITEMS, GEAR_CATEGORIES, getOwnedGear } from "@/lib/gear";

export default function GearPage() {
    const [view, setView] = useState<'table' | 'topshot' | 'analytics'>('table');
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showOwnedOnly, setShowOwnedOnly] = useState<boolean>(false);

    const filteredItems = useMemo(() => {
        let items = GEAR_ITEMS;
        if (showOwnedOnly) items = getOwnedGear(items);
        if (searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (activeCategory) {
            items = items.filter(item => item.category === activeCategory);
        }
        return items;
    }, [searchTerm, activeCategory, showOwnedOnly]);

    return (
        <div className="min-h-screen bg-bg-base transition-colors duration-300">
            {/* HEADER */}
            <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 sticky top-0 z-30 translate-z-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-text-primary tracking-tight">Mon Garage</h1>
                    <div className="h-4 w-[1px] bg-border-subtle" />
                    <nav className="flex items-center gap-1 p-1 rounded-lg bg-bg-surface-2 border border-border-subtle">
                        {(['table', 'topshot', 'analytics'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                                    view === v 
                                        ? "bg-bg-surface-1 text-accent-cyan shadow-sm ring-1 ring-border-subtle" 
                                        : "text-text-faint hover:text-text-muted"
                                )}
                            >
                                {v === 'table' ? 'Tableau' : v === 'topshot' ? 'Topshot' : 'Analytics'}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint group-focus-within:text-accent-cyan transition-colors" />
                        <input
                            type="text"
                            placeholder="RECHERCHER..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 bg-bg-surface-2 border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-[10px] font-black tracking-widest text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-accent-cyan/50 transition-all"
                        />
                    </div>
                    <button className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 text-accent-cyan hover:bg-accent-cyan/10 transition-colors">
                        <Icons.Plus className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Nouveau Item</span>
                    </button>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-slide-up">
                
                {/* GLOBAL STATS BAR */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Items', value: GEAR_ITEMS.length, icon: Icons.Archive, color: 'text-accent-cyan' },
                        { label: 'Poids Total', value: '184.2', unit: 'kg', icon: Icons.Activity, color: 'text-accent-orange' },
                        { label: 'Valeur Est.', value: '4.850', unit: '€', icon: Icons.TrendingUp, color: 'text-emerald-500' },
                        { label: 'En Prêt', value: '3', icon: Icons.User, color: 'text-accent-purple' },
                    ].map((stat, i) => (
                        <div key={i} className="premium-card p-6 rounded-2xl flex items-center justify-between group hover:translate-y-[-2px] transition-all">
                            <div>
                                <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                                <div className={cn("text-2xl font-black font-mono tracking-tighter", stat.color)}>
                                    {stat.value}{stat.unit && <span className="text-xs ml-0.5">{stat.unit}</span>}
                                </div>
                            </div>
                            <div className={cn("p-3 rounded-xl bg-bg-surface-3 transition-colors", `group-hover:${stat.color.replace('text-', 'bg-')}/10`)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                        </div>
                    ))}
                </div>

                {view === 'table' && (
                    <div className="space-y-6">
                        {/* CATEGORIES FILTERS */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                            <button
                                onClick={() => setActiveCategory("")}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                                    activeCategory === "" 
                                        ? "bg-accent-cyan text-bg-surface-1 shadow-lg shadow-accent-cyan/20" 
                                        : "bg-bg-surface-2 border border-border-subtle text-text-muted hover:border-text-faint"
                                )}
                            >
                                Tous
                            </button>
                            {GEAR_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2",
                                        activeCategory === cat.id 
                                            ? "bg-bg-surface-2 border border-accent-cyan text-accent-cyan shadow-sm" 
                                            : "bg-bg-surface-2 border border-border-subtle text-text-muted hover:border-text-faint"
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* ITEMS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredItems.map(item => (
                                <GearItemCard key={item.id} item={item} />
                            ))}
                        </div>

                        {filteredItems.length === 0 && (
                            <div className="premium-card rounded-2xl p-20 text-center flex flex-col items-center justify-center border-dashed border-2 border-border-default">
                                <Icons.Archive className="w-12 h-12 text-text-faint mb-4" />
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-widest">Aucun Item Trouvé</h3>
                                <p className="text-xs text-text-muted mt-2 font-bold uppercase tracking-widest">Essayez d&apos;ajuster vos filtres de recherche.</p>
                            </div>
                        )}
                    </div>
                )}

                {view === 'topshot' && (
                    <div className="premium-card rounded-2xl p-4 bg-bg-surface-1 border-border-default relative h-[800px] overflow-hidden group">
                        {/* Grid Pattern Background */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        
                        {/* Floating Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-bg-surface-2/80 backdrop-blur-md rounded-2xl p-4 ring-1 ring-border-subtle shadow-2xl">
                            <button className="p-2 bg-text-primary/5 hover:bg-text-primary/10 rounded-lg transition-colors"><Icons.Plus className="w-5 h-5 text-text-primary" /></button>
                            <div className="h-6 w-[1px] bg-border-subtle" />
                            <span className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase">Scale: 1.0</span>
                            <div className="h-6 w-[1px] bg-border-subtle" />
                            <button className="p-2 bg-bg-surface-2 rounded-lg border border-accent-cyan shadow-sm"><Icons.Layers className="w-5 h-5 text-accent-cyan" /></button>
                        </div>

                        {/* MOCK TOPSHOT CANVAS */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute top-1/4 left-1/3 transform -rotate-12 hover:scale-110 hover:z-30 transition-all cursor-grab active:cursor-grabbing">
                                <div className="premium-card w-48 h-64 rounded-xl p-4 bg-bg-surface-2 shadow-2xl overflow-hidden">
                                     <div className="h-40 bg-bg-surface-3 rounded-lg mb-4 flex items-center justify-center">
                                         <Icons.NavPack className="w-12 h-12 text-text-faint" />
                                     </div>
                                     <div className="text-[10px] font-black text-text-muted uppercase mb-1">Osprey Exos 48</div>
                                     <div className="text-[10px] font-bold text-accent-cyan font-mono">1.2 kg</div>
                                </div>
                            </div>

                            <div className="absolute top-1/2 right-1/4 transform rotate-6 hover:scale-110 transition-all z-10 cursor-grab active:cursor-grabbing">
                                <div className="premium-card w-40 h-56 rounded-xl p-4 bg-bg-surface-2 shadow-2xl overflow-hidden">
                                     <div className="h-32 bg-bg-surface-3 rounded-lg mb-4 flex items-center justify-center">
                                         <Icons.NavBasecamp className="w-10 h-10 text-text-faint" />
                                     </div>
                                     <div className="text-[10px] font-black text-text-muted uppercase mb-1">MSR Hubba NX</div>
                                     <div className="text-[10px] font-bold text-accent-cyan font-mono">0.8 kg</div>
                                </div>
                            </div>

                            <div className="absolute bottom-1/4 left-1/4 transform rotate-3 hover:scale-110 transition-all z-20 cursor-grab active:cursor-grabbing">
                                <div className="premium-card w-32 h-40 rounded-xl p-4 bg-bg-surface-2 shadow-2xl overflow-hidden">
                                     <div className="h-24 bg-bg-surface-3 rounded-lg mb-2 flex items-center justify-center">
                                         <Icons.Zap className="w-8 h-8 text-text-faint" />
                                     </div>
                                     <div className="text-[9px] font-black text-text-muted uppercase mb-0.5">Garmin InReach</div>
                                     <div className="text-[9px] font-bold text-accent-cyan font-mono">0.1 kg</div>
                                </div>
                            </div>

                            {/* View Label */}
                            <div className="absolute top-8 left-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-accent-cyan text-bg-surface-1 rounded-xl shadow-lg ring-4 ring-accent-cyan/20">
                                        <Icons.Layers className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Mode de Visualisation</div>
                                        <div className="text-xl font-black text-text-primary tracking-tight">Topshot Studio</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}