"use client";

import { useState, useMemo } from "react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type TaskStatus = 'done' | 'active' | 'pending';

interface Task {
  id: number;
  label: string;
  status: TaskStatus;
  date: string;
}

interface Phase {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending';
  icon: any;
  sub: string;
  range: [number, number]; // J-60 to J-45 etc.
  tasks: Task[];
}

const PHASES_DATA: Phase[] = [
  { 
    id: 'plan', 
    label: 'Planification', 
    status: 'done', 
    icon: Icons.SimpleCheck, 
    sub: 'Terminé',
    range: [60, 45],
    tasks: [
      { id: 101, label: 'Définir l\'itinéraire (GR20 Nord)', status: 'done', date: 'J-58' },
      { id: 102, label: 'Réserver les billets d\'avion (Ajaccio)', status: 'done', date: 'J-55' },
      { id: 103, label: 'Créer le budget prévisionnel', status: 'done', date: 'J-52' },
      { id: 104, label: 'Recruter les coéquipiers d\'expédition', status: 'done', date: 'J-50' },
      { id: 105, label: 'Étudier les profils d\'élévation techniques', status: 'done', date: 'J-48' },
      { id: 106, label: 'Réserver les refuges (PNRC)', status: 'done', date: 'J-46' },
    ]
  },
  { 
    id: 'gear', 
    label: 'Matériel', 
    status: 'active', 
    icon: Icons.NavPack, 
    sub: 'En cours',
    range: [45, 15],
    tasks: [
      { id: 201, label: 'Inventaire complet du garage', status: 'done', date: 'J-40' },
      { id: 202, label: 'Valider la liste matériel finale', status: 'done', date: 'J-35' },
      { id: 203, label: 'Achat tente ultra-légère (Big Agnes)', status: 'done', date: 'J-30' },
      { id: 204, label: 'Optimiser le poids du sac (Target < 5kg)', status: 'active', date: 'Actif' },
      { id: 205, label: 'Tester le nouveau réchaud Jetboil', status: 'pending', date: 'J-20' },
      { id: 206, label: 'Peser chaque item sur balance de précision', status: 'pending', date: 'J-18' },
      { id: 207, label: 'Ajuster le sac sur mannequin 3D', status: 'pending', date: 'J-16' },
    ]
  },
  { 
    id: 'food', 
    label: 'Ravitaillement', 
    status: 'pending', 
    icon: Icons.CatFood, 
    sub: 'J-15',
    range: [15, 5],
    tasks: [
      { id: 301, label: 'Calculer les calories par jour (3500 kcal)', status: 'pending', date: 'J-12' },
      { id: 302, label: 'Commander repas lyophilisés (Real Turmat)', status: 'pending', date: 'J-10' },
      { id: 303, label: 'Préparation des mélange de noix/barres', status: 'pending', date: 'J-8' },
      { id: 304, label: 'Planifier les points d\'eau critiques', status: 'pending', date: 'J-7' },
      { id: 305, label: 'Préparer les colis de ravitaillement (Vizzavona)', status: 'pending', date: 'J-6' },
    ]
  },
  { 
    id: 'start', 
    label: 'Départ', 
    status: 'pending', 
    icon: Icons.Trophy, 
    sub: 'J-0',
    range: [5, 0],
    tasks: [
      { id: 401, label: 'Vérifier la météo finale à 2000m', status: 'pending', date: 'J-2' },
      { id: 402, label: 'Charger les traces GPS (Watch & Mobile)', status: 'pending', date: 'J-1' },
      { id: 403, label: 'Dernier check-up du sac chargé', status: 'pending', date: 'J-1' },
      { id: 404, label: 'Activer la balise de secours Garmin InReach', status: 'pending', date: 'J-0' },
      { id: 405, label: 'Transport vers Calenzana', status: 'pending', date: 'J-0' },
    ]
  },
];

export default function TimelinePage() {
  const [activePhaseId, setActivePhaseId] = useState<string>('gear');
  const currentJ = 22; // Current status is J-22

  const activePhase = useMemo(() => 
    PHASES_DATA.find(p => p.id === activePhaseId) || PHASES_DATA[1]
  , [activePhaseId]);

  // Logic for the progress bar: J-60 is 0%, J-0 is 100%
  // Progress = (60 - currentJ) / 60
  const progressPercent = ((60 - currentJ) / 60) * 100;
  
  // Phase 1 (Planification) occupies 25% of the total 60-day horizontal scale (15 days / 60)
  const phase1Width = (15 / 60) * 100;

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-300 pb-20">
      {/* HEADER */}
      <header className="h-14 border-b border-border-subtle flex items-center justify-between px-6 bg-bg-surface-1/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Icons.Activity className="w-5 h-5 text-text-muted" />
          <h1 className="text-base font-black text-text-primary tracking-tight uppercase">Timeline Mission</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-accent-cyan-muted text-accent-cyan text-[10px] font-black px-2 py-0.5 rounded tracking-tighter shadow-sm ring-1 ring-accent-cyan/20">
            J-{currentJ}
          </span>
        </div>
      </header>

      <div className="p-6 max-w-[1000px] mx-auto space-y-8 mt-4 animate-slide-up">
        
        {/* MAIN CONTAINER */}
        <section className="premium-card rounded-3xl p-8 bg-bg-surface-2/40 border-border-subtle">
          
          {/* TOP PROGRESS BAR */}
          <div className="relative mb-12">
            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">
              <span>J-60</span>
              <span>J-45</span>
              <span>J-30</span>
              <span>J-15</span>
              <span>J-7</span>
              <span className="text-accent-cyan">J-0</span>
            </div>
            
            <div className="h-2 bg-bg-surface-4 rounded-full relative overflow-hidden">
              {/* Completed Phase 1 (Green) */}
              <div 
                className="absolute inset-y-0 left-0 bg-emerald-500 rounded-l-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" 
                style={{ width: `${phase1Width}%` }}
              />
              {/* Active Phase 2 (Cyan) - starts after Phase 1 and goes up to current progress */}
              <div 
                className="absolute inset-y-0 bg-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-1000" 
                style={{ 
                  left: `${phase1Width}%`, 
                  width: `${progressPercent - phase1Width}%` 
                }}
              />
              
              {/* Pulse Dot at Current Position */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-accent-cyan rounded-full border-2 border-bg-surface-1 shadow-[0_0_12px_rgba(34,211,238,0.8)] z-10 transition-all duration-1000 animate-pulse" 
                style={{ left: `calc(${progressPercent}% - 8px)` }}
              />
            </div>
          </div>

          {/* PHASES GRID */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {PHASES_DATA.map((phase) => (
              <button 
                key={phase.id}
                onClick={() => setActivePhaseId(phase.id)}
                className={cn(
                  "premium-card rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer transition-all border-2",
                  activePhaseId === phase.id 
                    ? "border-accent-cyan/40 bg-accent-cyan/5 shadow-[0_0_30px_rgba(34,211,238,0.08)] scale-[1.02]" 
                    : phase.status === 'done'
                    ? "border-emerald-500/10 hover:border-emerald-500/30 opacity-80"
                    : "border-transparent bg-bg-surface-2/50 hover:bg-bg-surface-3 opacity-50"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
                  activePhaseId === phase.id
                    ? "bg-accent-cyan text-bg-surface-1 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                    : phase.status === 'done'
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-bg-surface-4 text-text-faint"
                )}>
                  <phase.icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "text-[10px] font-black uppercase tracking-widest mb-1",
                  activePhaseId === phase.id ? "text-accent-cyan" : phase.status === 'done' ? "text-emerald-500" : "text-text-muted"
                )}>
                  {phase.label}
                </div>
                <div className="text-[9px] font-bold text-text-faint uppercase tracking-tighter">
                  {phase.sub}
                </div>
              </button>
            ))}
          </div>

          {/* TASKS SECTION */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-8 h-[1px] bg-border-subtle" />
                DÉTAILS DE LA PHASE: {activePhase.label}
                <span className="w-8 h-[1px] bg-border-subtle" />
              </h3>
              <span className="text-[9px] font-black text-text-faint uppercase font-mono">
                {activePhase.tasks.length} OBJECTIFS
              </span>
            </div>
            
            <div className="space-y-3">
              {activePhase.tasks.map((task) => (
                <div 
                  key={task.id}
                  className={cn(
                    "flex items-center gap-5 p-4 rounded-2xl transition-all border border-border-subtle group",
                    task.status === 'active' 
                      ? "bg-bg-surface-2 border-accent-cyan/20 ring-1 ring-accent-cyan/10 shadow-lg shadow-accent-cyan/5" 
                      : "bg-bg-surface-3/30 hover:bg-bg-surface-3/60"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all",
                    task.status === 'done'
                      ? "bg-emerald-500 border-emerald-500 text-bg-surface-1" 
                      : task.status === 'active'
                      ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                      : "border-bg-surface-4 bg-bg-surface-4/20 text-transparent group-hover:border-text-faint"
                  )}>
                    {task.status === 'done' ? (
                      <Icons.SimpleCheck className="w-4 h-4" />
                    ) : task.status === 'active' ? (
                      <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_6px_rgba(34,211,238,1)] animate-pulse" />
                    ) : null}
                  </div>
                  
                  <div className={cn(
                    "flex-1 text-sm font-bold tracking-tight transition-all",
                    task.status === 'done' ? "text-text-muted line-through opacity-70" : task.status === 'active' ? "text-text-primary" : "text-text-faint group-hover:text-text-muted"
                  )}>
                    {task.label}
                  </div>
                  
                  <div className={cn(
                    "text-[10px] font-black font-mono tracking-tighter uppercase px-2 py-1 rounded bg-bg-surface-4/40",
                    task.status === 'active' ? "text-accent-cyan bg-accent-cyan/10" : "text-text-faint"
                  )}>
                    {task.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER HINT */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          <p className="text-[10px] font-black text-text-faint uppercase tracking-[0.4em]">Fin de la liste</p>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-border-subtle via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}
