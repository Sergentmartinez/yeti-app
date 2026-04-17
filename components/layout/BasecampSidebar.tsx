"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Check,
  Plus,
  Search,
  Pin,
  Clock,
  Archive,
  PanelLeftClose,
  PanelLeft,
  AlertTriangle,
  Timer,
  X,
  Calendar,
  Home,
  Folder,
  Gauge,
  Backpack,
  Activity,
  Wallet,
  Route,
  CloudSun,
  Zap,
  Settings,
  Mountain,
  Weight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// DESIGN TOKENS (aligned with Dashboard)
// ============================================================================
const THEME = {
  bg: "#050505",
  card: "#111111",
  cardHover: "#161616",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.12)",
  redDeep: "#B21D3B",
  redVivid: "#f21e2c",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  zinc: {
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
  },
};

// ============================================================================
// TYPES
// ============================================================================
interface Expedition {
  id: string;
  name: string;
  location: string;
  days: number;
  startDate: string;
  progress: number;
  weight: number | null;
  alerts: number;
  status: "preparation" | "active" | "completed";
  pinned: boolean;
}

const AVAILABLE_TERRAINS = [
  { id: "gr20", name: "GR20 Corse", location: "Corse, France", days: 16 },
  { id: "tmb", name: "Tour du Mont-Blanc", location: "Alpes", days: 11 },
  { id: "camino", name: "Camino Frances", location: "Espagne", days: 35 },
  { id: "gr10", name: "GR10 Pyrénées", location: "Pyrénées, France", days: 45 },
  { id: "custom", name: "Expédition personnalisée", location: "Personnalisé", days: 0 },
];

const INITIAL_EXPEDITIONS: Expedition[] = [
  { id: "gr20", name: "GR20 Nord → Sud", location: "Corse", days: 16, startDate: "2026-03-20", progress: 85, weight: 4.2, alerts: 3, status: "preparation", pinned: true },
  { id: "tmb", name: "Tour du Mont-Blanc", location: "Alpes", days: 11, startDate: "2026-05-15", progress: 42, weight: 3.8, alerts: 1, status: "preparation", pinned: true },
  { id: "camino", name: "Camino Frances", location: "Espagne", days: 35, startDate: "2026-09-01", progress: 15, weight: null, alerts: 0, status: "preparation", pinned: false },
  { id: "vercors", name: "Tour du Vercors", location: "France", days: 5, startDate: "2024-08-10", progress: 100, weight: 3.2, alerts: 0, status: "completed", pinned: false },
];

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================
const GLOBAL_NAV = [
  { id: "basecamp", href: "/basecamp", label: "Basecamp", icon: Home, exact: true },
  { id: "garage", href: "/basecamp/garage", label: "Garage", icon: Archive, badge: "62" },
  { id: "projects", href: "/basecamp/projects", label: "Projets", icon: Folder, badge: "4" },
];

const PROJECT_NAV = [
  { id: "dashboard", href: "/basecamp/dashboard", label: "Dashboard", icon: Gauge },
  { id: "pack", href: "/basecamp/packbuilder", label: "Pack Builder", icon: Backpack },
  { id: "timeline", href: "/basecamp/timeline", label: "Timeline", icon: Activity },
  { id: "budget", href: "/basecamp/budget", label: "Budget", icon: Wallet },
  { id: "routes", href: "/basecamp/routes", label: "Itinéraire", icon: Route },
  { id: "weather", href: "/basecamp/weather", label: "Météo", icon: CloudSun },
  { id: "sherpa", href: "/basecamp/sherpa", label: "Sherpa AI", icon: Zap },
];

// ============================================================================
// HELPERS
// ============================================================================
const getStatusColor = (progress: number): string => {
  if (progress >= 80) return THEME.emerald;
  if (progress >= 40) return THEME.orange;
  if (progress >= 20) return THEME.yellow;
  return THEME.redVivid;
};

const getDaysLeft = (startDate: string): number => {
  const today = new Date();
  const start = new Date(startDate);
  const diffTime = start.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function BasecampSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExpeditionPicker, setShowExpeditionPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpeditionId, setSelectedExpeditionId] = useState("gr20");
  const [expeditions, setExpeditions] = useState<Expedition[]>(INITIAL_EXPEDITIONS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExpedition, setNewExpedition] = useState({
    name: "",
    terrainId: "gr20",
    startDate: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentExp = expeditions.find((e) => e.id === selectedExpeditionId);
  const daysLeft = currentExp ? getDaysLeft(currentExp.startDate) : 0;
  const statusColor = currentExp ? getStatusColor(currentExp.progress) : THEME.redDeep;

  const filteredExpeditions = expeditions.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedExps = filteredExpeditions.filter((e) => e.pinned && e.status !== "completed");
  const recentExps = filteredExpeditions.filter((e) => !e.pinned && e.status !== "completed");
  const completedExps = filteredExpeditions.filter((e) => e.status === "completed");

  const handleSwitcherClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => setShowExpeditionPicker(true), 200);
    } else {
      setShowExpeditionPicker(!showExpeditionPicker);
    }
  };

  const handleSelectExpedition = (expId: string) => {
    setSelectedExpeditionId(expId);
    setShowExpeditionPicker(false);
    setSearchQuery("");
    router.push("/basecamp/dashboard");
  };

  const handleCreateExpedition = () => {
    setShowExpeditionPicker(false);
    setShowCreateModal(true);
    setNewExpedition({ name: "", terrainId: "gr20", startDate: "" });
  };

  const handleSubmitNewExpedition = () => {
    if (!newExpedition.name || !newExpedition.terrainId) return;
    const terrain = AVAILABLE_TERRAINS.find((t) => t.id === newExpedition.terrainId);
    const newId = `exp-${Date.now()}`;
    const newExp: Expedition = {
      id: newId,
      name: newExpedition.name,
      location: terrain?.location || "Personnalisé",
      days: terrain?.days || 0,
      startDate:
        newExpedition.startDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 0,
      weight: null,
      alerts: 0,
      status: "preparation",
      pinned: false,
    };
    setExpeditions((prev) => [newExp, ...prev]);
    setSelectedExpeditionId(newId);
    setShowCreateModal(false);
    setNewExpedition({ name: "", terrainId: "gr20", startDate: "" });
    setTimeout(() => router.push("/basecamp/dashboard"), 100);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewExpedition({ name: "", terrainId: "gr20", startDate: "" });
  };

  if (!mounted) return null;

  return (
    <>
      <aside
        className={cn(
          "flex h-screen flex-col fixed left-0 top-0 z-40 transition-all duration-300",
          "bg-[#050505] border-r border-white/[0.06]",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* === LOGO + COLLAPSE === */}
        <div
          className={cn(
            "flex h-16 items-center shrink-0 border-b border-white/[0.06]",
            isCollapsed ? "justify-center px-2" : "justify-between px-5"
          )}
        >
          {!isCollapsed ? (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#B21D3B] to-[#F9591F] flex items-center justify-center shadow-lg shadow-[#B21D3B]/20">
                <Mountain size={16} strokeWidth={2.5} className="text-white" />
              </div>
              <span className="font-black tracking-tighter text-xl text-white">YETI</span>
            </Link>
          ) : (
            <Link href="/">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B21D3B] to-[#F9591F] flex items-center justify-center shadow-lg shadow-[#B21D3B]/20">
                <Mountain size={16} strokeWidth={2.5} className="text-white" />
              </div>
            </Link>
          )}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-white/5 transition-colors"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* === EXPEDITION SWITCHER === */}
        <div className="p-3 relative shrink-0">
          <button
            onClick={handleSwitcherClick}
            className={cn(
              "w-full rounded-2xl border transition-all group relative overflow-hidden",
              "bg-[#111111] border-white/[0.08] hover:border-white/[0.15]",
              isCollapsed ? "p-3" : "p-4"
            )}
          >
            {/* Accent glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: `radial-gradient(circle at 0% 0%, ${statusColor}15 0%, transparent 60%)`,
              }}
            />

            {isCollapsed ? (
              <div className="flex justify-center">
                <Backpack className="w-5 h-5" style={{ color: statusColor }} />
              </div>
            ) : currentExp ? (
              <div className="relative">
                {/* Status label */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ color: statusColor }}
                  >
                    Projet Actif
                  </span>
                  <ChevronDown
                    size={12}
                    className={cn(
                      "ml-auto text-zinc-600 transition-transform flex-shrink-0",
                      showExpeditionPicker && "rotate-180"
                    )}
                  />
                </div>

                {/* Name */}
                <div className="font-black text-sm text-white tracking-tight truncate mb-3 text-left">
                  {currentExp.name}
                </div>

                {/* Progress bar */}
                <div className="h-0.5 rounded-full bg-white/5 mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${currentExp.progress}%`,
                      background: `linear-gradient(90deg, ${statusColor}, ${statusColor}aa)`,
                      boxShadow: `0 0 8px ${statusColor}60`,
                    }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Timer size={10} />
                    <span className="text-white">J-{daysLeft}</span>
                  </span>
                  {currentExp.weight && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Weight size={10} />
                        <span className="text-white">{currentExp.weight}kg</span>
                      </span>
                    </>
                  )}
                  {currentExp.alerts > 0 && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="flex items-center gap-1" style={{ color: THEME.orange }}>
                        <AlertTriangle size={10} />
                        <span>{currentExp.alerts}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-zinc-500 text-sm">Sélectionner un projet</span>
            )}
          </button>

          {/* === EXPEDITION DROPDOWN === */}
          {showExpeditionPicker && !isCollapsed && (
            <>
              <div
                className="fixed inset-0 z-[99]"
                onClick={() => setShowExpeditionPicker(false)}
              />
              <div className="absolute left-3 right-3 mt-2 rounded-2xl bg-[#111111] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden z-[100] max-h-[500px] overflow-y-auto">
                {/* Create New - TOP */}
                <button
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-black uppercase tracking-wider transition-colors border-b border-white/[0.06] group"
                  style={{
                    background: `linear-gradient(90deg, ${THEME.redDeep}20 0%, transparent 100%)`,
                  }}
                  onClick={handleCreateExpedition}
                >
                  <div
                    className="p-2 rounded-lg border group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: `${THEME.redDeep}20`,
                      borderColor: `${THEME.redDeep}40`,
                    }}
                  >
                    <Plus size={14} style={{ color: THEME.orange }} strokeWidth={3} />
                  </div>
                  <span style={{ color: THEME.orange }}>Nouvelle Mission</span>
                </button>

                {/* Search */}
                <div className="p-3 border-b border-white/[0.06] bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#050505] border border-white/[0.06]">
                    <Search size={14} className="text-zinc-600 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600 flex-1"
                    />
                  </div>
                </div>

                {pinnedExps.length > 0 && (
                  <ExpeditionSection
                    title="Épinglés"
                    icon={<Pin size={12} style={{ color: THEME.orange }} />}
                    expeditions={pinnedExps}
                    selectedId={selectedExpeditionId}
                    onSelect={handleSelectExpedition}
                  />
                )}
                {recentExps.length > 0 && (
                  <ExpeditionSection
                    title="En préparation"
                    icon={<Clock size={12} className="text-zinc-400" />}
                    expeditions={recentExps}
                    selectedId={selectedExpeditionId}
                    onSelect={handleSelectExpedition}
                    showBorder={pinnedExps.length > 0}
                  />
                )}
                {completedExps.length > 0 && (
                  <ExpeditionSection
                    title="Terminés"
                    icon={<Archive size={12} style={{ color: THEME.emerald }} />}
                    expeditions={completedExps}
                    selectedId={selectedExpeditionId}
                    onSelect={handleSelectExpedition}
                    showBorder
                    muted
                  />
                )}
                {filteredExpeditions.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-zinc-500">Aucune expédition trouvée</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* === NAVIGATION === */}
        <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto scrollbar-hide">
          {/* GLOBAL */}
          <div className="mb-5">
            {!isCollapsed && (
              <div className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.25em] px-3 mb-2">
                Global
              </div>
            )}
            <div className="space-y-0.5">
              {GLOBAL_NAV.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href) &&
                    !PROJECT_NAV.some((p) => pathname?.startsWith(p.href));
                const Icon = item.icon;
                return (
                  <NavItem
                    key={item.id}
                    href={item.href}
                    label={item.label}
                    Icon={Icon}
                    isActive={!!isActive}
                    isCollapsed={isCollapsed}
                    badge={item.badge}
                  />
                );
              })}
            </div>
          </div>

          {/* Divider */}
          {!isCollapsed && <div className="mx-3 border-t border-white/[0.04] my-3" />}

          {/* PROJECT */}
          <div>
            {!isCollapsed && (
              <div className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.25em] px-3 mb-2 flex items-center justify-between">
                <span>Projet</span>
                {currentExp && (
                  <span
                    className="font-black text-[10px]"
                    style={{ color: statusColor }}
                  >
                    {currentExp.progress}%
                  </span>
                )}
              </div>
            )}
            <div className="space-y-0.5">
              {PROJECT_NAV.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <NavItem
                    key={item.id}
                    href={item.href}
                    label={item.label}
                    Icon={Icon}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                  />
                );
              })}
            </div>
          </div>
        </nav>

        {/* === FOOTER === */}
        <div className="mt-auto border-t border-white/[0.06] p-2.5 shrink-0 space-y-1">
          <NavItem
            href="/basecamp/settings"
            label="Paramètres"
            Icon={Settings}
            isActive={pathname === "/basecamp/settings"}
            isCollapsed={isCollapsed}
          />

          <Link
            href="/basecamp/profile"
            className={cn(
              "flex items-center gap-3 rounded-xl transition-all group hover:bg-white/[0.03]",
              isCollapsed ? "justify-center p-2" : "px-2.5 py-2"
            )}
          >
            <div
              className="h-8 w-8 rounded-full relative flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md"
              style={{
                background: `linear-gradient(135deg, ${THEME.redDeep}, ${THEME.orange})`,
              }}
            >
              <span className="text-white font-black text-xs">M</span>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#050505]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-1 flex-col truncate">
                <span className="text-xs font-black text-white truncate">Marco</span>
                <span
                  className="text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{ color: THEME.orange }}
                >
                  PRO
                </span>
              </div>
            )}
          </Link>

          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full p-2 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-colors flex justify-center"
            >
              <PanelLeft size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* === CREATE MODAL === */}
      {showCreateModal &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={handleCloseCreateModal}
            />
            <div className="relative w-full max-w-lg mx-4 bg-[#111111] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: THEME.orange }}
                  />
                  <h2
                    className="text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{ color: THEME.orange }}
                  >
                    Initialiser Mission
                  </h2>
                </div>
                <button
                  onClick={handleCloseCreateModal}
                  className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    Nom de mission
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: GR20_SUD_ALPHA..."
                    value={newExpedition.name}
                    onChange={(e) =>
                      setNewExpedition((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/[0.08] text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#F9591F]/50 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                      Terrain cible
                    </label>
                    <div className="relative">
                      <select
                        value={newExpedition.terrainId}
                        onChange={(e) =>
                          setNewExpedition((prev) => ({ ...prev, terrainId: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/[0.08] text-white appearance-none focus:outline-none focus:border-[#F9591F]/50 transition-colors cursor-pointer"
                      >
                        {AVAILABLE_TERRAINS.map((terrain) => (
                          <option key={terrain.id} value={terrain.id}>
                            {terrain.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                      Fenêtre de départ
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newExpedition.startDate}
                        onChange={(e) =>
                          setNewExpedition((prev) => ({ ...prev, startDate: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-white/[0.08] text-white focus:outline-none focus:border-[#F9591F]/50 transition-colors cursor-pointer"
                      />
                      <Calendar
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-[#0a0a0a]">
                <button
                  onClick={handleCloseCreateModal}
                  className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
                >
                  Abandonner
                </button>
                <button
                  onClick={handleSubmitNewExpedition}
                  disabled={!newExpedition.name || !newExpedition.terrainId}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    newExpedition.name && newExpedition.terrainId
                      ? "bg-[#B21D3B] hover:bg-[#F9591F] text-white shadow-lg shadow-[#B21D3B]/30"
                      : "bg-white/5 text-zinc-700 cursor-not-allowed"
                  )}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Lancer Mission
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

// ============================================================================
// NAV ITEM COMPONENT
// ============================================================================
function NavItem({
  href,
  label,
  Icon,
  isActive,
  isCollapsed,
  badge,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  isActive: boolean;
  isCollapsed: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl text-[13px] font-bold transition-all overflow-hidden",
        isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5",
        isActive
          ? "text-white bg-[#111111]"
          : "text-zinc-500 hover:text-white hover:bg-white/[0.03]"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{
            background: `linear-gradient(180deg, ${THEME.redDeep}, ${THEME.orange})`,
            boxShadow: `0 0 8px ${THEME.redVivid}80`,
          }}
        />
      )}
      {/* Hover glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
          isActive && "opacity-100"
        )}
        style={{
          background: isActive
            ? `radial-gradient(circle at 0% 50%, ${THEME.redDeep}20 0%, transparent 70%)`
            : "radial-gradient(circle at 0% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
      />

      <Icon
        className={cn(
          "w-4 h-4 transition-colors flex-shrink-0 relative z-10",
          isActive ? "text-white" : "text-zinc-600 group-hover:text-zinc-300"
        )}
        strokeWidth={isActive ? 2.5 : 2}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate relative z-10">{label}</span>
          {badge && (
            <span
              className={cn(
                "text-[9px] font-black px-1.5 py-0.5 rounded relative z-10",
                isActive
                  ? "bg-white/10 text-white"
                  : "bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-zinc-300"
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ============================================================================
// EXPEDITION SECTION COMPONENT
// ============================================================================
function ExpeditionSection({
  title,
  icon,
  expeditions,
  selectedId,
  onSelect,
  showBorder = false,
  muted = false,
}: {
  title: string;
  icon: React.ReactNode;
  expeditions: Expedition[];
  selectedId: string;
  onSelect: (id: string) => void;
  showBorder?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn(showBorder && "border-t border-white/[0.04]")}>
      <div className="px-4 py-2.5 flex items-center gap-2 bg-[#0a0a0a]">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
          {title}
        </span>
        <span className="text-[9px] font-black text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded ml-auto">
          {expeditions.length}
        </span>
      </div>
      <div className="py-1">
        {expeditions.map((exp) => {
          const daysLeft = getDaysLeft(exp.startDate);
          const statusColor = getStatusColor(exp.progress);
          return (
            <button
              key={exp.id}
              onClick={() => onSelect(exp.id)}
              className={cn(
                "w-full px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-white/[0.03] text-left",
                exp.id === selectedId && "bg-white/[0.04]",
                muted && "opacity-60 hover:opacity-100"
              )}
            >
              <div className="w-4 flex justify-center flex-shrink-0">
                {exp.id === selectedId ? (
                  <Check size={14} style={{ color: THEME.orange }} strokeWidth={3} />
                ) : (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: statusColor, opacity: 0.5 }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-white truncate">{exp.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-zinc-500">{exp.location}</span>
                  <span className="text-zinc-700">·</span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: exp.status === "completed" ? THEME.emerald : THEME.zinc[500],
                    }}
                  >
                    {exp.status === "completed" ? "✓ Terminé" : `J-${daysLeft}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-black" style={{ color: statusColor }}>
                  {exp.progress}%
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: statusColor,
                    boxShadow: `0 0 6px ${statusColor}80`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
