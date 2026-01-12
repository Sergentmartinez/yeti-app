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
                    <Icons.TrendingUp className="w-5 h-5 text-text-muted" />
                    <h1 className="text-base font-black text-text-primary tracking-tight">Mission Control</h1>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted font-medium">
                    <span>Dernière synchro : Il y a 5 min</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <Icons.Settings className="w-4 h-4 cursor-pointer hover:text-text-primary transition-colors" />
                    </div>
                </div>
            </header>

            <div className="p-6 max-w-[1300px] mx-auto space-y-5">
                
                {/* TOP STATS CARD */}
                <section className="premium-card rounded-2xl overflow-hidden flex relative">
                    <div className="flex-1 p-6 z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Icons.TrendingUp className="w-4 h-4 text-text-muted" />
                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Mission Control</span>
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                            <div className="border-r border-border-subtle pr-6">
                                <div className="text-3xl font-black text-text-primary">2</div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Projets actifs</div>
                            </div>
                            <div className="border-r border-border-subtle pr-6">
                                <div className="text-3xl font-black text-text-primary">18,4<span className="text-sm font-bold text-text-muted ml-1">kg</span></div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Pack actuel</div>
                            </div>
                            <div className="border-r border-border-subtle pr-6">
                                <div className="text-3xl font-black text-text-primary">J-22</div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">J-22</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-text-primary">87<span className="text-sm font-bold text-text-muted ml-0.5">/100</span></div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Sherpa</div>
                            </div>
                        </div>
                    </div>
                    {/* Visual Background - Hidden in Dark Mode? Or adapted? */}
                     <div className="w-[280px] relative hidden sm:block">
                        <Image 
                            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80" 
                            alt="Mountains" 
                            fill 
                            className="object-cover"
                        />
                         {/* Gradient adaptation for shared themes */}
                        <div className="absolute inset-0 bg-gradient-to-r from-bg-surface-2 via-bg-surface-2/60 to-transparent" />
                    </div>
                </section>

                {/* MIDDLE ROW: Actions + Projects */}
                <div className="grid grid-cols-12 gap-5">
                    {/* Actions */}
                    <section className="col-span-4 premium-card rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <Icons.AlertTriangle className="w-4 h-4 text-accent-orange" />
                            <span className="text-xs font-black text-text-secondary uppercase tracking-wider">Actions</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-accent-orange mt-1.5 shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-text-primary">Réserver refuges J5-J8</span>
                                        <span className="text-[9px] font-black text-text-muted bg-bg-surface-3 px-2 py-0.5 rounded">GR20</span>
                                    </div>
                                    <span className="text-[11px] text-text-muted">Pack actuel</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-text-muted mt-1.5 shrink-0" />
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-text-primary">Commander cartouches gaz</span>
                                    <div className="text-[11px] text-text-muted">Logistique</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-text-muted mt-1.5 shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-text-primary">Tester matériel neuf</span>
                                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Validé</span>
                                    </div>
                                    <span className="text-[11px] text-text-muted">Validé</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Project Cards */}
                    <div className="col-span-8 grid grid-cols-2 gap-5">
                        {/* GR20 Card */}
                        <div className="premium-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-all group cursor-pointer">
                            <div className="h-28 relative">
                                <Image 
                                    src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80" 
                                    alt="GR20" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                <div className="absolute bottom-3 left-4 text-white font-black text-lg drop-shadow-md">GR20 Nord — Sud</div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-text-muted">Progression</span>
                                    <span className="text-[10px] font-bold text-text-primary">3 / 22 étapes</span>
                                </div>
                                <div className="h-1.5 bg-bg-surface-3 rounded-full overflow-hidden mb-3">
                                    <div className="h-full bg-accent-orange rounded-full" style={{ width: '14%' }} />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-text-muted">
                                    <span className="flex items-center gap-1"><Icons.Archive className="w-3 h-3" /> Pack: 9,4 kg</span>
                                    <span className="bg-accent-cyan/10 text-accent-cyan px-1.5 py-0.5 rounded">J-22</span>
                                </div>
                            </div>
                        </div>

                        {/* West Highland Way Card */}
                        <div className="premium-card rounded-2xl overflow-hidden opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
                            <div className="h-28 relative">
                                <Image 
                                    src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80" 
                                    alt="West Highland Way" 
                                    fill 
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="absolute bottom-3 left-4 text-white font-black text-lg drop-shadow-md">West Highland Way</div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                     <span className="text-[10px] font-bold text-text-muted">Statut</span>
                                    <span className="text-[10px] font-bold text-text-primary">Complet</span>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-sm font-black text-text-primary">28,5 kg</span>
                                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Terminé</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: Equipement (x2) + Sherpa Insights */}
                <div className="grid grid-cols-12 gap-5">
                    {/* Équipement Left */}
                    <section className="col-span-5 premium-card rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <Icons.Archive className="w-4 h-4 text-text-muted" />
                            <span className="text-xs font-black text-text-secondary uppercase tracking-wider">Équipement</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mb-5">
                            {[
                                { val: '62', lab: 'Items' },
                                { val: '18,4 kg', lab: 'Total' },
                                { val: '8', lab: 'À trier' },
                                { val: '18,4', lab: 'Base' },
                            ].map((s, i) => (
                                <div key={i} className="text-center p-2 rounded-xl bg-bg-surface-3 border border-border-subtle">
                                    <div className="text-sm font-black text-text-primary truncate">{s.val}</div>
                                    <div className="text-[8px] font-bold text-text-muted uppercase truncate">{s.lab}</div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {[
                                { c: 'bg-emerald-500', l: 'Shelter', w: '3.2 kg' },
                                { c: 'bg-blue-500', l: 'Sleep', w: '2.1 kg' },
                                { c: 'bg-accent-orange', l: 'Cooking', w: '1.4 kg' },
                                { c: 'bg-text-muted', l: 'Divers', w: '6.3 kg' },
                            ].map((cat, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 rounded-full", cat.c)} />
                                    <span className="text-xs font-bold text-text-secondary flex-1">{cat.l}</span>
                                    <span className="text-[10px] font-black text-text-muted">{cat.w}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 pt-4 border-t border-border-subtle">
                            <div className="flex items-center gap-2 mb-3">
                                <Icons.Zap className="w-3 h-3 text-accent-purple" />
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Sherpa Insights</span>
                            </div>
                            <div className="h-1 bg-bg-surface-3 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-orange w-1/3" />
                            </div>
                        </div>
                    </section>

                    {/* Équipement Right + Sherpa Insights */}
                    <section className="col-span-7 premium-card rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <Icons.Menu className="w-4 h-4 text-text-muted" />
                            <span className="text-xs font-black text-text-secondary uppercase tracking-wider">Détails</span>
                        </div>
                        <div className="space-y-1">
                            {[
                                { l: 'Shelter', cur: '3.2 kg', tot: '3.2 kg' },
                                { l: 'Sleep', cur: '2.1 kg', tot: '2.1 kg' },
                                { l: 'Cooking', cur: '1.4 kg', tot: '1.4 kg' },
                                { l: 'Divers', cur: '6.3 kg', tot: '6.3 kg' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-2.5 rounded-lg hover:bg-bg-surface-3 transition-colors cursor-pointer group">
                                    <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary flex-1">{item.l}</span>
                                    <span className="text-xs font-black text-text-primary">{item.cur}</span>
                                    <Icons.ChevronRight className="w-3 h-3 text-text-muted group-hover:text-accent-orange transition-colors" />
                                    <span className="text-xs font-black text-text-primary">{item.tot}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 pt-4 border-t border-border-subtle">
                             <div className="flex items-center gap-2 mb-3">
                                <Icons.User className="w-3 h-3 text-text-secondary" />
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Sherpa Insights</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-accent-orange/5 border border-accent-orange/10">
                                    <Icons.AlertTriangle className="w-3 h-3 text-accent-orange" />
                                    <span className="text-xs font-bold text-text-secondary">Tente MSR utilisée sur 2 projets <span className="text-[10px] text-text-muted">(GR20 - Weekend Vosge)</span></span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-text-secondary">Température prévue — 21°C — vérifier confort duvet</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}