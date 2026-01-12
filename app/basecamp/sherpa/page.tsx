// app/basecamp/sherpa/page.tsx
"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const ANALYSIS_CATEGORIES = [
  { id: "weight", label: "Poids", icon: Icons.Activity, score: 85, status: "optimal", message: "Pack bien optimisé à 4.2kg base" },
  { id: "safety", label: "Sécurité", icon: Icons.Shield, score: 72, status: "warning", message: "Manque kit premier secours complet" },
  { id: "weather", label: "Météo", icon: Icons.CloudSun, score: 60, status: "alert", message: "Tempête prévue J5 - isolation insuffisante" },
  { id: "nutrition", label: "Nutrition", icon: Icons.CatFood, score: 90, status: "optimal", message: "Calories/jour optimales pour effort" },
  { id: "hydration", label: "Hydratation", icon: Icons.CatWater, score: 78, status: "warning", message: "Capacité de portage eau limitée" },
];

const RECOMMENDATIONS = [
  { priority: "high", item: "Sac de couchage", current: "Comfort 5°C", suggestion: "Passer à Comfort -2°C", reason: "Températures prévues à -2°C J5-J8" },
  { priority: "high", item: "Kit premier secours", current: "Basique", suggestion: "Kit complet montagne", reason: "Isolement des refuges en haute saison" },
  { priority: "medium", item: "Réserve d'eau", current: "2L", suggestion: "3L + filtre Sawyer", reason: "Sources parfois difficiles d'accès" },
  { priority: "low", item: "Popote MSR Titan", current: "142g", suggestion: "TOAKS 650ml (86g)", reason: "Économie de 56g sur le poids total" },
];

export default function SherpaPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const globalScore = 77;

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-base transition-colors">
      {/* HEADER */}
      <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-surface-1 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-text-primary tracking-tight">Sherpa AI</h1>
          <div className="h-4 w-[1px] bg-border-subtle" />
          <span className="text-sm text-text-muted font-medium uppercase tracking-widest">Intelligence Expédition</span>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className={cn(
            "premium-card px-4 py-2 rounded-xl flex items-center gap-2 transition-all",
            isAnalyzing ? "bg-purple-vibrant/20 text-purple-vibrant" : "bg-purple-vibrant text-white hover:bg-purple-vibrant/90"
          )}
        >
          <Icons.Zap className={cn("w-4 h-4", isAnalyzing && "animate-pulse")} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isAnalyzing ? "Analyse en cours..." : "Nouvelle Analyse"}
          </span>
        </button>
      </header>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-slide-up">
        
        {/* GLOBAL SCORE */}
        <section className="premium-card rounded-2xl p-8 bg-gradient-to-br from-purple-vibrant/10 to-bg-surface-1 border-purple-vibrant/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Icons.Yeti className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-text-faint uppercase tracking-[0.3em] mb-2">Score Global Expédition</div>
              <div className="flex items-baseline gap-4">
                <span className={cn(
                  "text-7xl font-black font-mono",
                  globalScore >= 80 ? "text-emerald-vibrant" : globalScore >= 60 ? "text-orange-vibrant" : "text-red-vibrant"
                )}>{globalScore}</span>
                <span className="text-2xl font-black text-text-muted">/100</span>
              </div>
              <div className="text-sm font-bold text-text-muted mt-2">
                {globalScore >= 80 ? "Expédition bien préparée" : globalScore >= 60 ? "Quelques ajustements recommandés" : "Préparation insuffisante"}
              </div>
            </div>
            <div className="w-48 h-48 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="var(--bg-surface-3)" strokeWidth="12" fill="none" />
                <circle 
                  cx="96" cy="96" r="80" 
                  stroke={globalScore >= 80 ? "var(--accent-emerald)" : globalScore >= 60 ? "var(--accent-orange)" : "var(--accent-red)"}
                  strokeWidth="12" 
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(globalScore / 100) * 502} 502`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Icons.Zap className="w-12 h-12 text-purple-vibrant" />
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY SCORES */}
        <div className="grid md:grid-cols-5 gap-4">
          {ANALYSIS_CATEGORIES.map((cat, i) => (
            <div key={i} className={cn(
              "premium-card p-4 rounded-xl text-center transition-all hover:translate-y-[-2px]",
              cat.status === "alert" && "ring-1 ring-red-vibrant/30",
              cat.status === "warning" && "ring-1 ring-orange-vibrant/30"
            )}>
              <div className={cn(
                "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3",
                cat.status === "optimal" ? "bg-emerald-vibrant/10 text-emerald-vibrant" :
                cat.status === "warning" ? "bg-orange-vibrant/10 text-orange-vibrant" :
                "bg-red-vibrant/10 text-red-vibrant"
              )}>
                <cat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-black font-mono text-text-primary mb-1">{cat.score}</div>
              <div className="text-[10px] font-black text-text-faint uppercase tracking-widest mb-2">{cat.label}</div>
              <div className="text-[9px] font-bold text-text-muted leading-tight">{cat.message}</div>
            </div>
          ))}
        </div>

        {/* RECOMMENDATIONS */}
        <section className="premium-card rounded-2xl p-6">
          <h3 className="text-lg font-black text-text-primary tracking-tight mb-6 flex items-center gap-2">
            <Icons.Star className="w-5 h-5 text-orange-vibrant" />
            Recommandations Sherpa
          </h3>
          <div className="space-y-4">
            {RECOMMENDATIONS.map((rec, i) => (
              <div key={i} className={cn(
                "p-4 rounded-xl flex items-start gap-4 transition-all",
                rec.priority === "high" ? "bg-red-vibrant/5 ring-1 ring-red-vibrant/20" :
                rec.priority === "medium" ? "bg-orange-vibrant/5 ring-1 ring-orange-vibrant/20" :
                "bg-bg-surface-3/50"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  rec.priority === "high" ? "bg-red-vibrant text-white" :
                  rec.priority === "medium" ? "bg-orange-vibrant text-white" :
                  "bg-bg-surface-4 text-text-muted"
                )}>
                  {rec.priority === "high" ? "!" : rec.priority === "medium" ? "?" : "i"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-text-primary">{rec.item}</span>
                    <span className="text-[10px] font-black text-text-faint uppercase tracking-widest">{rec.current}</span>
                    <Icons.ArrowRight className="w-3 h-3 text-text-faint" />
                    <span className="text-[10px] font-black text-cyan-vibrant uppercase tracking-widest">{rec.suggestion}</span>
                  </div>
                  <div className="text-[11px] font-medium text-text-muted">{rec.reason}</div>
                </div>
                <button className="text-[10px] font-black text-cyan-vibrant uppercase tracking-widest hover:text-cyan-vibrant/80 transition-colors">
                  Appliquer
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
