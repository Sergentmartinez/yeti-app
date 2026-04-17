// app/basecamp/projects/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useYetiStore, TREK_DATABASE, type TrekProject } from "@/lib/store/useYetiStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, FolderOpen, CheckCircle2, Clock, Archive, Trash2,
  Mountain, Calendar, Target, TrendingUp, Search, Filter,
  ChevronRight, MapPin, Backpack, Compass, Flag, MoreVertical,
  Copy, Play, Pause,
} from "lucide-react";

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const THEME = {
  red: "#f21e2c",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  blue: "#3b82f6",
};

type FilterTab = "all" | "active" | "draft" | "completed";

// ============================================================================
// HELPERS
// ============================================================================
const formatDate = (date: Date | null) => {
  if (!date) return "Non définie";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const daysUntil = (date: Date | null): number | null => {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const statusConfig = {
  active: { label: "En cours", color: THEME.emerald, icon: Play },
  draft: { label: "Brouillon", color: THEME.yellow, icon: Pause },
  completed: { label: "Terminé", color: THEME.cyan, icon: CheckCircle2 },
};

// ============================================================================
// PAGE
// ============================================================================
export default function ProjectsPage() {
  const {
    projects,
    currentProjectId,
    setCurrentProject,
    createProject,
  } = useYetiStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let result = projects;
    if (filter !== "all") result = result.filter((p) => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.trekName.toLowerCase().includes(q) ||
          p.trekSlug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, filter, search]);

  // Stats globales
  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === "active").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const draft = projects.filter((p) => p.status === "draft").length;
    const avgScore =
      projects.length > 0
        ? Math.round(projects.reduce((a, p) => a + p.score, 0) / projects.length)
        : 0;
    return { active, completed, draft, avgScore, total: projects.length };
  }, [projects]);

  const counts = {
    all: projects.length,
    active: stats.active,
    draft: stats.draft,
    completed: stats.completed,
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-16 selection:bg-red-600/30">
      <div className="max-w-[1500px] mx-auto px-6 md:px-8 py-6">

        {/* ============ HEADER ============ */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
              Centre de contrôle — Expéditions
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                <FolderOpen className="text-[#f21e2c]" size={42} strokeWidth={1.5} />
                Mes projets
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                Gérez tous vos treks en parallèle. Chaque projet garde sa propre timeline,
                son budget, son sac à dos et ses étapes GPX.
              </p>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="h-11 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#f21e2c]/20"
            >
              <Plus size={16} /> Nouveau projet
            </button>
          </div>
        </header>

        {/* ============ STATS ============ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total projets"
            value={stats.total}
            hint={`${stats.active} en cours`}
            color={THEME.red}
            icon={FolderOpen}
          />
          <StatCard
            label="En cours"
            value={stats.active}
            hint="Expéditions actives"
            color={THEME.emerald}
            icon={Play}
          />
          <StatCard
            label="Brouillons"
            value={stats.draft}
            hint="En planification"
            color={THEME.yellow}
            icon={Pause}
          />
          <StatCard
            label="Score moyen"
            value={`${stats.avgScore}%`}
            hint="Préparation globale"
            color={THEME.violet}
            icon={TrendingUp}
          />
        </div>

        {/* ============ TOOLBAR ============ */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-3 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher un trek, un GR, une destination…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm focus:outline-none focus:border-[#f21e2c]/50 placeholder:text-zinc-500"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1a1a1a] border border-white/5">
            {(["all", "active", "draft", "completed"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-3 h-8 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5",
                  filter === tab
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {tab === "all" ? "Tous" : tab === "active" ? "En cours" : tab === "draft" ? "Brouillon" : "Terminés"}
                <span
                  className={cn(
                    "text-[9px] font-bold px-1.5 rounded-full tabular-nums",
                    filter === tab ? "bg-black/20" : "bg-white/10"
                  )}
                >
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ============ PROJECTS GRID ============ */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            onNew={() => setShowNewModal(true)}
            hasFilter={filter !== "all" || search.trim().length > 0}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isCurrent={project.id === currentProjectId}
                onActivate={() => setCurrentProject(project.id)}
                menuOpen={menuOpenId === project.id}
                onToggleMenu={() =>
                  setMenuOpenId(menuOpenId === project.id ? null : project.id)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ============ NEW PROJECT MODAL ============ */}
      <AnimatePresence>
        {showNewModal && (
          <NewProjectModal
            onClose={() => setShowNewModal(false)}
            onCreate={(trekSlug, date) => {
              createProject(trekSlug, date);
              setShowNewModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================
const StatCard = ({
  label,
  value,
  hint,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}) => (
  <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <Icon size={14} className="text-zinc-600" />
    </div>
    <div
      className="text-3xl font-black tracking-tight tabular-nums mb-1"
      style={{ color }}
    >
      {value}
    </div>
    {hint && <div className="text-[11px] text-zinc-500">{hint}</div>}
  </div>
);

// ============================================================================
// PROJECT CARD
// ============================================================================
const ProjectCard = ({
  project,
  isCurrent,
  onActivate,
  menuOpen,
  onToggleMenu,
}: {
  project: TrekProject;
  isCurrent: boolean;
  onActivate: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) => {
  const trekInfo = TREK_DATABASE[project.trekSlug];
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;
  const days = daysUntil(project.departureDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative rounded-2xl border bg-[#111] overflow-hidden group transition-all",
        isCurrent
          ? "border-[#f21e2c]/50 shadow-lg shadow-[#f21e2c]/10"
          : "border-white/[0.08] hover:border-white/20"
      )}
    >
      {/* Badge ACTIF */}
      {isCurrent && (
        <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-[#f21e2c] text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Projet actif
        </div>
      )}

      {/* Gradient hero */}
      <div
        className="h-28 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${status.color}15 0%, ${status.color}05 50%, #0a0a0a 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${status.color}40 0%, transparent 40%)`,
            }}
          />
        </div>

        {/* Status pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
          <StatusIcon size={10} style={{ color: status.color }} />
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: status.color }}>
            {status.label}
          </span>
        </div>

        {/* Mountain icon */}
        <div className="absolute bottom-3 left-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${status.color}20`, border: `1px solid ${status.color}30` }}
          >
            <Mountain size={20} style={{ color: status.color }} />
          </div>
        </div>

        {/* Menu button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu();
          }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <MoreVertical size={14} />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-12 right-3 w-44 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden z-20"
          >
            <MenuItem icon={Copy} label="Dupliquer" />
            <MenuItem icon={Archive} label="Archiver" />
            <div className="border-t border-white/5" />
            <MenuItem icon={Trash2} label="Supprimer" danger />
          </motion.div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-black text-white truncate mb-0.5">
            {project.trekName}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <MapPin size={10} />
            <span>{trekInfo?.name || project.trekSlug}</span>
          </div>
        </div>

        {/* Trek stats */}
        {trekInfo && (
          <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-white/[0.06]">
            <TrekStat value={trekInfo.distance} unit="km" />
            <TrekStat value={`${(trekInfo.elevation / 1000).toFixed(1)}k`} unit="D+" />
            <TrekStat value={trekInfo.days} unit="j" />
            <TrekStat value={"★".repeat(trekInfo.difficulty)} unit="diff" textSize="sm" />
          </div>
        )}

        {/* Departure & score */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
            <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Départ
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <Calendar size={10} className="text-zinc-500" />
              {formatDate(project.departureDate)}
            </div>
            {days !== null && days > 0 && (
              <div className="text-[10px] text-[#f21e2c] font-black tabular-nums mt-0.5">
                J-{days}
              </div>
            )}
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
            <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Budget
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <Target size={10} className="text-zinc-500" />
              {project.budgetLimit}€
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Préparation
            </span>
            <span
              className="text-xs font-black tabular-nums"
              style={{
                color: project.score > 70 ? THEME.emerald : project.score > 40 ? THEME.yellow : THEME.red,
              }}
            >
              {project.score}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  project.score > 70
                    ? `linear-gradient(90deg, ${THEME.emerald}, ${THEME.cyan})`
                    : project.score > 40
                    ? `linear-gradient(90deg, ${THEME.yellow}, ${THEME.orange})`
                    : `linear-gradient(90deg, ${THEME.red}, ${THEME.orange})`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isCurrent ? (
            <Link
              href="/basecamp/dashboard"
              className="flex-1 h-10 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Ouvrir le dashboard <ChevronRight size={12} />
            </Link>
          ) : (
            <button
              onClick={onActivate}
              className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Activer ce projet <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TrekStat = ({
  value,
  unit,
  textSize = "base",
}: {
  value: string | number;
  unit: string;
  textSize?: "sm" | "base";
}) => (
  <div className="text-center">
    <div
      className={cn(
        "font-black text-white tabular-nums leading-none",
        textSize === "sm" ? "text-xs" : "text-base"
      )}
    >
      {value}
    </div>
    <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">
      {unit}
    </div>
  </div>
);

const MenuItem = ({
  icon: Icon,
  label,
  danger = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  danger?: boolean;
}) => (
  <button
    className={cn(
      "w-full px-3 h-9 flex items-center gap-2.5 text-[11px] font-semibold transition-colors",
      danger
        ? "text-red-400 hover:bg-red-500/10"
        : "text-zinc-300 hover:bg-white/5"
    )}
  >
    <Icon size={12} />
    {label}
  </button>
);

// ============================================================================
// EMPTY STATE
// ============================================================================
const EmptyState = ({
  onNew,
  hasFilter,
}: {
  onNew: () => void;
  hasFilter: boolean;
}) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a0a0a]/50 p-12 text-center">
    <div className="w-14 h-14 rounded-2xl bg-[#f21e2c]/10 border border-[#f21e2c]/20 flex items-center justify-center mx-auto mb-4">
      <Compass size={24} className="text-[#f21e2c]" />
    </div>
    <h3 className="text-lg font-black text-white mb-1">
      {hasFilter ? "Aucun projet trouvé" : "Aucun projet pour le moment"}
    </h3>
    <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
      {hasFilter
        ? "Essayez de modifier votre recherche ou vos filtres pour voir plus de projets."
        : "Créez votre premier projet pour commencer à planifier votre prochain trek."}
    </p>
    {!hasFilter && (
      <button
        onClick={onNew}
        className="h-10 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
      >
        <Plus size={14} /> Créer un projet
      </button>
    )}
  </div>
);

// ============================================================================
// NEW PROJECT MODAL
// ============================================================================
const NewProjectModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (trekSlug: string, date?: Date) => void;
}) => {
  const [selectedTrek, setSelectedTrek] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<string>("");

  const treks = Object.entries(TREK_DATABASE).map(([slug, info]) => ({ slug, ...info }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d0d0d] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Plus size={20} className="text-[#f21e2c]" />
              Nouveau projet
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Choisissez un trek et définissez votre date de départ
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 block">
            1. Choisissez votre trek
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {treks.map((trek) => (
              <button
                key={trek.slug}
                onClick={() => setSelectedTrek(trek.slug)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  selectedTrek === trek.slug
                    ? "bg-[#f21e2c]/10 border-[#f21e2c]/50"
                    : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Mountain
                    size={16}
                    className={selectedTrek === trek.slug ? "text-[#f21e2c]" : "text-zinc-500"}
                  />
                  {selectedTrek === trek.slug && (
                    <CheckCircle2 size={14} className="text-[#f21e2c]" />
                  )}
                </div>
                <div className="text-sm font-black text-white mb-1">{trek.name}</div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                  {"★".repeat(trek.difficulty)}
                  {"☆".repeat(5 - trek.difficulty)}
                </div>
                <div className="flex gap-2 text-[10px] text-zinc-400">
                  <span>{trek.distance}km</span>
                  <span>•</span>
                  <span>{trek.days}j</span>
                  <span>•</span>
                  <span>{(trek.elevation / 1000).toFixed(1)}k D+</span>
                </div>
              </button>
            ))}
          </div>

          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 block">
            2. Date de départ (optionnelle)
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#f21e2c]/50 text-sm"
          />
          <p className="text-[10px] text-zinc-500 mt-2">
            Vous pourrez modifier cette date plus tard depuis les paramètres du projet.
          </p>
        </div>

        <div className="p-4 border-t border-white/[0.06] flex items-center justify-end gap-2 bg-black/30">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (!selectedTrek) return;
              onCreate(selectedTrek, departureDate ? new Date(departureDate) : undefined);
            }}
            disabled={!selectedTrek}
            className="h-10 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Créer le projet <ChevronRight size={12} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
