"use client";

import Image from "next/image";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function MissionControlPage() {
    return (
        <div className="min-h-screen bg-bg-base transition-colors duration-300">
            {/* HEADER */}
            <header className="h-14 border-b border-border-subtle flex items-center justify-between px-6 bg-bg-surface-2/80 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <Icons.TrendingUp className="w-5 h-5 text-accent-cyan" />
                    <h1 className="text-lg font-black text-text-primary tracking-tight">Mission Control</h1>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted font-medium">
                    <span>Dernière synchro : Il y a 5 min</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <Icons.Settings className="w-4 h-4 cursor-pointer hover:text-text-primary transition-colors" />
                    </div>
                </div>
            </header>

            <div className="p-6 max-w-[1300px] mx-auto space-y-6">
                
                {/* TOP STATS CARD */}
                <section className="premium-card rounded-2xl overflow-hidden flex relative bg-bg-surface-1 shadow-2xl">
                    <div className="flex-1 p-8 z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Icons.TrendingUp className="w-4 h-4 text-accent-cyan" />
                            <span className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Expedition Overview</span>
                        </div>
                        <div className="grid grid-cols-4 gap-8">
                            <div className="border-r border-border-subtle pr-8">
                                <div className="text-4xl font-black text-text-primary">2</div>
                                <div className="text-xs font-black text-text-muted uppercase tracking-widest mt-2 font-mono">Projets actifs</div>
                            </div>
                            <div className="border-r border-border-subtle pr-8">
                                <div className="text-4xl font-black text-text-primary">18,4<span className="text-lg font-bold text-text-muted ml-1">kg</span></div>
                                <div className="text-xs font-black text-text-muted uppercase tracking-widest mt-2 font-mono">Pack actuel</div>
                            </div>
                            <div className="border-r border-border-subtle pr-8">
                                <div className="text-4xl font-black text-text-primary">J-22</div>
                                <div className="text-xs font-black text-text-muted uppercase tracking-widest mt-2 font-mono">Départ prévu</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-accent-cyan drop-shadow-[0_0_10px_rgba(138,180,248,0.2)]">87<span className="text-lg font-bold text-text-muted ml-1">/100</span></div>
                                <div className="text-xs font-black text-text-muted uppercase tracking-widest mt-2 font-mono">Score Sherpa</div>
                            </div>
                        </div>
                    </div>
                    {/* Visual Background */}
                     <div className="w-[320px] relative hidden lg:block overflow-hidden">
                        <Image 
                            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80" 
                            alt="Mountains" 
                            fill 
                            className="object-cover opacity-80"
                        />
                         {/* Gradient adaptation for shared themes */}
                        <div className="absolute inset-0 bg-gradient-to-r from-bg-surface-1 via-transparent to-transparent" />
                    </div>
                </section>

                {/* MIDDLE ROW: Actions + Projects */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Actions */}
                    <section className="col-span-4 premium-card rounded-2xl p-6 bg-bg-surface-1">
                        <div className="flex items-center gap-2 mb-6">
                            <Icons.AlertTriangle className="w-4 h-4 text-accent-orange" />
                            <span className="text-xs font-black text-text-secondary uppercase tracking-[0.2em]">Actions Immédiates</span>
                        </div>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-bg-surface-2 transition-colors cursor-pointer group">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent-orange mt-1.5 shrink-0 shadow-[0_0_8px_rgba(255,171,64,0.4)]" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-text-primary group-hover:text-accent-orange transition-colors">Réserver refuges J5-J8</span>
                                        <span className="text-[10px] font-black text-text-muted bg-bg-surface-3 px-2.5 py-1 rounded-md border border-border-subtle uppercase tracking-wider font-mono">GR20</span>
                                    </div>
                                    <span className="text-xs text-text-muted mt-1 block">Logistique Critique</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-bg-surface-2 transition-colors cursor-pointer group">
                                <div className="w-2.5 h-2.5 rounded-full bg-text-muted mt-1.5 shrink-0" />
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-text-primary">Commander cartouches gaz</span>
                                    <div className="text-xs text-text-muted mt-1">Consommables</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-bg-surface-2 transition-colors cursor-pointer group border border-emerald-500/10 bg-emerald-500/5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-text-primary">Tester matériel neuf</span>
                                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 uppercase tracking-wider font-mono">Validé</span>
                                    </div>
                                    <span className="text-xs text-text-muted mt-1 block">Check-list Matériel</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Project Cards */}
                    <div className="col-span-8 grid grid-cols-2 gap-6">
                        {/* GR20 Card */}
                        <div className="premium-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-all group cursor-pointer bg-bg-surface-1 border-2 border-transparent hover:border-accent-cyan/20">
                            <div className="h-32 relative">
                                <Image 
                                    src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80" 
                                    alt="GR20" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-5 text-white font-black text-xl tracking-tight drop-shadow-lg">GR20 Nord — Sud</div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black text-text-muted uppercase tracking-widest">Progression</span>
                                    <span className="text-xs font-black text-text-primary font-mono">3 / 22 étapes</span>
                                </div>
                                <div className="h-2 bg-bg-surface-3 rounded-full overflow-hidden mb-4 ring-1 ring-border-subtle">
                                    <div className="h-full bg-gradient-to-r from-accent-orange to-orange-400 rounded-full shadow-[0_0_8px_rgba(255,171,64,0.4)]" style={{ width: '14%' }} />
                                </div>
                                <div className="flex justify-between items-center text-xs font-black">
                                    <span className="flex items-center gap-1.5 text-text-muted"><Icons.Archive className="w-4 h-4 text-accent-cyan" /> Pack: 9,4 kg</span>
                                    <span className="bg-accent-cyan/10 text-accent-cyan px-2.5 py-1 rounded-md border border-accent-cyan/20 font-mono">J-22</span>
                                </div>
                            </div>
                        </div>

                        {/* West Highland Way Card */}
                        <div className="premium-card rounded-2xl overflow-hidden opacity-60 hover:opacity-100 transition-all grayscale hover:grayscale-0 cursor-pointer bg-bg-surface-1 group border-2 border-transparent hover:border-emerald-500/20">
                            <div className="h-32 relative">
                                <Image 
                                    src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80" 
                                    alt="West Highland Way" 
                                    fill 
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute bottom-4 left-5 text-white font-black text-xl tracking-tight drop-shadow-lg">West Highland Way</div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                     <span className="text-xs font-black text-text-muted uppercase tracking-widest">Statut</span>
                                    <span className="text-xs font-black text-text-primary font-mono">100% Complet</span>
                                </div>
                                <div className="flex justify-between items-center mt-5">
                                    <span className="text-base font-black text-text-primary">28,5 kg</span>
                                    <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20 uppercase tracking-widest font-mono">Terminé</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: Equipement (x2) + Sherpa Insights */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Équipement Left */}
                    <section className="col-span-5 premium-card rounded-2xl p-6 bg-bg-surface-1">
                        <div className="flex items-center gap-2 mb-6">
                            <Icons.Archive className="w-4 h-4 text-accent-cyan" />
                            <span className="text-xs font-black text-text-secondary uppercase tracking-[0.2em]">Analytique Équipement</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            {[
                                { val: '62', lab: 'Items' },
                                { val: '18,4', lab: 'Total kg' },
                                { val: '8', lab: 'À trier' },
                                { val: '12,2', lab: 'Base kg' },
                            ].map((s, i) => (
                                <div key={i} className="text-center p-3 rounded-xl bg-bg-surface-2 border border-border-subtle group hover:border-accent-cyan/30 transition-colors">
                                    <div className="text-base font-black text-text-primary truncate">{s.val}</div>
                                    <div className="text-[10px] font-bold text-text-muted uppercase truncate tracking-wider mt-1">{s.lab}</div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {[
                                { c: 'bg-emerald-500', l: 'Shelter', w: '3.2 kg' },
                                { c: 'bg-accent-blue', l: 'Sleep', w: '2.1 kg' },
                                { c: 'bg-accent-orange', l: 'Cooking', w: '1.4 kg' },
                                { c: 'bg-accent-purple', l: 'Divers', w: '6.3 kg' },
                            ].map((cat, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className={cn("w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125 shadow-lg", cat.c)} />
                                    <span className="text-sm font-bold text-text-secondary flex-1 group-hover:text-text-primary transition-colors">{cat.l}</span>
                                    <span className="text-xs font-black text-text-muted font-mono">{cat.w}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-5 border-t border-border-subtle">
                            <div className="flex items-center gap-2 mb-4">
                                <Icons.Zap className="w-3.5 h-3.5 text-accent-cyan" />
                                <span className="text-xs font-black text-text-secondary uppercase tracking-[0.15em]">Statut Stratégique</span>
                            </div>
                            <div className="h-2 bg-bg-surface-3 rounded-full overflow-hidden ring-1 ring-border-subtle">
                                <div className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue w-2/3 shadow-[0_0_10px_rgba(138,180,248,0.4)]" />
                            </div>
                        </div>
                    </section>

                    {/* Équipement Right + Sherpa Insights */}
                    <section className="col-span-7 premium-card rounded-2xl p-6 bg-bg-surface-1">
                        <div className="flex items-center gap-2 mb-6">
                            <Icons.Menu className="w-4 h-4 text-accent-cyan" />
                            <span className="text-xs font-black text-text-secondary uppercase tracking-[0.2em]">Détails par Catégorie</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { l: 'Shelter & Tents', cur: '3.2 kg', tot: 'Target: 3.0 kg', status: 'over' },
                                { l: 'Sleep System', cur: '2.1 kg', tot: 'Target: 2.5 kg', status: 'ok' },
                                { l: 'Cooking & Fuel', cur: '1.4 kg', tot: 'Target: 1.2 kg', status: 'over' },
                                { l: 'Divers & Security', cur: '6.3 kg', tot: 'Target: 7.0 kg', status: 'ok' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-5 p-3.5 rounded-xl hover:bg-bg-surface-2 transition-all cursor-pointer group border border-transparent hover:border-border-subtle">
                                    <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary flex-1">{item.l}</span>
                                    <span className={cn(
                                        "text-xs font-black font-mono",
                                        item.status === 'over' ? "text-accent-orange" : "text-emerald-500"
                                    )}>{item.cur}</span>
                                    <Icons.ChevronRight className="w-4 h-4 text-text-faint group-hover:text-accent-cyan transition-colors" />
                                    <span className="text-xs font-bold text-text-muted font-mono">{item.tot}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-5 border-t border-border-subtle">
                             <div className="flex items-center gap-2 mb-4">
                                <Icons.User className="w-4 h-4 text-accent-cyan" />
                                <span className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Expert Sherpa Insights</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-accent-orange/10 border border-accent-orange/20 shadow-sm">
                                    <Icons.AlertTriangle className="w-4 h-4 text-accent-orange" />
                                    <span className="text-sm font-bold text-text-primary leading-tight">Tente MSR Hubba Hubba utilisée sur 2 projets actifs. <span className="text-xs text-text-muted font-normal block mt-1">(Conflit logistique détecté : GR20 vs Weekend Vosges)</span></span>
                                </div>
                                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                    <span className="text-sm font-bold text-text-primary leading-tight">Température prévue : 21°C. <span className="text-xs text-text-muted font-normal block mt-1">Duvet confort 5°C optimisé pour cette fenêtre météo.</span></span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}