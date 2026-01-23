"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Map as MapIcon, Activity, Wind, CheckCircle2, Sparkles, 
  Backpack, Calendar, Plus, Ship, TestTube, Package, Rocket, 
  AlertTriangle, Compass, ChevronRight, CloudSun, Euro, 
  Mountain, Route, Clock, Target, Zap, TrendingUp, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useYetiStore, TREK_DATABASE } from "@/lib/store/useYetiStore";
import { useTimelineStore } from "@/lib/store/useTimelineStore";
import { SegmentedGauge } from "@/components/ui/SegmentedGauge";

// ============================================================================
// CARTE - Import dynamique
// ============================================================================

const DashboardMap = dynamic(() => import('@/components/maps/ExpeditionMap').then(mod => {
  const WrappedMap = () => {
    const GR20_STAGES = [
      { lat: 42.5073, lon: 8.7879, ele: 275, name: "Calenzana" },
      { lat: 42.4789, lon: 8.8456, ele: 1520, name: "Ortu di u Piobbu" },
      { lat: 42.4512, lon: 8.8923, ele: 1270, name: "Carrozzu" },
      { lat: 42.4234, lon: 8.9567, ele: 1422, name: "Ascu Stagnu" },
      { lat: 42.3956, lon: 9.0234, ele: 1683, name: "Tighjettu" },
      { lat: 42.3678, lon: 9.0678, ele: 1991, name: "Ciottulu" },
      { lat: 42.3234, lon: 9.1123, ele: 1601, name: "Manganu" },
      { lat: 42.2789, lon: 9.1567, ele: 1842, name: "Petra Piana" },
      { lat: 42.2345, lon: 9.1789, ele: 1430, name: "Onda" },
      { lat: 42.1123, lon: 9.1345, ele: 920, name: "Vizzavona" },
      { lat: 42.0456, lon: 9.1678, ele: 1586, name: "Capannelle" },
      { lat: 41.9789, lon: 9.1923, ele: 1820, name: "Prati" },
      { lat: 41.9123, lon: 9.2234, ele: 1750, name: "Usciolu" },
      { lat: 41.8456, lon: 9.2567, ele: 1530, name: "Asinau" },
      { lat: 41.7789, lon: 9.2789, ele: 1055, name: "Paliri" },
      { lat: 41.7345, lon: 9.3123, ele: 252, name: "Conca" },
    ];
    return <mod.default stages={GR20_STAGES} />;
  };
  return WrappedMap;
}), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center">
      <MapIcon className="w-8 h-8 text-zinc-700" />
    </div>
  )
});

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
  orange: "#f97316",
  cyan: "#06b6d4",
  emerald: "#10b981",
  violet: "#a78bfa",
  pink: "#f9a8d4",
  blue: "#60a5fa",
  red: "#ef4444",
};

// ============================================================================
// COMPOSANTS UI
// ============================================================================

const Card = ({ children, className, onClick, title, action, noPadding }: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
  title?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}) => (
  <motion.div 
    className={cn(
      "rounded-2xl border border-white/10 bg-[#1c1c1e] overflow-hidden flex flex-col relative",
      onClick && "cursor-pointer hover:border-white/20 transition-colors",
      !noPadding && "p-5",
      className
    )}
    whileHover={onClick ? { scale: 1.002 } : undefined}
    onClick={onClick}
    role={onClick ? "button" : undefined}
  >
    {title && (
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">{title}</span>
        {action}
      </div>
    )}
    {children}
  </motion.div>
);

// ============================================================================
// ANNEAUX CONCENTRIQUE - État de préparation
// ============================================================================

const PreparationRings = ({ scores }: { scores: { materiel: number; physique: number; logistique: number } }) => {
  const size = 130;
  const strokeWidth = 8;
  const gap = 5;
  const center = size / 2;
  const globalScore = Math.round((scores.materiel + scores.physique + scores.logistique) / 3);
  
  const rings = [
    { value: scores.materiel, color: COLORS.orange, label: 'Matériel', icon: Backpack },
    { value: scores.physique, color: COLORS.cyan, label: 'Physique', icon: Activity },
    { value: scores.logistique, color: COLORS.emerald, label: 'Logistique', icon: Compass },
  ];
  
  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {rings.map((ring, i) => {
            const radius = (size - strokeWidth) / 2 - (i * (strokeWidth + gap));
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (ring.value / 100) * circumference;
            return (
              <g key={i}>
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} strokeOpacity={0.3} />
                <motion.circle
                  cx={center} cy={center} r={radius} fill="none" stroke={ring.color} strokeWidth={strokeWidth} strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 1 }}
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white leading-none tracking-tighter">{globalScore}%</span>
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">Global</span>
        </div>
      </div>
      
      <div className="space-y-3 flex-1">
        {rings.map((ring, i) => {
          const Icon = ring.icon;
          return (
            <div key={i} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors bg-zinc-900/50 text-zinc-500",
                )}>
                  <Icon size={14} style={{ color: ring.color }} />
                </div>
                <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">{ring.label}</span>
              </div>
              <span className="text-sm font-black tracking-tight" style={{ color: ring.color }}>{ring.value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// PAGE PRINCIPALE
// ============================================================================

const calculateDateFromJ = (jString: string, departureDate: Date | null) => {
  if (!departureDate || !jString || !jString.startsWith('J-')) return null;
  const days = parseInt(jString.replace('J-', ''));
  if (isNaN(days)) return null;
  const date = new Date(departureDate);
  date.setDate(date.getDate() - days);
  return date;
};

export default function DashboardPage() {
  const router = useRouter();
  
  const {
    selectedTrekName,
    getTotalBudget,
    getBudgetByCategory,
    budgetLimit,
    getBaseWeight,
    targetWeight,
    getWeightByCategory,
    preparationScores,
    getDaysUntilDeparture,
    getTrekInfo,
    departureDate
  } = useYetiStore();
  
  // Timeline Data
  const { phases, stats } = useTimelineStore();

  const daysUntil = getDaysUntilDeparture() || 58;
  const totalBudget = getTotalBudget();
  const budgetByCategory = getBudgetByCategory();
  const baseWeight = getBaseWeight();
  const weightByCategory = getWeightByCategory();
  const trekInfo = getTrekInfo();
  
  // Merge tasks for dashboard view
  const allTasks = phases.flatMap(p => p.tasks).sort((a, b) => {
     // Priority sort: Active > Critical > High
     if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
     if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
     return 0;
  });

  const completedTasks = stats.completedTasks;
  const activeTasks = allTasks.filter(t => t.status !== 'done');
  
  // Find current focus task
  const currentTask = allTasks.find(t => t.status === 'in-progress') || 
                      allTasks.find(t => t.status === 'todo' && t.priority === 'critical') ||
                      allTasks[0];

  return (
    <div className="min-h-screen text-white font-sans bg-black p-6">
      
      {/* HEADER */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Projet Actif</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-none">BASECAMP</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500 mt-2 font-medium">
            <span className="text-white font-bold">{selectedTrekName}</span>
            <span>•</span>
            <span className="text-orange-500 font-bold">J-{daysUntil}</span>
            <span>•</span>
            <span>{baseWeight.toFixed(1)}kg</span>
            <span>•</span>
            <span>{completedTasks}/{stats.totalTasks}</span>
          </div>
        </div>
        
        <Link href="/basecamp/gear">
          <button className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 transition-all flex items-center gap-3">
            <Plus size={16} />
            Ajouter Item
          </button>
        </Link>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-5">
        
        {/* LEFT COLUMN (9/12) */}
        <div className="col-span-12 lg:col-span-9 space-y-5">
          
          {/* ROW 1: TOP KPI (4 Units) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
             <Card title="État Préparation" action={<Activity className="w-5 h-5 text-orange-500" />} onClick={() => router.push('/basecamp/profile')}>
               <PreparationRings scores={preparationScores} />
             </Card>
             <Card title="Poids Sac" action={<Backpack className="w-5 h-5 text-orange-500" />} onClick={() => router.push('/basecamp/packbuilder')}>
                <div className="flex items-baseline gap-1 mb-2">
                   <span className="text-5xl font-black text-white tracking-tighter">{baseWeight.toFixed(1)}</span>
                   <span className="text-xl font-bold text-zinc-500">kg</span>
                </div>
                
                <div className="mt-auto">
                  <SegmentedGauge 
                    segments={[
                      { id: 'base', value: 1.8, color: COLORS.violet, label: "Base" },
                      { id: 'vetements', value: 1.0, color: COLORS.cyan, label: "Vêtements" },
                      { id: 'cuisine', value: 0.8, color: COLORS.orange, label: "Cuisine" },
                      { id: 'elec', value: 0.4, color: COLORS.pink, label: "Tech" },
                    ]} 
                    total={5} 
                    showConnectingLine={true} 
                    height={20} 
                  />
                  <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-hide pb-1">
                    {[
                      { l: 'Base', c: COLORS.violet }, 
                      { l: 'Vêtements', c: COLORS.cyan },
                      { l: 'Cuisine', c: COLORS.orange }
                    ].map((s, i) => (
                      <span key={i} className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.c }} />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">{s.l}</span>
                      </span>
                    ))}
                  </div>
                </div>
             </Card>
             <Card title="Budget Trek" action={<Euro className="w-5 h-5 text-blue-500" />} onClick={() => router.push('/basecamp/budget')}>
                <div className="flex items-baseline gap-1 mb-2">
                   <span className="text-5xl font-black text-white tracking-tighter">{totalBudget}</span>
                   <span className="text-xl font-bold text-zinc-500 ml-1">€</span>
                </div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">sur {budgetLimit}€</div>
                <div className="mt-auto">
                   <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-zinc-800">
                      <div className="bg-orange-500 w-[60%]" />
                      <div className="bg-cyan-500 w-[20%]" />
                      <div className="bg-emerald-500 w-[10%]" />
                   </div>
                   <div className="flex justify-between items-center mt-3 text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">
                      Maîtrisé
                   </div>
                </div>
             </Card>
             <Card title={`Météo J-${daysUntil}`} action={<CloudSun className="w-5 h-5 text-indigo-400" />}>
                <div className="flex flex-col">
                  <span className="text-5xl font-black text-white tracking-tighter">12°C</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">Calenzana</span>
                  <span className="text-[9px] text-zinc-600 font-bold mt-0.5">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                </div>
                <div className="mt-auto grid grid-cols-4 gap-1 pt-3 border-t border-white/5">
                   {['10h', '13h', '16h', '19h'].map((h, i) => (
                     <div key={i} className="text-center">
                       <div className="text-[8px] text-zinc-600 font-bold uppercase">{h}</div>
                       <div className="text-xs font-bold text-white mt-0.5">{[8, 12, 11, 9][i]}°</div>
                     </div>
                   ))}
                </div>
             </Card>
          </div>

          {/* ROW 2: SHERPA AI (Large) */}
          <Card className="bg-gradient-to-br from-[#1c1c1e] to-[#2d1b4d] border-purple-500/20 p-8" onClick={() => router.push('/basecamp/sherpa')}>
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <Sparkles className="w-6 h-6 text-purple-400" />
                   <span className="text-sm font-black text-white uppercase tracking-[0.2em]">Sherpa AI Analysis</span>
                </div>
                <div className="flex gap-2">
                   <span className="px-3 py-1.5 rounded-lg bg-zinc-900/80 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Météo J-5</span>
                   <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-[10px] font-black text-purple-300 uppercase tracking-widest animate-pulse border border-purple-500/30">! Prioritaire</span>
                </div>
             </div>

             <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-6">
                   <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                      Le vent s&apos;annonce violent (&gt;80km/h) pour votre étape au Col de Vergio.
                   </h2>
                   <p className="text-lg text-zinc-400 leading-relaxed font-medium">
                      Votre <span className="text-white font-bold underline decoration-purple-500/50 underline-offset-4">Tente MSR Hubba</span> est adaptée mais je recommande un haubanage renforcé ou de viser le refuge de Ciottulu.
                   </p>
                </div>

                <div className="flex gap-4 min-w-[340px]">
                   <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                      <Wind className="w-8 h-8 text-zinc-600" />
                      <div className="text-center">
                         <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Rafales</div>
                         <div className="text-2xl font-black text-white tracking-tight">85 km/h</div>
                      </div>
                   </div>
                   <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                      <Activity className="w-8 h-8 text-zinc-600" />
                      <div className="text-center">
                         <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Risque</div>
                         <div className="text-2xl font-black text-white tracking-tight">Élevé</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-500/10 border-l-4 border-red-500 p-5 rounded-r-xl group cursor-pointer hover:bg-red-500/15 transition-all">
                   <div className="flex items-center gap-2 mb-2 text-red-500">
                      <AlertTriangle size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">Conflit équipement</span>
                   </div>
                   <p className="text-sm font-bold text-red-100/80">Tente MSR assignée à 2 projets</p>
                </div>
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-5 rounded-r-xl group cursor-pointer hover:bg-blue-500/15 transition-all">
                   <div className="flex items-center gap-2 mb-2 text-blue-500">
                      <Wind size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">Alerte météo J5</span>
                   </div>
                   <p className="text-sm font-bold text-blue-100/80">-2°C prévu à Petra Piana</p>
                </div>
                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-5 rounded-r-xl group cursor-pointer hover:bg-emerald-500/15 transition-all">
                   <div className="flex items-center gap-2 mb-2 text-emerald-500">
                      <Sparkles size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">Suggestion</span>
                   </div>
                   <p className="text-sm font-bold text-emerald-100/80">TOAKS 650ml = -280g vs MSR</p>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors cursor-pointer">
                   Voir toutes les analyses →
                </span>
             </div>
          </Card>

          {/* ROW 3: TREK INFO (3) + MAP (6) */}
          <div className="grid grid-cols-1 md:grid-cols-9 gap-5">
             <div className="col-span-3 space-y-4">
                <div className="premium-card p-5 rounded-2xl border-l-4 border-l-orange-500">
                   <div className="flex items-center gap-3 mb-4">
                      <Mountain className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-black text-white uppercase tracking-widest">GR20 Corse</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-900/60 p-4 rounded-2xl flex flex-col gap-3">
                         <Route className="w-5 h-5 text-cyan-500" />
                         <div>
                            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Distance</div>
                            <div className="text-3xl font-black text-white tracking-tighter">180 <span className="text-sm font-bold text-zinc-600">km</span></div>
                         </div>
                      </div>
                      <div className="bg-zinc-900/60 p-4 rounded-2xl flex flex-col gap-3">
                         <TrendingUp className="w-5 h-5 text-amber-500" />
                         <div>
                            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Dénivelé</div>
                            <div className="text-3xl font-black text-amber-500 tracking-tighter">11 000 <span className="text-sm font-bold text-zinc-600">m D+</span></div>
                         </div>
                      </div>
                      <div className="bg-zinc-900/60 p-4 rounded-2xl flex flex-col gap-3">
                         <Clock className="w-5 h-5 text-blue-500" />
                         <div>
                            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Étapes</div>
                            <div className="text-3xl font-black text-white tracking-tighter">16 <span className="text-sm font-bold text-zinc-600">jours</span></div>
                         </div>
                      </div>
                      <div className="bg-zinc-900/60 p-4 rounded-2xl flex flex-col gap-3">
                         <Target className="w-5 h-5 text-red-500" />
                         <div>
                            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Difficulté</div>
                            <div className="text-3xl font-black text-red-500 tracking-tighter">5 <span className="text-sm font-bold text-zinc-600">/5</span></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <Card className="col-span-6 min-h-[340px] p-0 overflow-hidden group shadow-2xl relative" noPadding onClick={() => router.push('/basecamp/routes')}>
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 shadow-xl">
                   <Compass className="w-4 h-4 text-orange-500" />
                   <span className="text-[10px] font-black uppercase tracking-wider text-white">Focus Itinéraire</span>
                </div>
                <div className="w-full h-full grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700">
                  <DashboardMap />
                </div>
             </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE MISSION (3/12) */}
        <Card className="col-span-12 lg:col-span-3 h-full flex flex-col min-h-[800px]" title="Timeline Mission">
           
           {/* Departure Date & Countdown */}
           <div className="mb-6 pb-4 border-b border-white/5">
              <div className="flex items-baseline justify-between mb-2">
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Départ</span>
                 <span className="text-sm font-bold text-white">{departureDate ? new Date(departureDate!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non défini'}</span>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-6xl font-black text-orange-500 tracking-tighter">J-</span>
                 <span className="text-6xl font-black text-white tracking-tighter">{daysUntil}</span>
              </div>
           </div>

           {/* Phase Progress */}
           <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Progression</span>
                 <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={cn("w-8 h-1 rounded-full", i <= Math.ceil((stats.progressPercentage / 20)) ? "bg-emerald-500" : "bg-zinc-800")} />
                    ))}
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 {phases.map(p => {
                    const phaseTotal = p.tasks.length;
                    const phaseDone = p.tasks.filter(t => t.status === 'done').length;
                    const phaseActive = p.tasks.some(t => t.status === 'in-progress');
                    const isDone = phaseTotal > 0 && phaseDone === phaseTotal;
                    
                    // Full phase name mapping
                    const phaseNames: Record<string, string> = {
                      'planning': 'Planification',
                      'equipment': 'Équipement',
                      'supplies': 'Approvisionnement',
                      'final': 'Finalisation'
                    };
                    
                    return (
                      <div key={p.id} className="flex items-center gap-2">
                         <div className={cn(
                           "w-7 h-7 rounded-lg flex items-center justify-center border transition-all flex-shrink-0",
                           isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                           phaseActive ? "bg-zinc-800 border-cyan-500/50 text-cyan-500" :
                           "bg-zinc-900 border-zinc-800 text-zinc-700"
                         )}>
                            {p.id === 'planning' ? <CheckCircle2 size={12} /> :
                             p.id === 'equipment' ? <Backpack size={12} /> :
                             p.id === 'supplies' ? <Package size={12} /> :
                             <Rocket size={12} />}
                         </div>
                         <span className={cn("text-[9px] font-black uppercase tracking-wide flex-1", 
                            isDone ? "text-emerald-500" : 
                            phaseActive ? "text-cyan-500" : "text-zinc-600"
                         )}>{phaseNames[p.id] || p.name}</span>
                      </div>
                    );
                 })}
              </div>
           </div>

           {/* Priority Tasks */}
           <div className="mb-6">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Tâches Prioritaires</span>
              <div className="space-y-2">
              {allTasks.filter(t => t.status === 'in-progress' || (t.status === 'todo' && t.priority === 'critical')).slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-zinc-900/50 rounded-lg cursor-pointer hover:bg-zinc-900/80 transition-colors" onClick={() => router.push('/basecamp/timeline')}>
                   <div className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                      task.status === 'in-progress' ? "border-orange-500 bg-orange-500/10 text-orange-500" :
                      "border-zinc-700 bg-transparent"
                   )}>
                      {task.status === 'in-progress' ? <Activity size={10} /> : null}
                   </div>
                   <span className="text-[10px] font-bold text-white truncate flex-1">{task.title}</span>
                   {task.priority === 'critical' && task.status !== 'done' && (
                     <span className="text-[8px] font-black text-red-500 uppercase">!</span>
                   )}
                </div>
              ))}
              </div>
           </div>

           <div className="flex-1 space-y-3 relative ml-3 border-l-2 border-zinc-800 pl-6 overflow-y-auto pr-2 max-h-[400px] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {allTasks.slice(0, 15).map((item, i) => {
                 const realDate = calculateDateFromJ(item.dueDate, departureDate);
                 const dateDisplay = realDate ? realDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase() : item.dueDate;
                 const isToday = realDate && Math.abs(realDate.getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000;
                 const daysFromNow = realDate ? Math.ceil((realDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                 const isUrgent = daysFromNow !== null && daysFromNow >= 0 && daysFromNow <= 3;
                 
                 const isDone = item.status === 'done';
                 const isActive = item.status === 'in-progress';
                 
                 return (
                <div key={item.id} className="relative group pl-2 pb-2">
                   {/* Connecting Line */}
                   {i !== allTasks.slice(0, 15).length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-0 w-[1px] bg-zinc-800 group-hover:bg-zinc-700 transition-colors" />
                   )}

                   <div className={cn(
                     "relative flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 cursor-pointer group/item",
                     isDone ? "bg-zinc-900/20 border-transparent opacity-50 hover:opacity-80" :
                     isActive ? "bg-linear-to-r from-orange-500/10 to-transparent border-orange-500/30 hover:border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]" :
                     "bg-zinc-900/40 border-white/5 hover:bg-zinc-800 hover:border-white/10"
                   )} onClick={() => router.push('/basecamp/timeline')}>
                      
                      {/* Status Icon */}
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 z-10",
                        isDone ? "bg-black border-emerald-500/50 text-emerald-500 group-hover/item:border-emerald-500" :
                        isActive ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/40 scale-110" :
                        "bg-black border-zinc-700 text-zinc-600 group-hover/item:border-zinc-500 group-hover/item:text-zinc-400"
                      )}>
                         {isDone && <Check size={12} strokeWidth={3} />}
                         {isActive && <Activity size={12} className="animate-pulse" />}
                         {!isDone && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-0.5">
                            <span className={cn(
                               "text-[9px] font-black uppercase tracking-[0.15em]",
                               isActive ? "text-orange-400" : "text-zinc-600 group-hover/item:text-zinc-500"
                            )}>{dateDisplay}</span>
                            
                            {/* Priority Dot */}
                            {item.priority === 'critical' && !isDone && (
                               <div className="flex h-1.5 w-1.5 p-0.5 rounded-full bg-red-500/20">
                                  <div className="w-full h-full rounded-full bg-red-500 animate-pulse" />
                               </div>
                            )}
                         </div>
                         <h4 className={cn(
                            "text-xs font-bold leading-tight truncate transition-colors",
                            isDone ? "text-zinc-500 line-through decoration-zinc-700" : 
                            isActive ? "text-white" : "text-zinc-300 group-hover/item:text-zinc-100"
                         )}>
                            {item.title}
                         </h4>
                      </div>
                   </div>
                </div>
              )})}
           </div>
           
           <div className="pt-4 mt-auto border-t border-white/5">
              <Link href="/basecamp/timeline" className="block">
                 <button className="w-full py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group">
                    Voir tout le planning ({allTasks.length})
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </Link>
           </div>
        </Card>

      </div>
    </div>
  );
}
