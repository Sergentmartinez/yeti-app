"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Archive,
  Backpack,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Gauge,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Weight,
  Wind,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// DESIGN TOKENS (aligned with Dashboard)
// ============================================================================
const THEME = {
  bg: "bg-[#050505]",
  card: "bg-[#111111]",
  cardHover: "hover:bg-[#161616]",
  border: "border-white/[0.08]",
  redDeep: "#B21D3B",
  redVivid: "#f21e2c",
  orange: "#F9591F",
  orangeLight: "#FF8C42",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
  textMuted: "text-zinc-500",
};

// ============================================================================
// DATA
// ============================================================================
const OVERVIEW_STATS = [
  { label: "Projets Actifs", value: "2", accent: THEME.orange, icon: Target },
  { label: "Pack Actuel", value: "18.4", unit: "KG", accent: THEME.redVivid, icon: Weight },
  { label: "Départ Prévu", value: "J-22", accent: THEME.orange, icon: Calendar },
  { label: "Score Sherpa", value: "87", unit: "/100", accent: THEME.emerald, icon: Zap },
];

const IMMEDIATE_ACTIONS = [
  {
    id: 1,
    title: "Réserver refuges J5-J8",
    subtitle: "Logistique Critique",
    priority: "critical" as const,
    tag: "GR20",
  },
  {
    id: 2,
    title: "Commander cartouches gaz",
    subtitle: "Consommables",
    priority: "normal" as const,
    tag: null,
  },
  {
    id: 3,
    title: "Tester matériel neuf",
    subtitle: "Check-list Matériel",
    priority: "validated" as const,
    tag: "Validé",
  },
  {
    id: 4,
    title: "Finaliser itinéraire J12",
    subtitle: "Navigation",
    priority: "high" as const,
    tag: "TMB",
  },
];

const PROJECTS = [
  {
    id: "gr20",
    name: "GR20 Nord — Sud",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80",
    progress: 14,
    stages: "3 / 22",
    weight: "9.4",
    days: 22,
    accent: THEME.redVivid,
    status: "active",
    difficulty: 5,
    distance: "180",
    elevation: "11",
  },
  {
    id: "tmb",
    name: "Tour du Mont-Blanc",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80",
    progress: 42,
    stages: "5 / 11",
    weight: "3.8",
    days: 58,
    accent: THEME.orange,
    status: "active",
    difficulty: 4,
    distance: "170",
    elevation: "10",
  },
  {
    id: "whw",
    name: "West Highland Way",
    image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80",
    progress: 100,
    stages: "Complet",
    weight: "28.5",
    days: null,
    accent: THEME.emerald,
    status: "completed",
    difficulty: 3,
    distance: "154",
    elevation: "5",
  },
];

const EQUIPMENT_CATEGORIES = [
  { label: "Shelter", weight: "3.2", target: "3.0", color: THEME.redDeep, status: "over" },
  { label: "Sleep", weight: "2.1", target: "2.5", color: THEME.orange, status: "ok" },
  { label: "Cooking", weight: "1.4", target: "1.2", color: THEME.orangeLight, status: "over" },
  { label: "Divers", weight: "6.3", target: "7.0", color: THEME.yellow, status: "ok" },
];

const SHERPA_INSIGHTS = [
  {
    type: "conflict" as const,
    icon: AlertTriangle,
    title: "Tente MSR Hubba Hubba",
    subtitle: "Utilisée sur 2 projets actifs (GR20 vs TMB)",
    color: THEME.redVivid,
    bg: "#220a0a",
    border: "red-500",
  },
  {
    type: "optimization" as const,
    icon: Sparkles,
    title: "TOAKS 650ml disponible",
    subtitle: "Optimisation possible: -280g sur le pack GR20",
    color: THEME.emerald,
    bg: "#0a1a10",
    border: "emerald-500",
  },
  {
    type: "weather" as const,
    icon: Wind,
    title: "Température optimale",
    subtitle: "21°C prévus - Duvet confort 5°C parfaitement calibré",
    color: "#06b6d4",
    bg: "#0a1022",
    border: "cyan-500",
  },
];

// ============================================================================
// UI HELPERS
// ============================================================================
const SectionLabel = ({ icon: Icon, label, accent }: any) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={12} style={{ color: accent || THEME.orange }} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
      {label}
    </span>
  </div>
);

const Card = ({ children, className, onClick, noPadding }: any) => (
  <motion.div
    whileHover={onClick ? { scale: 1.003 } : undefined}
    onClick={onClick}
    className={cn(
      "relative rounded-[24px] border overflow-hidden flex flex-col transition-colors",
      THEME.card,
      THEME.border,
      onClick && "cursor-pointer hover:bg-[#161616]",
      !noPadding && "p-5",
      className
    )}
  >
    {children}
  </motion.div>
);

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function MissionControlPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-orange-500/30">
      <div className="px-6 md:px-8 py-6 max-w-[1800px] mx-auto w-full">

        {/* === HEADER === */}
        <header className="flex items-center justify-between mb-6 h-16">
          <div className="flex items-center gap-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: THEME.emerald }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: THEME.emerald }}
                >
                  Live Sync · Il y a 5 min
                </span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">
                Mission Control
              </h1>
            </div>
            <div className="h-10 w-px bg-white/10 mx-4 hidden md:block" />
            <div className="items-center gap-6 text-zinc-500 font-medium text-xs hidden md:flex">
              <span className="text-zinc-400 font-bold uppercase tracking-wider">Overview</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span style={{ color: THEME.orange }}>2</span> EN COURS
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-white">4</span> TERMINÉS
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/basecamp/dashboard")}
            className="group h-10 px-6 bg-[#B21D3B] hover:bg-[#F9591F] text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#B21D3B]/20"
          >
            <Plus size={14} strokeWidth={3} />
            Nouvelle Mission
          </button>
        </header>

        {/* === TOP: EXPEDITION OVERVIEW (Hero Card) === */}
        <Card className="mb-6 relative overflow-hidden" noPadding>
          {/* Background image */}
          <div className="absolute right-0 top-0 w-[380px] h-full hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80"
              alt="Mountains"
              fill
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent" />
          </div>

          <div className="relative z-10 p-8">
            <SectionLabel icon={TrendingUp} label="Expedition Overview" accent={THEME.orange} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              {OVERVIEW_STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className={cn(
                      "pr-8",
                      i < OVERVIEW_STATS.length - 1 && "border-r border-white/[0.05]"
                    )}
                  >
                    <Icon size={14} className="text-zinc-700 mb-3" />
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="text-5xl font-black tracking-tighter leading-none"
                        style={{ color: stat.accent }}
                      >
                        {stat.value}
                      </span>
                      {stat.unit && (
                        <span className="text-sm font-black text-zinc-600">{stat.unit}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-2">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* === GRID === */}
        <div className="grid grid-cols-12 gap-4 mb-6">

          {/* --- ACTIONS IMMÉDIATES --- */}
          <Card className="col-span-12 lg:col-span-4 h-[460px]">
            <SectionLabel icon={AlertTriangle} label="Actions Immédiates" accent={THEME.orange} />
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {IMMEDIATE_ACTIONS.map((action) => {
                const isValidated = action.priority === "validated";
                const isCritical = action.priority === "critical";
                const isHigh = action.priority === "high";
                
                const dotColor = isValidated
                  ? THEME.emerald
                  : isCritical
                  ? THEME.redVivid
                  : isHigh
                  ? THEME.orange
                  : "#52525b";

                return (
                  <div
                    key={action.id}
                    className={cn(
                      "group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                      isValidated
                        ? "border-emerald-500/10 bg-emerald-500/[0.03] hover:border-emerald-500/20"
                        : isCritical
                        ? "border-red-500/10 bg-red-500/[0.03] hover:border-red-500/20"
                        : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="pt-1.5 shrink-0">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: dotColor,
                          boxShadow: isCritical || isValidated ? `0 0 8px ${dotColor}80` : "none",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {action.title}
                        </span>
                        {action.tag && (
                          <span
                            className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                            style={{
                              color: isValidated ? THEME.emerald : THEME.orange,
                              backgroundColor: isValidated
                                ? "rgba(16,185,129,0.1)"
                                : "rgba(249,89,31,0.1)",
                              border: `1px solid ${isValidated ? "rgba(16,185,129,0.2)" : "rgba(249,89,31,0.2)"}`,
                            }}
                          >
                            {action.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium mt-0.5 block uppercase tracking-wider">
                        {action.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="mt-3 w-full group flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-[#F9591F]/5 border border-white/[0.04] hover:border-[#F9591F]/20 transition-all">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-white">
                Voir toutes les actions
              </span>
              <ChevronRight size={14} className="text-zinc-600 group-hover:text-[#F9591F]" />
            </button>
          </Card>

          {/* --- PROJECTS GRID --- */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECTS.slice(0, 2).map((project) => (
              <Card
                key={project.id}
                onClick={() => router.push("/basecamp/dashboard")}
                className="h-[220px] group relative overflow-hidden"
                noPadding
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at 50% 100%, ${project.accent}30 0%, transparent 60%)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  {/* Top: status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: project.accent }}
                      />
                      <span
                        className="text-[9px] font-black uppercase tracking-[0.2em]"
                        style={{ color: project.accent }}
                      >
                        {project.status === "completed" ? "Terminé" : "En préparation"}
                      </span>
                    </div>
                    {project.days !== null ? (
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                        style={{
                          color: project.accent,
                          backgroundColor: `${project.accent}15`,
                          border: `1px solid ${project.accent}30`,
                        }}
                      >
                        J-{project.days}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Bottom: info */}
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter mb-3 drop-shadow-lg">
                      {project.name}
                    </h3>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                          Progression
                        </span>
                        <span className="text-[10px] font-black text-white">
                          {project.stages}
                        </span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${project.progress}%`,
                            background: `linear-gradient(90deg, ${project.accent}, ${project.accent}aa)`,
                            boxShadow: `0 0 8px ${project.accent}80`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Weight size={10} />
                        <span className="text-white">{project.weight}kg</span>
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Compass size={10} />
                        <span className="text-white">{project.distance}km</span>
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <TrendingUp size={10} />
                        <span className="text-white">{project.elevation}km+</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

        </div>

        {/* === BOTTOM ROW: EQUIPMENT + SHERPA INSIGHTS === */}
        <div className="grid grid-cols-12 gap-4">

          {/* --- EQUIPMENT ANALYTICS --- */}
          <Card className="col-span-12 lg:col-span-5">
            <SectionLabel icon={Archive} label="Analytique Équipement" accent={THEME.redVivid} />

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { val: "62", lab: "Items", color: THEME.redVivid },
                { val: "18.4", lab: "Total kg", color: THEME.orange },
                { val: "8", lab: "À trier", color: THEME.yellow },
                { val: "12.2", lab: "Base kg", color: THEME.emerald },
              ].map((s, i) => (
                <div
                  key={i}
                  className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                >
                  <div
                    className="text-xl font-black tracking-tighter"
                    style={{ color: s.color }}
                  >
                    {s.val}
                  </div>
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-wider mt-1">
                    {s.lab}
                  </div>
                </div>
              ))}
            </div>

            {/* Categories breakdown */}
            <div className="space-y-3">
              {EQUIPMENT_CATEGORIES.map((cat, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                        {cat.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black">
                      <span
                        style={{
                          color: cat.status === "over" ? THEME.orange : THEME.emerald,
                        }}
                      >
                        {cat.weight} kg
                      </span>
                      <span className="text-zinc-700">/</span>
                      <span className="text-zinc-600">{cat.target} kg</span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(parseFloat(cat.weight) / parseFloat(cat.target)) * 100}%`,
                        background: cat.color,
                        maxWidth: "100%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <button
              onClick={() => router.push("/basecamp/garage")}
              className="mt-5 w-full group flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-[#F9591F]/5 border border-white/[0.04] hover:border-[#F9591F]/20 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-white flex items-center gap-2">
                <Archive size={12} />
                Ouvrir le Garage
              </span>
              <ChevronRight size={14} className="text-zinc-600 group-hover:text-[#F9591F]" />
            </button>
          </Card>

          {/* --- SHERPA AI INSIGHTS --- */}
          <Card className="col-span-12 lg:col-span-7 relative overflow-hidden">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 20px)",
              }}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} style={{ color: THEME.orange }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Sherpa AI Insights
                  </span>
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      color: THEME.orange,
                      backgroundColor: `${THEME.orange}15`,
                    }}
                  >
                    3 alertes
                  </span>
                </div>
                <button
                  onClick={() => router.push("/basecamp/sherpa")}
                  className="text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-[#F9591F] transition-colors flex items-center gap-1"
                >
                  Tout voir
                  <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="space-y-2.5">
                {SHERPA_INSIGHTS.map((insight, i) => {
                  const Icon = insight.icon;
                  return (
                    <div
                      key={i}
                      className="group flex items-start gap-4 p-4 rounded-xl border-l-2 hover:bg-white/[0.02] transition-all cursor-pointer"
                      style={{
                        backgroundColor: insight.bg,
                        borderLeftColor: insight.color,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${insight.color}15`,
                          borderColor: `${insight.color}30`,
                        }}
                      >
                        <Icon size={14} style={{ color: insight.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-[9px] font-black uppercase tracking-[0.2em]"
                            style={{ color: insight.color }}
                          >
                            {insight.type === "conflict"
                              ? "Conflit"
                              : insight.type === "optimization"
                              ? "Optimisation"
                              : "Météo"}
                          </span>
                        </div>
                        <div className="text-sm font-black text-white leading-tight mb-1">
                          {insight.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-medium leading-tight">
                          {insight.subtitle}
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-zinc-600 group-hover:text-white transition-colors shrink-0 mt-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
