// app/basecamp/dashboard/page.tsx
"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const PROGRESS_ITEMS = [
  { label: "Réservations", progress: 100, color: "bg-emerald-vibrant" },
  { label: "Équipement", progress: 85, color: "bg-cyan-vibrant" },
  { label: "Entraînement", progress: 60, color: "bg-orange-vibrant" },
  { label: "Documents", progress: 40, color: "bg-purple-vibrant" },
];

const MILESTONES = [
  { date: "15 Jan", label: "Finaliser pack", done: true },
  { date: "20 Jan", label: "Réserver ferry", done: true },
  { date: "28 Jan", label: "Test matériel 48h", done: false, active: true },
  { date: "05 Fév", label: "Achat nourriture lyophilisée", done: false },
  { date: "15 Fév", label: "Départ Calenzana", done: false },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg-base transition-colors">
      {/* HEADER */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-text-primary tracking-tight">Dashboard Projet</h1>
          <div className="h-4 w-[1px] bg-border-subtle" />
          <span className="text-sm text-text-muted font-medium uppercase tracking-widest">GR20 Nord</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-vibrant/10 border border-cyan-vibrant/20 text-cyan-vibrant">
            <Icons.Gauge className="w-4 h-4" />
            <span className="text-sm font-black font-mono">85%</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Prêt</span>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-slide-up">
        
        {/* COUNTDOWN */}
        <section className="premium-card rounded-2xl p-8 bg-gradient-to-br from-cyan-vibrant/10 to-bg-surface-1 border-cyan-vibrant/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-vibrant/5 blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.3em] mb-2">Compte à rebours</div>
              <div className="text-6xl font-black font-mono text-cyan-vibrant tracking-tighter">J-22</div>
              <div className="text-sm font-bold text-text-muted mt-2">Départ prévu le 15 Février 2026</div>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-black font-mono text-text-primary">16</div>
                <div className="text-[10px] font-black text-text-faint uppercase tracking-widest">Jours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black font-mono text-text-primary">180</div>
                <div className="text-[10px] font-black text-text-faint uppercase tracking-widest">km</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black font-mono text-text-primary">11,000</div>
                <div className="text-[10px] font-black text-text-faint uppercase tracking-widest">m D+</div>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRESS BARS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROGRESS_ITEMS.map((item, i) => (
            <div key={i} className="premium-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-text-primary">{item.label}</span>
                <span className="text-sm font-black font-mono text-text-muted">{item.progress}%</span>
              </div>
              <div className="h-2 bg-bg-surface-3 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* MILESTONES */}
          <section className="premium-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-2">
                <Icons.Clock className="w-5 h-5 text-orange-vibrant" />
                Jalons Clés
              </h3>
            </div>
            <div className="space-y-4">
              {MILESTONES.map((m, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all",
                  m.active ? "bg-orange-vibrant/10 ring-1 ring-orange-vibrant/20" : "hover:bg-bg-surface-3"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    m.done ? "bg-emerald-vibrant text-white" : m.active ? "bg-orange-vibrant text-white animate-pulse" : "bg-bg-surface-3 text-text-faint"
                  )}>
                    {m.done ? <Icons.SimpleCheck className="w-5 h-5" /> : <Icons.Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-text-primary">{m.label}</div>
                    <div className="text-[10px] font-black text-text-faint uppercase tracking-widest">{m.date}</div>
                  </div>
                  {m.active && <span className="text-[10px] font-black text-orange-vibrant uppercase tracking-widest">En cours</span>}
                </div>
              ))}
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="premium-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-2">
                <Icons.Zap className="w-5 h-5 text-cyan-vibrant" />
                Actions Rapides
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Optimiser Pack", icon: Icons.NavPack, color: "text-cyan-vibrant" },
                { label: "Voir Météo", icon: Icons.CloudSun, color: "text-orange-vibrant" },
                { label: "Éditer Itinéraire", icon: Icons.NavRoutes, color: "text-emerald-vibrant" },
                { label: "Sherpa Analysis", icon: Icons.Zap, color: "text-purple-vibrant" },
              ].map((action, i) => (
                <button key={i} className="premium-card p-4 rounded-xl flex items-center gap-3 group hover:translate-x-1 transition-all">
                  <action.icon className={cn("w-6 h-6", action.color)} />
                  <span className="text-sm font-bold text-text-primary group-hover:text-cyan-vibrant transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
