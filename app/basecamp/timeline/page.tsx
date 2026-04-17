// app/basecamp/timeline/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Calendar, Check, ChevronDown, ChevronRight, Star, Edit3,
  Trash2, MoreVertical, Plane, Train, Home, FileText, Backpack,
  UtensilsCrossed, Flame, Sparkles, AlertTriangle, Target, Clock,
  X, Circle, CheckCircle2, CalendarDays, ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimelineStore } from "@/lib/store/useTimelineStore";
import type { Task, Priority } from "@/lib/types/timeline";

// ============================================================================
// DESIGN TOKENS — aligné Dashboard
// ============================================================================
const THEME = {
  red: "#f21e2c",
  redDark: "#B21D3B",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  pink: "#ec4899",
};

// ============================================================================
// MAPPING PHASES → ICÔNES & COULEURS ACCESSIBLES
// ============================================================================
type IconType = React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; fill?: string; strokeWidth?: number }>;

const PHASE_META: Record<
  string,
  { icon: IconType; color: string; title: string; subtitle: string }
> = {

  planning: {
    icon: FileText,
    color: THEME.violet,
    title: "Administratif & Réservations",
    subtitle: "Papiers, gîtes, transport",
  },
  equipment: {
    icon: Backpack,
    color: THEME.red,
    title: "Matériel & Équipement",
    subtitle: "Ce qu'il faut acheter, tester, réparer",
  },
  supplies: {
    icon: UtensilsCrossed,
    color: THEME.emerald,
    title: "Ravitaillement & Nourriture",
    subtitle: "Vivres, gaz, électrolytes",
  },
  final: {
    icon: Flame,
    color: THEME.orange,
    title: "Derniers jours",
    subtitle: "Dernier sprint avant le départ",
  },
};

// ============================================================================
// HELPERS DATES
// ============================================================================
const STORAGE_KEY_DEPARTURE = "yeti_departure_date";

const getDefaultDeparture = () => {
  // Par défaut : dans 45 jours
  const d = new Date();
  d.setDate(d.getDate() + 45);
  d.setHours(7, 0, 0, 0);
  return d;
};

const parseJMinus = (dueDate: string): number => {
  const m = dueDate.match(/J([+-]?\d+)/);
  if (!m) return 0;
  return parseInt(m[1], 10);
};

const formatDateFR = (d: Date) =>
  d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

const formatDateShort = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

const daysUntil = (target: Date): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.ceil((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const taskDate = (dueDate: string, departure: Date): Date => {
  const daysOffset = parseJMinus(dueDate); // J-45 => -45, J+0 => 0
  const d = new Date(departure);
  d.setDate(d.getDate() + daysOffset);
  return d;
};

// ============================================================================
// PRIORITÉ UI
// ============================================================================
const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  critical: { label: "Critique", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  high: { label: "Important", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  medium: { label: "Normal", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  low: { label: "Faible", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

// ============================================================================
// PAGE
// ============================================================================
export default function TimelinePage() {
  const {
    phases,
    stats,
    loadFromTemplate,
    addTask,
    toggleTask,
    deleteTask,
    toggleStar,
    updateTask,
    recomputeStats,
  } = useTimelineStore();

  // Date de départ (persistée)
  const [departure, setDeparture] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_DEPARTURE);
      if (saved) return new Date(saved);
    }
    return getDefaultDeparture();
  });
  const [editingDeparture, setEditingDeparture] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_DEPARTURE, departure.toISOString());
    }
  }, [departure]);

  // Charger template GR20 automatiquement si aucune tâche
  useEffect(() => {
    const allTasks = phases.flatMap((p) => p.tasks);
    if (allTasks.length === 0) loadFromTemplate("GR20");
  }, [phases, loadFromTemplate]);

  useEffect(() => {
    recomputeStats();
  }, [recomputeStats]);

  const [filter, setFilter] = useState<"all" | "today" | "week" | "starred" | "overdue">("all");
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickAddPhaseId, setQuickAddPhaseId] = useState<string | null>(null);

  const dDay = daysUntil(departure);

  // Toutes les tâches avec leur date calculée
  const tasksWithDate = useMemo(() => {
    return phases.flatMap((phase) =>
      phase.tasks.map((task) => ({
        ...task,
        realDate: taskDate(task.dueDate, departure),
        daysLeft: parseJMinus(task.dueDate) + dDay,
        phaseId: phase.id,
      }))
    );
  }, [phases, departure, dDay]);

  // Filtres
  const filterPredicate = (t: (typeof tasksWithDate)[number]): boolean => {
    if (filter === "starred") return !!t.starred;
    if (filter === "today") return t.daysLeft === 0 && t.status !== "done";
    if (filter === "week") return t.daysLeft >= 0 && t.daysLeft <= 7 && t.status !== "done";
    if (filter === "overdue") return t.daysLeft < 0 && t.status !== "done";
    return true;
  };

  // Stats en live
  const liveStats = useMemo(() => {
    const all = tasksWithDate;
    const done = all.filter((t) => t.status === "done").length;
    const critical = all.filter((t) => t.priority === "critical" && t.status !== "done").length;
    const overdue = all.filter((t) => t.daysLeft < 0 && t.status !== "done").length;
    const thisWeek = all.filter(
      (t) => t.daysLeft >= 0 && t.daysLeft <= 7 && t.status !== "done"
    ).length;
    const starred = all.filter((t) => t.starred).length;
    const pct = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
    return { total: all.length, done, critical, overdue, thisWeek, starred, pct };
  }, [tasksWithDate]);

  // Prochaines tâches urgentes (pour la sidebar)
  const upcomingTasks = useMemo(() => {
    return tasksWithDate
      .filter((t) => t.status !== "done")
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [tasksWithDate]);

  const toggleCollapse = (phaseId: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-16 selection:bg-red-600/30">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6">

        {/* ============================ HEADER / COUNTDOWN ============================ */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
              Planification du départ
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                Timeline du voyage
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                Toutes vos tâches à accomplir avant le départ : papiers, réservations,
                matériel, logistique. Cochez au fur et à mesure, rien ne passe à la trappe.
              </p>
            </div>

            {/* COUNTDOWN GÉANT */}
            <CountdownBlock
              departure={departure}
              dDay={dDay}
              onEditClick={() => setEditingDeparture(true)}
            />
          </div>
        </header>

        {/* ============================ STATS ============================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Progression"
            value={`${liveStats.pct}%`}
            hint={`${liveStats.done} / ${liveStats.total} tâches faites`}
            color={THEME.emerald}
            icon={CheckCircle2}
          />
          <StatCard
            label="Cette semaine"
            value={liveStats.thisWeek.toString()}
            hint="À faire dans les 7 jours"
            color={THEME.cyan}
            icon={CalendarDays}
          />
          <StatCard
            label="Critiques"
            value={liveStats.critical.toString()}
            hint="À traiter en priorité"
            color={THEME.red}
            icon={AlertTriangle}
          />
          <StatCard
            label="En retard"
            value={liveStats.overdue.toString()}
            hint={liveStats.overdue === 0 ? "Tout est sous contrôle 👌" : "Nécessitent votre attention"}
            color={liveStats.overdue > 0 ? THEME.red : "#64748b"}
            icon={Clock}
          />
        </div>

        {/* ============================ PROGRESS BAR ============================ */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-white">Avancement global</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {liveStats.done} tâches terminées sur {liveStats.total}
              </div>
            </div>
            <div className="text-3xl font-black text-white tabular-nums">
              {liveStats.pct}<span className="text-sm text-zinc-500">%</span>
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${liveStats.pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${THEME.red} 0%, ${THEME.orange} 50%, ${THEME.emerald} 100%)`,
              }}
            />
          </div>
        </div>

        {/* ============================ FILTRES + CONTENU ============================ */}
        <div className="grid grid-cols-12 gap-6">
          {/* --- MAIN --- */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Filter tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")} icon={ListChecks}>
                Toutes <Badge>{liveStats.total}</Badge>
              </FilterChip>
              <FilterChip
                active={filter === "week"}
                onClick={() => setFilter("week")}
                icon={CalendarDays}
              >
                Cette semaine <Badge>{liveStats.thisWeek}</Badge>
              </FilterChip>
              <FilterChip
                active={filter === "overdue"}
                onClick={() => setFilter("overdue")}
                icon={Clock}
                color={THEME.red}
              >
                En retard <Badge>{liveStats.overdue}</Badge>
              </FilterChip>
              <FilterChip
                active={filter === "starred"}
                onClick={() => setFilter("starred")}
                icon={Star}
                color={THEME.yellow}
              >
                Favoris <Badge>{liveStats.starred}</Badge>
              </FilterChip>
            </div>

            {/* Phases */}
            {phases.map((phase) => {
              const meta = PHASE_META[phase.id] || {
                icon: ListChecks,
                color: "#64748b",
                title: phase.name,
                subtitle: phase.dateRange,
              };
              const isCollapsed = collapsedPhases.has(phase.id);
              const phaseTasks = tasksWithDate
                .filter((t) => t.phaseId === phase.id)
                .filter(filterPredicate);
              const doneCount = phaseTasks.filter((t) => t.status === "done").length;
              const todoCount = phaseTasks.length - doneCount;

              if (filter !== "all" && phaseTasks.length === 0) return null;

              return (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  meta={meta}
                  tasks={phaseTasks}
                  isCollapsed={isCollapsed}
                  doneCount={doneCount}
                  todoCount={todoCount}
                  onToggleCollapse={() => toggleCollapse(phase.id)}
                  onToggleTask={toggleTask}
                  onStarTask={toggleStar}
                  onDeleteTask={deleteTask}
                  onEditTask={(t) => setEditingTask(t)}
                  quickAddOpen={quickAddPhaseId === phase.id}
                  onQuickAddOpen={() => setQuickAddPhaseId(phase.id)}
                  onQuickAddClose={() => setQuickAddPhaseId(null)}
                  onQuickAddSubmit={(title) => {
                    addTask(phase.id, { title, priority: "medium" });
                    setQuickAddPhaseId(null);
                  }}
                />
              );
            })}
          </div>

          {/* --- SIDEBAR --- */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">
            {/* Next up */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-bold text-white">Prochaines priorités</div>
                  <div className="text-[11px] text-zinc-500">Ce qui vous attend</div>
                </div>
                <Target size={14} className="text-zinc-600" />
              </div>
              <div className="space-y-2">
                {upcomingTasks.length === 0 && (
                  <div className="py-6 text-center">
                    <Sparkles size={20} className="text-emerald-500 mx-auto mb-2" />
                    <div className="text-xs text-zinc-400">Tout est fait !</div>
                  </div>
                )}
                {upcomingTasks.map((t) => {
                  const phaseMeta = PHASE_META[t.phaseId];
                  const Icon = phaseMeta?.icon || ListChecks;
                  const overdue = t.daysLeft < 0;
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="w-full group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${phaseMeta?.color || "#64748b"}20` }}
                      >
                        <Icon size={14} className="text-white" style={{ color: phaseMeta?.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-semibold truncate">{t.title}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2">
                          <span
                            className={cn(
                              "font-bold",
                              overdue ? "text-red-400" : "text-zinc-400"
                            )}
                          >
                            {overdue
                              ? `En retard de ${Math.abs(t.daysLeft)}j`
                              : t.daysLeft === 0
                              ? "Aujourd'hui"
                              : `Dans ${t.daysLeft}j`}
                          </span>
                          <span>·</span>
                          <span>{formatDateShort(t.realDate)}</span>
                        </div>
                      </div>
                      {t.priority === "critical" && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conseils */}
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#111] to-[#0a0a0a] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#f21e2c]" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Conseils Sherpa
                </span>
              </div>
              <div className="space-y-3">
                <TipRow
                  icon={FileText}
                  color={THEME.violet}
                  title="Papiers d'identité"
                  desc="Vérifiez la date de validité de votre passeport au moins 2 mois avant le départ."
                />
                <TipRow
                  icon={Plane}
                  color={THEME.cyan}
                  title="Vols & trains"
                  desc="Les billets transport sont généralement moins chers 6-8 semaines à l'avance."
                />
                <TipRow
                  icon={Home}
                  color={THEME.emerald}
                  title="Gîtes & refuges"
                  desc="En haute saison, réservez vos refuges dès que possible (parfois 3 mois avant)."
                />
              </div>
            </div>
          </aside>
        </div>

        {/* ============================ BOUTON AJOUT RAPIDE BAS ============================ */}
        <div className="mt-10 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Besoin d'un coup de pouce ?{" "}
            <button
              onClick={() => loadFromTemplate("GR20")}
              className="text-white font-semibold hover:text-[#f21e2c] transition-colors underline underline-offset-2"
            >
              Recharger le template GR20
            </button>
          </div>
        </div>
      </div>

      {/* ============================ MODALS ============================ */}
      <AnimatePresence>
        {editingDeparture && (
          <DepartureModal
            current={departure}
            onSave={(d) => {
              setDeparture(d);
              setEditingDeparture(false);
            }}
            onClose={() => setEditingDeparture(false)}
          />
        )}
        {editingTask && (
          <TaskEditModal
            task={editingTask}
            onSave={(updates) => {
              updateTask(editingTask.id, updates);
              setEditingTask(null);
            }}
            onClose={() => setEditingTask(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

const CountdownBlock = ({
  departure,
  dDay,
  onEditClick,
}: {
  departure: Date;
  dDay: number;
  onEditClick: () => void;
}) => (
  <button
    onClick={onEditClick}
    className="group rounded-2xl border border-white/[0.08] bg-[#111] hover:bg-[#161616] transition-colors p-5 min-w-[280px] text-left"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        Départ prévu
      </span>
      <Edit3 size={12} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="flex items-baseline gap-2">
      <span
        className="text-6xl font-black tracking-tighter"
        style={{ color: dDay < 0 ? "#64748b" : dDay <= 7 ? THEME.red : "#ffffff" }}
      >
        J{dDay >= 0 ? "−" : "+"}
        {Math.abs(dDay)}
      </span>
    </div>
    <div className="text-xs font-semibold text-zinc-400 mt-1 capitalize">
      {formatDateFR(departure)}
    </div>
    {dDay >= 0 && dDay <= 7 && (
      <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#f21e2c]">
        ⚡ Dernière ligne droite
      </div>
    )}
  </button>
);

const StatCard = ({
  label,
  value,
  hint,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  color: string;
  icon: IconType;
}) => (
  <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5 flex flex-col justify-between min-h-[120px]">

    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <Icon size={16} className="text-zinc-600" />
    </div>
    <div>
      <div className="text-4xl font-black tracking-tight" style={{ color }}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-zinc-500 mt-1">{hint}</div>}
    </div>
  </div>
);

const FilterChip = ({
  active,
  onClick,
  icon: Icon,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: IconType;
  color?: string;
  children: React.ReactNode;
}) => (

  <button
    onClick={onClick}
    className={cn(
      "h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border",
      active
        ? "bg-white text-black border-white"
        : "bg-[#111] text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
    )}
  >
    <Icon size={13} className={active ? "" : undefined} style={active ? undefined : { color }} />
    {children}
  </button>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/10 text-current">
    {children}
  </span>
);

const TipRow = ({
  icon: Icon,
  color,
  title,
  desc,
}: {
  icon: IconType;
  color: string;
  title: string;
  desc: string;
}) => (

  <div className="flex items-start gap-3">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon size={14} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-bold text-white">{title}</div>
      <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{desc}</div>
    </div>
  </div>
);

// ============================================================================
// PHASE CARD
// ============================================================================
const PhaseCard = ({
  phase,
  meta,
  tasks,
  isCollapsed,
  doneCount,
  todoCount,
  onToggleCollapse,
  onToggleTask,
  onStarTask,
  onDeleteTask,
  onEditTask,
  quickAddOpen,
  onQuickAddOpen,
  onQuickAddClose,
  onQuickAddSubmit,
}: {
  phase: { id: string; name: string; dateRange: string };
  meta: { icon: any; color: string; title: string; subtitle: string };
  tasks: (Task & { realDate: Date; daysLeft: number })[];
  isCollapsed: boolean;
  doneCount: number;
  todoCount: number;
  onToggleCollapse: () => void;
  onToggleTask: (id: string) => void;
  onStarTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (t: Task) => void;
  quickAddOpen: boolean;
  onQuickAddOpen: () => void;
  onQuickAddClose: () => void;
  onQuickAddSubmit: (title: string) => void;
}) => {
  const Icon = meta.icon;
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}20` }}
          >
            <Icon size={18} style={{ color: meta.color }} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{meta.title}</span>
              <span className="text-[10px] font-semibold text-zinc-600">{phase.dateRange}</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{meta.subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {todoCount > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
            >
              {todoCount} à faire
            </span>
          )}
          <span className="text-xs text-zinc-500 tabular-nums">
            {doneCount}/{tasks.length}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-zinc-900 overflow-hidden hidden md:block">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: meta.color }}
            />
          </div>
          {isCollapsed ? (
            <ChevronRight size={16} className="text-zinc-500" />
          ) : (
            <ChevronDown size={16} className="text-zinc-500" />
          )}
        </div>
      </button>

      {/* Tasks */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05]">
              {tasks.length === 0 && (
                <div className="py-6 text-center text-zinc-500 text-sm">
                  Aucune tâche dans cette phase
                </div>
              )}
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  color={meta.color}
                  onToggle={() => onToggleTask(task.id)}
                  onStar={() => onStarTask(task.id)}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
              {/* Quick add */}
              {quickAddOpen ? (
                <QuickAdd onSubmit={onQuickAddSubmit} onCancel={onQuickAddClose} />
              ) : (
                <button
                  onClick={onQuickAddOpen}
                  className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 transition-colors border-t border-white/[0.04]"
                >
                  <Plus size={14} />
                  <span className="text-xs font-semibold">Ajouter une tâche</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// TASK ROW
// ============================================================================
const TaskRow = ({
  task,
  color,
  onToggle,
  onStar,
  onEdit,
  onDelete,
}: {
  task: Task & { realDate: Date; daysLeft: number };
  color: string;
  onToggle: () => void;
  onStar: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isDone = task.status === "done";
  const overdue = task.daysLeft < 0 && !isDone;
  const dateLabel = overdue
    ? `En retard de ${Math.abs(task.daysLeft)}j`
    : task.daysLeft === 0
    ? "Aujourd'hui"
    : task.daysLeft > 0
    ? `J-${task.daysLeft}`
    : `J+${Math.abs(task.daysLeft)}`;

  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors",
        isDone && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
          isDone ? "border-transparent" : "border-zinc-600 hover:border-white"
        )}
        style={{ backgroundColor: isDone ? color : "transparent" }}
      >
        {isDone && <Check size={12} className="text-black" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-sm font-semibold text-white",
              isDone && "line-through text-zinc-500"
            )}
          >
            {task.title}
          </span>
          {task.priority === "critical" && !isDone && (
            <span
              className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
              style={{ backgroundColor: priorityCfg.bg, color: priorityCfg.color }}
            >
              Critique
            </span>
          )}
        </div>
        {task.description && (
          <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
            {task.description}
          </div>
        )}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span
            className={cn(
              "text-[10px] font-bold flex items-center gap-1",
              overdue
                ? "text-red-400"
                : task.daysLeft <= 7 && !isDone
                ? "text-orange-400"
                : "text-zinc-500"
            )}
          >
            <Calendar size={10} />
            {dateLabel}
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600 font-medium">{formatDateShort(task.realDate)}</span>
          </span>
          {task.subtasks.length > 0 && (
            <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1">
              <ListChecks size={10} />
              {completedSubtasks}/{task.subtasks.length}
            </span>
          )}
          {task.tags.length > 0 &&
            task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-zinc-400"
              >
                #{tag}
              </span>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onStar}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
            task.starred ? "text-[#FEC631]" : "text-zinc-600 hover:text-white hover:bg-white/5"
          )}
        >
          <Star size={13} fill={task.starred ? "#FEC631" : "none"} />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-7 h-7 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <MoreVertical size={13} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-50 w-40 rounded-lg border border-white/10 bg-[#1a1a1a] shadow-2xl overflow-hidden">
                <button
                  onClick={() => {
                    onEdit();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/5 transition-colors"
                >
                  <Edit3 size={12} /> Modifier
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={12} /> Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// QUICK ADD
// ============================================================================
const QuickAdd = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) onSubmit(title.trim());
    else onCancel();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.04] bg-white/[0.02]">
      <Circle size={16} className="text-zinc-600 shrink-0" />
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={handleSubmit}
        placeholder="Titre de la tâche, puis Entrée…"
        className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
      />
      <button
        onClick={onCancel}
        className="text-[10px] font-semibold text-zinc-500 hover:text-white"
      >
        Esc
      </button>
    </div>
  );
};

// ============================================================================
// DEPARTURE MODAL
// ============================================================================
const DepartureModal = ({
  current,
  onSave,
  onClose,
}: {
  current: Date;
  onSave: (d: Date) => void;
  onClose: () => void;
}) => {
  const [value, setValue] = useState(
    current.toISOString().split("T")[0] // YYYY-MM-DD
  );

  const newDate = new Date(value + "T07:00:00");
  const days = daysUntil(newDate);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d0d] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white">Date de départ</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Tous les J-X seront recalculés à partir de cette date
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
              Date du départ
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-red-600/50 text-base"
            />
          </div>

          <div className="rounded-xl bg-[#111] p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Dans
                </div>
                <div className="text-3xl font-black tracking-tight text-white">
                  J{days >= 0 ? "−" : "+"}
                  {Math.abs(days)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Le
                </div>
                <div className="text-sm font-semibold text-white capitalize">
                  {formatDateFR(newDate)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(newDate)}
            className="h-10 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// TASK EDIT MODAL
// ============================================================================
const TaskEditModal = ({
  task,
  onSave,
  onClose,
}: {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);

  const priorities: Priority[] = ["critical", "high", "medium", "low"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d0d] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-xl font-black text-white">Modifier la tâche</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
              Titre
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-red-600/50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-red-600/50 text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
              Priorité
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 h-10 rounded-lg text-xs font-bold border transition-colors",
                      priority === p
                        ? "border-transparent"
                        : "border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                    )}
                    style={
                      priority === p
                        ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color }
                        : undefined
                    }
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
              Échéance (J-X)
            </label>
            <input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Ex: J-30"
              className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-red-600/50 text-sm font-mono"
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave({ title, description, priority, dueDate })}
            className="h-10 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
