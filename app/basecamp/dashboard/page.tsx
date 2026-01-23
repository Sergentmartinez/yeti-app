"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { 
  Map as MapIcon, Activity, Wind, CheckCircle2, Sparkles, 
  Backpack, Calendar, Plus, Ship, TestTube, Package, Rocket, 
  AlertTriangle, Compass, ChevronRight, CloudSun, Euro, 
  Mountain, TrendingUp, Clock, Target, Zap, Train, Home, 
  UtensilsCrossed, FileCheck, Droplets, Route, Wallet,
  Weight, Flame, ArrowUpRight, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConcentricDonut } from "@/components/ui/ConcentricDonut";
import { useTimelineStore } from "@/lib/store/useTimelineStore";
import type { Task } from "@/lib/types/timeline";

// ============================================================================
// 1. CARTE DYNAMIQUE
// ============================================================================
const DashboardMap = dynamic(() => import('@/components/maps/ExpeditionMap').then(mod => {
  const WrappedMap = () => {
    const GR20_STAGES = [
      { lat: 42.5073, lon: 8.7879, name: "Calenzana" },
      { lat: 42.1123, lon: 9.1345, name: "Vizzavona" },
      { lat: 41.7345, lon: 9.3123, name: "Conca" },
    ];
    return <mod.default stages={GR20_STAGES} />;
  };
  return WrappedMap;
}), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-900/20 animate-pulse" />
});

// ============================================================================
// 2. DESIGN TOKENS
// ============================================================================
const THEME = {
  bg: "bg-[#050505]", 
  card: "bg-[#111111]", 
  cardHover: "hover:bg-[#161616]",
  border: "border-white/[0.08]",
  orange: "#f21e2c", // Orange Yeti
  textMuted: "text-zinc-500",
};

// ============================================================================
// 3. DONNÉES
// ============================================================================

const RINGS_DATA = [
  { id: 'materiel', label: 'Matériel', value: 85, color: THEME.orange }, 
  { id: 'physique', label: 'Physique', value: 62, color: "#06b6d4" }, 
  { id: 'logistique', label: 'Logistique', value: 90, color: "#10b981" },
];

const PACK_PILLS = [
  { label: "BASE", val: "1.8KG", width: "45%", color: "#B21D3B" }, // Rouge foncé
  { label: "VÊT.", val: "1.2KG", width: "25%", color: "#F9591F" }, // Orange
  { label: "CUIS.", val: "0.8KG", width: "20%", color: "#FF8C42" }, // Orange clair
  { label: "ÉLEC", val: "0.4", width: "10%", color: "#FEC631" }, // Jaune
];

const BUDGET_DATA = [
  { label: "Transport", value: 320, color: "#B21D3B" }, // Rouge foncé
  { label: "Refuges", value: 280, color: "#F9591F" },   // Orange
  { label: "Bouffe", value: 150, color: "#FEC631" },    // Jaune
];

// Helper pour convertir les tâches du store au format dashboard
const convertTaskForTimeline = (task: Task) => {
  return {
    id: task.id,
    date: task.dueDate,
    title: task.title,
    status: task.status,
    priority: task.priority
  };
};

// Helper pour convertir J-XX en date formatée
const formatDueDate = (dueDate: string): string => {
  const match = dueDate.match(/J-(\d+)/);
  if (!match) return dueDate;
  
  const daysUntil = parseInt(match[1]);
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntil);
  
  const day = targetDate.getDate().toString().padStart(2, '0');
  const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
  const month = months[targetDate.getMonth()];
  
  return `${day} ${month}`;
};

// Helper pour trier les tâches (en cours/urgent en haut, complétées en bas)
const sortTasksForDisplay = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => {
    // 1. Les tâches complétées vont en bas
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    
    // 2. Parmi les non-complétées, trier par priorité (critical > high > medium > low)
    if (a.status !== 'done' && b.status !== 'done') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority] ?? 99;
      const bPriority = priorityOrder[b.priority] ?? 99;
      if (aPriority !== bPriority) return aPriority - bPriority;
    }
    
    // 3. Ensuite par date (J-60 avant J-30, etc.)
    const aMatch = a.dueDate.match(/J-(\d+)/);
    const bMatch = b.dueDate.match(/J-(\d+)/);
    if (aMatch && bMatch) {
      return parseInt(bMatch[1]) - parseInt(aMatch[1]);
    }
    
    return 0;
  });
};

// ============================================================================
// 4. COMPOSANTS UI
// ============================================================================

const Card = ({ children, className, title, headerIcon, onClick, noPadding }: any) => (
  <motion.div 
    whileHover={onClick ? { scale: 1.002 } : undefined}
    onClick={onClick}
    className={cn(
      "relative rounded-[24px] border overflow-hidden flex flex-col transition-colors",
      THEME.card, THEME.border, onClick && THEME.cardHover,
      !noPadding && "p-5",
      className
    )}
  >
    {(title || headerIcon) && (
      <div className="flex items-start justify-between mb-4 z-10 relative">
        {title && (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 font-sans mt-1">
            {title}
          </span>
        )}
        {headerIcon}
      </div>
    )}
    {children}
  </motion.div>
);

const PillGauge = () => (
  <div className="flex items-center gap-1 h-10 w-full mt-2">
    {PACK_PILLS.map((p, i) => (
      <div 
        key={i}
        className="h-full rounded-xl relative flex items-center justify-center first:rounded-l-xl last:rounded-r-xl overflow-hidden"
        style={{ width: p.width, backgroundColor: p.color }}
      >
        <span className="text-[9px] font-black text-black/70 truncate px-1">{p.val}</span>
      </div>
    ))}
  </div>
);

// ============================================================================
// 5. PAGE DASHBOARD
// ============================================================================

export default function DashboardPage() {
  const router = useRouter();
  const { phases, stats, toggleTask, loadFromTemplate, updateTask } = useTimelineStore();
  
  // Charger le template GR20 au premier rendu si aucune tâche
  React.useEffect(() => {
    const allTasksCheck = phases.flatMap(phase => phase.tasks);
    if (allTasksCheck.length === 0) {
      loadFromTemplate('GR20');
    }
  }, [phases, loadFromTemplate]);

  // Activer une tâche au chargement pour la démo
  React.useEffect(() => {
    const allTasks = phases.flatMap(phase => phase.tasks);
    const hasInProgress = allTasks.some(t => t.status === 'in-progress');
    if (allTasks.length > 0 && !hasInProgress) {
      const taskToActivate = allTasks.find(t => t.priority === 'critical' || t.priority === 'high');
      if (taskToActivate) {
        updateTask(taskToActivate.id, { status: 'in-progress' });
      }
    }
  }, [phases, updateTask]);
  
  // Récupérer toutes les tâches de toutes les phases
  const allTasks = useMemo(() => {
    return phases.flatMap(phase => phase.tasks);
  }, [phases]);
  
  // Trier et limiter les tâches pour l'affichage
  const sortedTasks = useMemo(() => {
    return sortTasksForDisplay(allTasks).slice(0, 8); // Limiter à 8 tâches max
  }, [allTasks]);
  
  // Récupérer les tâches prioritaires (non complétées avec priorité critical ou high)
  const priorityTasks = useMemo(() => {
    return allTasks
      .filter(t => t.status !== 'done' && (t.priority === 'critical' || t.priority === 'high'))
      .slice(0, 3);
  }, [allTasks]);
  
  // Compter le nombre total de tâches
  const totalTasksCount = allTasks.length;
  
  return (
    <div className={cn("h-screen font-sans bg-[#050505] overflow-hidden flex flex-col selection:bg-orange-500/30")}>
      <div className="flex-1 flex flex-col px-6 md:px-8 py-6 max-w-[1800px] mx-auto w-full h-full">

        {/* --- HEADER COMPACT --- */}
        <header className="flex items-center justify-between mb-6 shrink-0 h-16">
          <div className="flex items-center gap-8">
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Projet Actif</span>
               </div>
               <h1 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">
                 BASECAMP
               </h1>
            </div>
            <div className="h-10 w-px bg-white/10 mx-4 hidden md:block" />
            <div className="flex items-center gap-6 text-zinc-500 font-medium text-sm hidden md:flex">
               <span className="text-white font-bold">GR20 NORD → SUD</span>
               <span><span style={{ color: THEME.orange }}>J-58</span> AVANT DÉPART</span>
               <span>4.2 KG</span>
            </div>
          </div>
          
          <button className="group h-10 px-6 bg-[#B21D3B] hover:bg-[#F9591F] text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#B21D3B]/20 hover:shadow-[#F9591F]/20">
            <Plus size={14} strokeWidth={3} className="text-white transition-colors" /> 
            AJOUTER ITEM
          </button>
        </header>

        {/* --- GRID (Calculée pour tenir sur une page) --- */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 pb-2">
          
          {/* === GAUCHE (8/12) === */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 h-full">
            
            {/* ROW 1: KPIs (Hauteur fixe ~180px) */}
            <div className="grid grid-cols-4 gap-4 h-[180px] shrink-0">
              
              {/* 1. Préparation */}
              <Card className="col-span-1" title="Préparation" headerIcon={<Activity className="text-zinc-700" size={18} />}>
                <div className="flex-1 flex items-center justify-center -mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-7xl font-black text-[#b31e3c] tracking-tighter">78</span>
                    <span className="text-2xl font-black text-zinc-600">%</span>
                  </div>
                </div>
              </Card>

              {/* 2. Poids Sac */}
              <Card className="col-span-1" title="Poids Sac" headerIcon={<Weight className="text-[#f21e2c]" size={18} />}>
                 <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black text-[#f21e2c] tracking-tighter leading-none">4.2</span>
                    <span className="text-[10px] font-bold text-zinc-500 mb-1">KG</span>
                    <span className="ml-auto text-[8px] font-bold text-emerald-500 uppercase tracking-wide bg-emerald-500/10 px-1.5 py-0.5 rounded">Optimisé</span>
                 </div>
                 <div className="mt-auto">
                    <PillGauge />
                    <div className="flex justify-between text-[8px] font-black text-zinc-600 mt-1.5 uppercase">
                       {PACK_PILLS.map(p => <span key={p.label}>{p.label}</span>)}
                    </div>
                 </div>
              </Card>

              {/* 3. Budget */}
              <Card className="col-span-1" title="Budget" headerIcon={<Wallet className="text-[#f21e2c]" size={18} />}>
                 <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black text-[#f21e2c] tracking-tighter leading-none">847</span>
                    <span className="text-[10px] font-bold text-zinc-500 mb-1">€</span>
                 </div>
                 <div className="mt-auto space-y-2">
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                       {BUDGET_DATA.map((b, i) => (
                          <div key={i} style={{ width: `${(847 / 1200) * 100}%`, backgroundColor: b.color }} />
                       ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                       <span className="text-zinc-500">Limit: 1200€</span>
                       <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">OK</span>
                    </div>
                 </div>
              </Card>

              {/* 4. Météo */}
              <Card className="col-span-1" title="Météo Direct" headerIcon={<CloudSun className="text-[#f21e2c]" size={18} />}>
                 <div className="flex flex-col mb-2">
                    <span className="text-4xl font-black text-[#f21e2c] tracking-tighter leading-none">12°</span>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase mt-1.5">Calenzana</span>
                 </div>
                 <div className="mt-auto grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
                    {['09', '12', '15', '18'].map((h, i) => (
                       <div key={i} className="text-center">
                          <span className="text-[10px] font-bold text-zinc-500 block mb-1">{h}h</span>
                          <div className="text-xs font-black text-white">{[8, 12, 11, 7][i]}°</div>
                       </div>
                    ))}
                 </div>
              </Card>
            </div>

            {/* ROW 2: CARTE REMONTÉE (Hauteur flexible) */}
            <Card className="flex-1 p-0 overflow-hidden relative group border-0 min-h-[250px]" noPadding>
               <div className="absolute top-4 left-4 z-10">
                  <span className="bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-white flex items-center gap-2 shadow-xl">
                     <Compass size={12} className="text-[#FF4500]" /> Focus Itinéraire
                  </span>
               </div>
               <div className="w-full h-full transition-all duration-700">
                  <DashboardMap />
               </div>
               {/* Stats sur la carte */}
               <div className="absolute bottom-8 left-8 z-20 flex gap-12">
                  <div>
                     <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Distance</span>
                     <span className="text-5xl font-black text-[#f21e2c] tracking-tighter">180<span className="text-lg text-zinc-500 ml-2">KM</span></span>
                  </div>
                  <div>
                     <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Dénivelé</span>
                     <span className="text-5xl font-black text-[#f21e2c] tracking-tighter">11<span className="text-lg text-zinc-500 ml-2">KM+</span></span>
                  </div>
                  <div>
                     <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Difficulté</span>
                     <span className="text-5xl font-black text-[#f21e2c] tracking-tighter">5<span className="text-lg text-zinc-500 ml-2">/5</span></span>
                  </div>
               </div>
            </Card>

            {/* ROW 3: SHERPA AI (Design exact sherpa1.jpg) */}
            <Card className="bg-[#111111] border-indigo-500/20 h-[220px] shrink-0 relative overflow-hidden" noPadding>
               <div className="absolute inset-0 bg-[url('/images/stripes.jpg')] opacity-20 pointer-events-none" style={{ backgroundSize: '100% 100%', backgroundPosition: 'top', transform: 'scaleY(-1)' }} />
               <div className="p-6 h-full flex flex-col justify-between relative">
                  
                  {/* Top: Header + Stats Right */}
                  <div className="flex justify-between items-start">
                     <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-2">
                           <Sparkles className="w-4 h-4 text-indigo-400" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Sherpa AI Analysis</span>
                           <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-[9px] font-bold text-indigo-300 uppercase">Prioritaire</span>
                        </div>
                        <h2 className="text-xl font-black text-white leading-tight mb-1">
                           Le vent s&apos;annonce violent (&gt;80km/h) pour votre étape au Col de Vergio.
                        </h2>
                        <p className="text-zinc-400 text-xs font-medium">
                           Votre <span className="text-white font-bold">Tente MSR Hubba</span> est adaptée mais je recommande un haubanage renforcé.
                        </p>
                     </div>

                     {/* Stats Right Block */}
                     <div className="flex gap-2">
                        <div className="bg-[#1a1a1c] rounded-lg p-2 min-w-[70px] text-center border border-white/5">
                           <Wind className="w-4 h-4 text-zinc-500 mx-auto mb-1" />
                           <div className="text-[8px] font-black uppercase text-zinc-600">Rafales</div>
                           <div className="text-sm font-black text-white">85 km/h</div>
                        </div>
                        <div className="bg-[#1a1a1c] rounded-lg p-2 min-w-[70px] text-center border border-white/5">
                           <Activity className="w-4 h-4 text-zinc-500 mx-auto mb-1" />
                           <div className="text-[8px] font-black uppercase text-zinc-600">Risque</div>
                           <div className="text-sm font-black text-white">Élevé</div>
                        </div>
                     </div>
                  </div>

                  {/* Bottom: 3 Colored Cards (Horizontal) */}
                  <div className="grid grid-cols-3 gap-3 mt-2">
                     {/* Rouge */}
                     <div className="bg-[#220a0a] border-l-2 border-red-600 p-3 rounded flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-0.5">
                           <AlertTriangle size={12} className="text-red-500" />
                           <span className="text-[9px] font-black text-red-500 uppercase">Conflit</span>
                        </div>
                        <span className="text-[10px] font-bold text-red-200/80 leading-tight">Tente assignée 2x.</span>
                     </div>
                     {/* Bleu */}
                     <div className="bg-[#0a1022] border-l-2 border-blue-500 p-3 rounded flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-0.5">
                           <Wind size={12} className="text-blue-500" />
                           <span className="text-[9px] font-black text-blue-500 uppercase">Météo J-5</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-200/80 leading-tight">-2°C ressenti -8°.</span>
                     </div>
                     {/* Vert */}
                     <div className="bg-[#0a1a10] border-l-2 border-emerald-500 p-3 rounded flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-0.5">
                           <Sparkles size={12} className="text-emerald-500" />
                           <span className="text-[9px] font-black text-emerald-500 uppercase">Optimisation</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-200/80 leading-tight">TOAKS 650ml = -280g.</span>
                     </div>
                  </div>

               </div>
            </Card>

          </div>

          {/* === DROITE (4/12) : TIMELINE === */}
          <div className="col-span-12 lg:col-span-4 flex flex-col h-full bg-[#111111] rounded-[24px] border border-white/[0.08] overflow-hidden relative">
             {/* Image de fond red_target BORD À BORD */}
             <div 
               className="absolute inset-0 bg-[url('/images/red_target.png')] bg-fill bg-center opacity-20 pointer-events-none rounded-[24px]" 
               style={{ transform: "scaleX(-1)" }}
             />
             {/* Gradient vertical pour assombrir vers le bas */}
             <div 
               className="absolute inset-0 pointer-events-none rounded-[24px]" 
               style={{ background: "linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.5) 100%)" }}
             />
             
             {/* Contenu avec padding par-dessus l'image */}
             <div className="relative z-10 flex flex-col h-full p-6">
             
             {/* Header J-58 */}
             <div className="mb-6 border-b border-white/5 pb-6">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-2">Timeline Mission</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-7xl font-black tracking-tighter" style={{ color: '#B21D3B' }}>J-</span>
                   <span className="text-7xl font-black tracking-tighter" style={{ color: '#B21D3B' }}>58</span>
                </div>
                <div className="flex justify-between items-end mt-2">
                   <span className="text-xs font-bold text-zinc-400">21 Mars 2026</span>
                   <span className="text-[10px] font-bold text-zinc-600 uppercase">Départ</span>
                </div>
                
                {/* Phases */}
                <div className="flex gap-1 mt-4">
                   <div className="flex-1 h-1 bg-emerald-500 rounded-full" />
                   <div className="flex-1 h-1 bg-zinc-800 rounded-full" />
                   <div className="flex-1 h-1 bg-zinc-800 rounded-full" />
                   <div className="flex-1 h-1 bg-zinc-800 rounded-full" />
                </div>
                <div className="flex justify-between text-[8px] font-black text-zinc-600 mt-1.5 uppercase">
                   <span className="text-emerald-500">Planification</span>
                   <span>Matériel</span>
                   <span>Ravitaillement</span>
                   <span>Départ</span>
                </div>
             </div>

             {/* Tâches Prioritaires */}
             <div className="mb-6 shrink-0">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-3 pl-1">Priorités ({priorityTasks.length})</span>
                <div className="space-y-2">
                   {priorityTasks.map((task) => (
                      <div 
                         key={task.id} 
                         className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                         onClick={() => toggleTask(task.id)}
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors" />
                            <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">{task.title}</span>
                         </div>
                         <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.5 rounded",
                            task.priority === 'critical' ? "text-red-500 bg-red-500/10" : "text-orange-500 bg-orange-500/10"
                         )}>!</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Timeline Verticale */}
             <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
                <div className="flex-1 flex flex-col">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-3 pl-1">Planning</span>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative pl-2">
                       
                       <div className="space-y-6 pb-4">
                          {sortedTasks.map((task, index) => {
                             const isActive = index === 3; // La 4ème tâche est maintenant la tâche active
                             const isDone = task.status === 'done';
                             
                             return (
                                <div 
                                   key={task.id} 
                                   className="relative flex items-center gap-4 group"
                                >
                                   {/* Ligne avant le premier cercle */}
                                   {index === 0 && (
                                      <div className="absolute left-5 bottom-[38px] w-0.5 h-[32px] bg-zinc-800 z-0" />
                                   )}
                                   
                                   {/* Segment de ligne verticale vers le cercle suivant */}
                                   {index < sortedTasks.length - 1 && (
                                      <div className="absolute left-5 top-[38px] w-0.5 h-[64px] bg-zinc-800 z-0" />
                                   )}
                                   
                                   {/* Ligne après le dernier cercle */}
                                   {index === sortedTasks.length - 1 && (
                                      <div className="absolute left-5 top-[38px] w-0.5 h-[32px] bg-zinc-800 z-0" />
                                   )}
                                   
                                   {/* Dot (40px width) */}
                                   <div className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 border-2 transition-colors bg-[#111111]",
                                      isActive ? `border-[${THEME.orange}] text-white` : 
                                      isDone ? "border-zinc-700 text-zinc-500" : "border-zinc-800 text-zinc-700"
                                   )} style={{ borderColor: isActive ? THEME.orange : undefined }}>
                                      {isDone ? <Check size={14} /> : 
                                       isActive ? <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: THEME.orange }} /> : 
                                       <div className="w-2 h-2 bg-zinc-800 rounded-full" />}
                                   </div>
                                   
                                   <div className={cn(
                                      "flex-1 p-3 rounded-xl transition-all border",
                                      isActive ? `bg-[#FF4500]/5 border-[#FF4500]/20` : "border-transparent"
                                   )}>
                                      <span className={cn(
                                         "text-[9px] font-black uppercase tracking-widest block mb-0.5",
                                         isActive ? "text-[#FF4500]" : "text-zinc-600"
                                      )}>{formatDueDate(task.dueDate)}</span>
                                      <span className={cn(
                                         "text-sm font-bold transition-colors",
                                         isActive ? "text-white" : isDone ? "text-zinc-500 line-through" : "text-zinc-400"
                                      )}>{task.title}</span>
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>
                    
                    {/* Bouton Voir tout le planning */}
                    <div className="pt-4 border-t border-white/5 mt-2">
                       <button
                          onClick={() => router.push('/basecamp/timeline')}
                          className="w-full group flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-[#FF4500]/30 hover:bg-[#FF4500]/5 transition-all"
                       >
                          <div className="flex items-center gap-2">
                             <Calendar size={14} className="text-zinc-500 group-hover:text-[#FF4500] transition-colors" />
                             <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                                Voir tout le planning
                             </span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-zinc-600 group-hover:text-zinc-400">({totalTasksCount})</span>
                             <ChevronRight size={14} className="text-zinc-600 group-hover:text-[#FF4500] transition-colors" />
                          </div>
                       </button>
                    </div>
                </div>
             </div>
             
             </div> {/* Fermeture du div content avec padding */}

          </div>

        </div>
      </div>
    </div>
  );
}
