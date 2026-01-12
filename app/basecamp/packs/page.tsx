// app/basecamp/packs/page.tsx
"use client";

import Link from "next/link";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const MOCK_PACKS = [
  { id: "pack-1", name: "GR20 Ultralight", trek: "GR20 Nord → Sud", weight: 4.2, items: 32, status: "active", progress: 85 },
  { id: "pack-2", name: "TMB Confort", trek: "Tour du Mont-Blanc", weight: 6.8, items: 45, status: "draft", progress: 40 },
  { id: "pack-3", name: "Camino Light", trek: "Chemin de Compostelle", weight: 5.5, items: 28, status: "archived", progress: 100 },
];

export default function PacksPage() {
  return (
    <div className="min-h-screen bg-bg-base transition-colors">
      {/* HEADER */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-text-primary tracking-tight">Mes Projets</h1>
          <div className="h-4 w-[1px] bg-border-subtle" />
          <span className="text-sm text-text-muted font-medium uppercase tracking-widest">{MOCK_PACKS.length} Expéditions</span>
        </div>
        <Link 
          href="/basecamp/packbuilder" 
          className="premium-card px-4 py-2 rounded-xl flex items-center gap-2 bg-cyan-vibrant text-white hover:bg-cyan-vibrant/90 transition-all"
        >
          <Icons.Plus className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Nouvelle Expédition</span>
        </Link>
      </header>

      <div className="p-8 max-w-[1600px] mx-auto animate-slide-up">
        
        {/* STATS BAR */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Projets", value: "3", icon: Icons.NavPack, color: "text-cyan-vibrant" },
            { label: "Actif", value: "1", icon: Icons.Activity, color: "text-emerald-vibrant" },
            { label: "En cours", value: "1", icon: Icons.Clock, color: "text-orange-vibrant" },
            { label: "Archivé", value: "1", icon: Icons.Archive, color: "text-text-muted" },
          ].map((stat, i) => (
            <div key={i} className="premium-card p-4 rounded-xl flex items-center gap-4 group hover:translate-y-[-2px] transition-all">
              <div className="p-3 rounded-xl bg-bg-surface-3">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <div className={cn("text-2xl font-black font-mono", stat.color)}>{stat.value}</div>
                <div className="text-[10px] font-black text-text-faint uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PACKS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PACKS.map((pack) => (
            <div key={pack.id} className={cn(
              "premium-card rounded-2xl overflow-hidden group cursor-pointer transition-all",
              pack.status === "active" && "ring-1 ring-cyan-vibrant/30",
              pack.status === "archived" && "opacity-60"
            )}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                        pack.status === "active" ? "bg-emerald-vibrant/10 text-emerald-vibrant" :
                        pack.status === "draft" ? "bg-orange-vibrant/10 text-orange-vibrant" :
                        "bg-bg-surface-4 text-text-faint"
                      )}>
                        {pack.status === "active" ? "Actif" : pack.status === "draft" ? "Brouillon" : "Archivé"}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-text-primary tracking-tight group-hover:text-cyan-vibrant transition-colors">{pack.name}</h3>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{pack.trek}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-surface-3 group-hover:bg-cyan-vibrant/10 transition-colors">
                    <Icons.NavPack className="w-6 h-6 text-text-muted group-hover:text-cyan-vibrant transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-bg-surface-3 rounded-xl p-3 text-center">
                    <div className="text-lg font-black font-mono text-cyan-vibrant">{pack.weight}</div>
                    <div className="text-[9px] font-black text-text-faint uppercase tracking-widest">kg</div>
                  </div>
                  <div className="bg-bg-surface-3 rounded-xl p-3 text-center">
                    <div className="text-lg font-black font-mono text-text-primary">{pack.items}</div>
                    <div className="text-[9px] font-black text-text-faint uppercase tracking-widest">items</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-faint uppercase tracking-widest">Progression</span>
                    <span className="text-[10px] font-black font-mono text-text-muted">{pack.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-surface-4 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        pack.progress >= 80 ? "bg-emerald-vibrant" : pack.progress >= 50 ? "bg-cyan-vibrant" : "bg-orange-vibrant"
                      )}
                      style={{ width: `${pack.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border-subtle p-4 flex items-center justify-between bg-bg-surface-2/50">
                <button className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors">
                  Dupliquer
                </button>
                <Link 
                  href={`/basecamp/packbuilder?id=${pack.id}`}
                  className="flex items-center gap-1 text-[10px] font-black text-cyan-vibrant uppercase tracking-widest hover:text-cyan-vibrant/80 transition-colors"
                >
                  Ouvrir <Icons.ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {/* New Pack Card */}
          <Link 
            href="/basecamp/packbuilder" 
            className="premium-card rounded-2xl border-2 border-dashed border-border-default hover:border-cyan-vibrant/50 flex flex-col items-center justify-center p-8 min-h-[280px] group transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-bg-surface-3 flex items-center justify-center mb-4 group-hover:bg-cyan-vibrant/10 transition-colors">
              <Icons.Plus className="w-8 h-8 text-text-muted group-hover:text-cyan-vibrant transition-colors" />
            </div>
            <span className="text-sm font-black text-text-muted group-hover:text-text-primary transition-colors uppercase tracking-widest">Créer un Projet</span>
            <span className="text-[10px] font-bold text-text-faint mt-1">via le Pack Builder</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
