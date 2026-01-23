// app/basecamp/packbuilder/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getOneTrek } from "@/lib/data";
import { analyzePack, SherpaReport } from "@/lib/sherpa/rules";
import { generateLLMAnalysis } from "@/lib/sherpa/engine";
import { GEAR_ITEMS, GEAR_CATEGORIES, calculateTotalWeight, formatWeight } from "@/lib/gear";
import { GearItemCard } from "@/components/pack";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { GearItem } from "@/types";

export default function PackBuilderPage() {
  const MOCK_TREK_SLUG = "gr20-corse";
  const MOCK_TREK = useMemo(() => getOneTrek(MOCK_TREK_SLUG)!, [MOCK_TREK_SLUG]);

  const initialPack = useMemo(() => {
    return GEAR_ITEMS.filter(item => item.essential && item.owned).slice(0, 8);
  }, []);

  const [pack, setPack] = useState<GearItem[]>(initialPack);
  const [activeCategory, setActiveCategory] = useState<string>("shelter");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [llmAnalysis, setLlmAnalysis] = useState<{ summary: string, recommendations: { item: string, reason: string }[] } | null>(null);
  const [isLoadingLlm, setIsLoadingLlm] = useState(false);

  const totalWeight = useMemo(() => calculateTotalWeight(pack), [pack]);

  useEffect(() => {
    if (!pack.length || !MOCK_TREK) return;
    const fetchAnalysis = async () => {
      setIsLoadingLlm(true);
      try {
        const analysis = await generateLLMAnalysis(pack, MOCK_TREK as any);
        setLlmAnalysis(analysis);
      } catch (error) {
        setLlmAnalysis({ summary: "Analyse Sherpa momentanément indisponible.", recommendations: [] });
      } finally {
        setIsLoadingLlm(false);
      }
    };
    const debounce = setTimeout(fetchAnalysis, 1000);
    return () => clearTimeout(debounce);
  }, [pack, MOCK_TREK]);

  const sherpaReport = useMemo(() => {
    return analyzePack(pack.map(i => ({ ...i, volume: 1, price: 0, emoji: '📦', compartment: 'main' as const })), MOCK_TREK_SLUG);
  }, [pack]);

  const toggleItem = (item: GearItem) => {
    setPack(prev => prev.some(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);
  };

  const availableItems = useMemo(() => {
    return GEAR_ITEMS.filter(item => 
      (searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : item.category === activeCategory)
    );
  }, [searchTerm, activeCategory]);

  return (
    <div className="h-screen flex flex-col bg-bg-base transition-colors overflow-hidden">
      {/* HEADER */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-text-primary tracking-tight uppercase">Tactical Pack Builder</h1>
          <div className="h-4 w-[1px] bg-border-subtle" />
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", sherpaReport.isSafe ? "bg-emerald-vibrant" : "bg-orange-vibrant animate-pulse")} />
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
              Sherpa: {sherpaReport.isSafe ? "Optimal" : "Alertes Détectées"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-surface-2 border border-border-subtle">
             <Icons.Activity className="w-4 h-4 text-cyan-vibrant" />
             <span className="text-sm font-black text-text-primary font-mono">{formatWeight(totalWeight)}</span>
          </div>
          <button className="premium-card px-4 py-2 rounded-xl bg-cyan-vibrant text-white border-none hover:opacity-90 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-vibrant/20">
            Finaliser Pack
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: TACTICAL BACKBONE */}
        <aside className="w-[450px] border-r border-border-subtle bg-bg-surface-1 flex flex-col shadow-2xl z-20">
           <div className="p-6 border-b border-border-subtle bg-bg-surface-2/50">
              <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em] mb-4">Backbone de l&apos;expédition</div>
              <div className="flex items-end justify-between gap-1 h-32 mb-4">
                  {GEAR_CATEGORIES.map((cat, i) => {
                    const catItems = pack.filter(item => item.category === cat.id);
                    const catWeight = calculateTotalWeight(catItems);
                    const height = Math.min(100, (catWeight / 3000) * 100);
                    return (
                      <div key={cat.id} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-bg-surface-3 rounded-t-lg relative overflow-hidden h-full flex items-end">
                            <div 
                              className="w-full bg-cyan-vibrant/40 group-hover:bg-cyan-vibrant transition-all duration-500 rounded-t-sm" 
                              style={{ height: `${height}%` }}
                            />
                        </div>
                        <span className="text-[8px] font-black text-text-faint uppercase">{cat.id.slice(0, 3)}</span>
                      </div>
                    )
                  })}
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {pack.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
                   <Icons.Backpack className="w-12 h-12 mb-4" />
                   <div className="text-xs font-black uppercase tracking-widest">Sac à dos vide</div>
                   <div className="text-[10px] font-bold mt-2">Commencez à ajouter du matériel depuis le catalogue.</div>
                </div>
              ) : (
                pack.map((item, i) => (
                  <div key={item.id} className="premium-card p-3 rounded-xl flex items-center justify-between group hover:translate-x-1 transition-all">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-surface-3 flex items-center justify-center text-text-faint group-hover:text-cyan-vibrant transition-colors">
                           <span className="text-xs font-black">{i + 1}</span>
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-text-primary uppercase tracking-tight line-clamp-1">{item.name}</div>
                           <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.category}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-black font-mono text-cyan-vibrant">{formatWeight(item.weight)}</div>
                        <button onClick={() => toggleItem(item)} className="text-[9px] font-black text-orange-vibrant uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Retirer</button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </aside>

        {/* RIGHT: CATALOG & INSIGHTS */}
        <main className="flex-1 bg-bg-base overflow-y-auto p-8 scrollbar-hide">
           <div className="max-w-4xl mx-auto space-y-12 animate-slide-up">
              
              {/* SHERPA INSIGHTS PANEL */}
              <section className="premium-card p-8 rounded-3xl bg-gradient-to-br from-bg-surface-1 to-bg-surface-2 border-cyan-vibrant/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Icons.Yeti className="w-32 h-32" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="p-3 bg-orange-vibrant text-white rounded-2xl shadow-lg ring-4 ring-orange-vibrant/20">
                          <Icons.Gauge className="w-6 h-6" />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">Sherpa Intelligence</h2>
                          <div className="text-[10px] font-black text-orange-vibrant uppercase tracking-[0.2em]">Expédition Analysis Score: {sherpaReport.score}/100</div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div className="text-[10px] font-black text-text-faint uppercase tracking-widest">Synthèse Narrative</div>
                          <p className="text-sm text-text-muted leading-relaxed font-medium">
                             {isLoadingLlm ? "Génération de l'analyse en cours..." : (llmAnalysis?.summary || "Ajoutez du matériel pour une analyse temps réel.")}
                          </p>
                       </div>
                       <div className="space-y-4">
                          <div className="text-[10px] font-black text-text-faint uppercase tracking-widest">Alertes Tactiques</div>
                          <div className="space-y-2">
                             {sherpaReport.warnings.slice(0, 3).map((w, i) => (
                                <div key={i} className="flex gap-3 p-3 rounded-xl bg-orange-vibrant/5 border border-orange-vibrant/10">
                                   <Icons.AlertTriangle className="w-4 h-4 text-orange-vibrant shrink-0" />
                                   <span className="text-[10px] font-bold text-text-primary leading-tight">{w.message}</span>
                                </div>
                             ))}
                             {sherpaReport.warnings.length === 0 && (
                                <div className="flex gap-3 p-3 rounded-xl bg-emerald-vibrant/5 border border-emerald-vibrant/10 text-emerald-vibrant text-[10px] font-bold">
                                   <Icons.Check className="w-4 h-4" /> Aucun risque majeur détecté
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              {/* CATALOG FILTERS */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-text-primary uppercase tracking-widest">Catalogue Matériel</h3>
                    <div className="relative">
                       <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                       <input 
                         type="text" 
                         placeholder="FILTRER LE MATÉRIEL..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-64 bg-bg-surface-2 border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-[10px] font-black tracking-widest text-text-primary focus:ring-1 focus:ring-cyan-vibrant/50 outline-none transition-all"
                       />
                    </div>
                 </div>

                 <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {GEAR_CATEGORIES.map(cat => (
                       <button 
                         key={cat.id} 
                         onClick={() => { setActiveCategory(cat.id); setSearchTerm(""); }}
                         className={cn(
                           "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                           activeCategory === cat.id && !searchTerm
                             ? "bg-bg-surface-1 border-cyan-vibrant text-cyan-vibrant shadow-sm"
                             : "bg-bg-surface-2 border-border-subtle text-text-faint hover:text-text-muted"
                         )}
                       >
                          {cat.name}
                       </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableItems.map(item => (
                       <GearItemCard 
                          key={item.id} 
                          item={item} 
                          isInPack={pack.some(i => i.id === item.id)}
                          onToggle={() => toggleItem(item)}
                       />
                    ))}
                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
