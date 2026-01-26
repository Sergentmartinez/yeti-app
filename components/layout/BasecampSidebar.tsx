"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  ChevronDown, Check, Plus, Search, Pin, Clock, Archive,
  PanelLeftClose, PanelLeft, AlertTriangle, Timer, X, Calendar,
  Mountain, MapPin
} from "lucide-react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

// Types pour les expéditions
interface Expedition {
  id: string;
  name: string;
  location: string;
  days: number;
  startDate: string;
  progress: number;
  weight: number | null;
  alerts: number;
  status: 'preparation' | 'active' | 'completed';
  pinned: boolean;
}

// Terrains disponibles
const AVAILABLE_TERRAINS = [
  { id: 'gr20', name: 'GR20 Corse', location: 'Corse, France', days: 16 },
  { id: 'tmb', name: 'Tour du Mont-Blanc', location: 'Alpes', days: 11 },
  { id: 'camino', name: 'Camino Frances', location: 'Espagne', days: 35 },
  { id: 'gr10', name: 'GR10 Pyrénées', location: 'Pyrénées, France', days: 45 },
  { id: 'custom', name: 'Expédition personnalisée', location: 'Personnalisé', days: 0 },
];

// Données demo des expéditions (initiales)
const INITIAL_EXPEDITIONS: Expedition[] = [
  { id: 'gr20', name: 'GR20 Nord → Sud', location: 'Corse', days: 16, startDate: '2026-03-20', progress: 85, weight: 4.2, alerts: 3, status: 'preparation', pinned: true },
  { id: 'tmb', name: 'Tour du Mont-Blanc', location: 'Alpes', days: 11, startDate: '2026-05-15', progress: 42, weight: 3.8, alerts: 1, status: 'preparation', pinned: true },
  { id: 'camino', name: 'Camino Frances', location: 'Espagne', days: 35, startDate: '2026-09-01', progress: 15, weight: null, alerts: 0, status: 'preparation', pinned: false },
  { id: 'vercors', name: 'Tour du Vercors', location: 'France', days: 5, startDate: '2024-08-10', progress: 100, weight: 3.2, alerts: 0, status: 'completed', pinned: false },
];

// Navigation globale
const GLOBAL_NAV = [
  { id: 'basecamp', href: "/basecamp", label: "Basecamp", icon: Icons.Home, exact: true },
  { id: 'garage', href: "/basecamp/garage", label: "Garage", icon: Icons.Archive, badge: "62" },
  { id: 'projects', href: "/basecamp/projects", label: "Projets", icon: Icons.Folder, badge: "4" },
];

// Navigation projet
const PROJECT_NAV = [
  { id: 'dashboard', href: "/basecamp/dashboard", label: "Dashboard", icon: Icons.Gauge },
  { id: 'pack', href: "/basecamp/packbuilder", label: "Pack Builder", icon: Icons.NavPack },
  { id: 'timeline', href: "/basecamp/timeline", label: "Timeline", icon: Icons.Activity },
  { id: 'budget', href: "/basecamp/budget", label: "Budget", icon: Icons.Wallet },
  { id: 'routes', href: "/basecamp/routes", label: "Itinéraire", icon: Icons.NavRoutes },
  { id: 'weather', href: "/basecamp/weather", label: "Météo", icon: Icons.CloudSun },
  { id: 'sherpa', href: "/basecamp/sherpa", label: "Sherpa AI", icon: Icons.Zap },
];

// Helpers
const getStatusColor = (progress: number): string => {
  if (progress >= 80) return 'var(--accent-emerald)';
  if (progress >= 20) return 'var(--accent-orange)';
  return 'var(--accent-red)';
};

const getDaysLeft = (startDate: string): number => {
  const today = new Date();
  const start = new Date(startDate);
  const diffTime = start.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function BasecampSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExpeditionPicker, setShowExpeditionPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpeditionId, setSelectedExpeditionId] = useState('gr20');
  
  // État pour les expéditions (dynamique)
  const [expeditions, setExpeditions] = useState<Expedition[]>(INITIAL_EXPEDITIONS);
  
  // État pour le formulaire de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExpedition, setNewExpedition] = useState({
    name: '',
    terrainId: 'gr20',
    startDate: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Expédition courante
  const currentExp = expeditions.find(e => e.id === selectedExpeditionId);
  const daysLeft = currentExp ? getDaysLeft(currentExp.startDate) : 0;

  // Filtrer les expéditions
  const filteredExpeditions = expeditions.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedExps = filteredExpeditions.filter(e => e.pinned && e.status !== 'completed');
  const recentExps = filteredExpeditions.filter(e => !e.pinned && e.status !== 'completed');
  const completedExps = filteredExpeditions.filter(e => e.status === 'completed');

  // Gestion du clic sur le switcher
  const handleSwitcherClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => setShowExpeditionPicker(true), 200);
    } else {
      setShowExpeditionPicker(!showExpeditionPicker);
    }
  };

  // Sélectionner une expédition
  const handleSelectExpedition = (expId: string) => {
    setSelectedExpeditionId(expId);
    setShowExpeditionPicker(false);
    setSearchQuery('');
    router.push('/basecamp/dashboard');
  };

  // Créer une nouvelle expédition - ouvrir le modal
  const handleCreateExpedition = () => {
    setShowExpeditionPicker(false);
    setShowCreateModal(true);
    setNewExpedition({ name: '', terrainId: 'gr20', startDate: '' });
  };

  // Soumettre le formulaire de création
  const handleSubmitNewExpedition = () => {
    if (!newExpedition.name || !newExpedition.terrainId) return;
    
    // Trouver le terrain sélectionné
    const terrain = AVAILABLE_TERRAINS.find(t => t.id === newExpedition.terrainId);
    
    // Créer la nouvelle expédition
    const newId = `exp-${Date.now()}`;
    const newExp: Expedition = {
      id: newId,
      name: newExpedition.name,
      location: terrain?.location || 'Personnalisé',
      days: terrain?.days || 0,
      startDate: newExpedition.startDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      weight: null,
      alerts: 0,
      status: 'preparation',
      pinned: false
    };
    
    // Ajouter l'expédition à la liste et sélectionner
    setExpeditions(prev => [newExp, ...prev]);
    setSelectedExpeditionId(newId);
    
    // Fermer le modal et réinitialiser
    setShowCreateModal(false);
    setNewExpedition({ name: '', terrainId: 'gr20', startDate: '' });
    
    // Naviguer vers le dashboard après un court délai pour laisser l'état se mettre à jour
    setTimeout(() => {
      router.push('/basecamp/dashboard');
    }, 100);
  };

  // Fermer le modal de création
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewExpedition({ name: '', terrainId: 'gr20', startDate: '' });
  };

  if (!mounted) return null;

  return (
    <>
      <aside 
        className={cn(
          "flex h-screen flex-col border-r border-border-subtle bg-bg-surface-1 transition-all duration-300 sidebar-texture fixed left-0 top-0 z-40",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo + Collapse */}
        <div className={cn(
          "flex h-14 items-center border-b border-border-subtle",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}>
          {!isCollapsed && (
            <Link href="/" className="font-black tracking-tighter text-2xl text-text-primary">
              YETI
            </Link>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface-3/50 transition-colors"
          >
            {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* Expedition Switcher */}
        <div className="p-3 relative">
          <button
            onClick={handleSwitcherClick}
            className={cn(
              "w-full rounded-xl bg-bg-surface-2 border border-border-default transition-all hover:bg-bg-surface-3/50",
              isCollapsed ? "p-3" : "p-3"
            )}
          >
            {isCollapsed ? (
              <div className="flex justify-center">
                <Icons.Backpack className="w-6 h-6 text-accent-cyan" />
              </div>
            ) : currentExp ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-text-primary truncate">
                    {currentExp.name}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={cn(
                      "text-text-muted transition-transform flex-shrink-0",
                      showExpeditionPicker && "rotate-180"
                    )} 
                  />
                </div>
                
                {/* Progress bar */}
                <div className="h-1 rounded-full bg-bg-surface-4 mb-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${currentExp.progress}%`,
                      background: getStatusColor(currentExp.progress)
                    }}
                  />
                </div>
                
                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Timer size={12} />
                    J-{daysLeft}
                  </span>
                  {currentExp.weight && (
                    <span className="flex items-center gap-1">
                      <Icons.NavPack className="w-3 h-3" />
                      {currentExp.weight}kg
                    </span>
                  )}
                  {currentExp.alerts > 0 && (
                    <span className="flex items-center gap-1 text-accent-orange">
                      <AlertTriangle size={12} />
                      {currentExp.alerts}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className="text-text-muted text-sm">Sélectionner un projet</span>
            )}
          </button>

          {/* Expedition Dropdown */}
          {showExpeditionPicker && !isCollapsed && (
            <>
              <div 
                className="fixed inset-0 z-[99]"
                onClick={() => setShowExpeditionPicker(false)}
              />
              
              <div className="absolute left-3 right-3 mt-2 rounded-xl bg-bg-surface-2 border border-border-default shadow-2xl overflow-hidden z-[100] max-h-[450px] overflow-y-auto">
                {/* Create New Expedition - TOP */}
                <button 
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold bg-gradient-to-r from-accent-cyan/20 to-transparent hover:from-accent-cyan/30 transition-colors border-b border-border-subtle"
                  onClick={handleCreateExpedition}
                >
                  <div className="p-2 rounded-lg bg-accent-cyan/20 border border-accent-cyan/30">
                    <Plus size={16} className="text-accent-cyan" />
                  </div>
                  <span className="text-accent-cyan">Créer une expédition</span>
                </button>

                {/* Search */}
                <div className="p-3 border-b border-border-subtle bg-bg-surface-3/30">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg-surface-1 border border-border-subtle">
                    <Search size={16} className="text-text-muted flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Rechercher une expédition..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted flex-1"
                    />
                  </div>
                </div>

                {/* Pinned */}
                {pinnedExps.length > 0 && (
                  <ExpeditionSection 
                    title="Épinglés" 
                    icon={<Pin size={14} className="text-accent-orange" />}
                    expeditions={pinnedExps}
                    selectedId={selectedExpeditionId}
                    onSelect={handleSelectExpedition}
                  />
                )}

                {/* Recent */}
                {recentExps.length > 0 && (
                  <ExpeditionSection 
                    title="En préparation" 
                    icon={<Clock size={14} className="text-accent-cyan" />}
                    expeditions={recentExps}
                    selectedId={selectedExpeditionId}
                    onSelect={handleSelectExpedition}
                    showBorder={pinnedExps.length > 0}
                  />
                )}

                {/* Completed */}
                {completedExps.length > 0 && (
                  <ExpeditionSection 
                    title="Terminés" 
                    icon={<Archive size={14} className="text-accent-emerald" />}
                    expeditions={completedExps}
                    selectedId={selectedExpeditionId}
                    onSelect={handleSelectExpedition}
                    showBorder
                    muted
                  />
                )}

                {/* Empty state */}
                {filteredExpeditions.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-text-muted">Aucune expédition trouvée</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-hide">
          {/* GLOBAL Section */}
          <div className="mb-4">
            {!isCollapsed && (
              <div className="text-xs uppercase font-black text-text-faint tracking-[0.15em] px-3 mb-2">
                Global
              </div>
            )}
            <div className="space-y-0.5">
              {GLOBAL_NAV.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname?.startsWith(item.href) && !PROJECT_NAV.some(p => pathname?.startsWith(p.href));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg text-sm font-bold transition-all relative",
                      isCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                      isActive
                        ? "bg-gradient-to-r from-accent-cyan-muted to-transparent text-accent-cyan border-l-[3px] border-accent-cyan rounded-l-none"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-4/30 border-l-[3px] border-transparent"
                    )}
                  >
                    <Icon className={cn(
                      "w-[18px] h-[18px] transition-colors flex-shrink-0",
                      isActive ? "text-accent-cyan" : "text-text-muted group-hover:text-text-primary"
                    )} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-bg-surface-3 text-text-muted">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-2 border-t border-border-subtle" />

          {/* PROJECT Section */}
          <div className="pt-2">
            {!isCollapsed && (
              <div className="text-xs uppercase font-black text-text-faint tracking-[0.15em] px-3 mb-2 flex items-center justify-between">
                <span>Projet</span>
                {currentExp && (
                  <span 
                    className="font-bold"
                    style={{ color: getStatusColor(currentExp.progress) }}
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
                  <Link
                    key={item.id}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg text-sm font-bold transition-all",
                      isCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                      isActive
                        ? "bg-gradient-to-r from-accent-cyan-muted to-transparent text-accent-cyan border-l-[3px] border-accent-cyan rounded-l-none"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-4/30 border-l-[3px] border-transparent"
                    )}
                  >
                    <Icon className={cn(
                      "w-[18px] h-[18px] transition-colors flex-shrink-0",
                      isActive ? "text-accent-cyan" : "text-text-muted group-hover:text-text-primary"
                    )} />
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-border-subtle p-3">
          <Link
            href="/basecamp/settings"
            title={isCollapsed ? "Paramètres" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-bg-surface-4/30 transition-colors mb-2",
              isCollapsed ? "justify-center p-3" : "px-3 py-2.5"
            )}
          >
            <Icons.Settings className="w-[18px] h-[18px] text-text-muted" />
            {!isCollapsed && <span>Paramètres</span>}
          </Link>
          
          <Link
            href="/basecamp/profile"
            className={cn(
              "flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-bg-surface-4/30 group",
              isCollapsed && "justify-center"
            )}
          >
            <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue shadow-md relative flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-1 flex-col truncate">
                <span className="text-sm font-bold text-text-primary truncate">Marco</span>
                <span className="text-xs font-black text-accent-cyan uppercase tracking-tight">Pro</span>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Modal de création d'expédition */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseCreateModal}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 bg-bg-surface-2 rounded-2xl border border-border-default shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <h2 className="text-sm font-black uppercase tracking-[0.15em] text-text-primary">
                Initialiser l'expédition
              </h2>
              <button 
                onClick={handleCloseCreateModal}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface-3 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Nom de mission */}
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.15em] text-text-muted mb-2">
                  Nom de mission
                </label>
                <input
                  type="text"
                  placeholder="Ex: GR20_SUD_ALPHA..."
                  value={newExpedition.name}
                  onChange={(e) => setNewExpedition(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-bg-surface-1 border border-border-default text-text-primary placeholder:text-text-faint focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              
              {/* Row: Terrain + Date */}
              <div className="grid grid-cols-2 gap-4">
                {/* Terrain cible */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.15em] text-text-muted mb-2">
                    Terrain cible
                  </label>
                  <div className="relative">
                    <select
                      value={newExpedition.terrainId}
                      onChange={(e) => setNewExpedition(prev => ({ ...prev, terrainId: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-bg-surface-1 border border-border-default text-text-primary appearance-none focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer"
                    >
                      {AVAILABLE_TERRAINS.map(terrain => (
                        <option key={terrain.id} value={terrain.id}>
                          {terrain.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
                
                {/* Fenêtre de départ */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.15em] text-text-muted mb-2">
                    Fenêtre de départ
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newExpedition.startDate}
                      onChange={(e) => setNewExpedition(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-bg-surface-1 border border-border-default text-text-primary focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer"
                    />
                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end gap-4 px-6 py-5 border-t border-border-subtle bg-bg-surface-3/30">
              <button
                onClick={handleCloseCreateModal}
                className="px-5 py-2.5 text-sm font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide"
              >
                Abandonner
              </button>
              <button
                onClick={handleSubmitNewExpedition}
                disabled={!newExpedition.name || !newExpedition.terrainId}
                className={cn(
                  "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2",
                  newExpedition.name && newExpedition.terrainId
                    ? "bg-gradient-to-r from-accent-cyan to-accent-blue text-white hover:shadow-lg hover:shadow-accent-cyan/30 hover:scale-[1.02]"
                    : "bg-bg-surface-4 text-text-faint cursor-not-allowed"
                )}
              >
                <Icons.Zap className="w-4 h-4" />
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

// Composant Section d'expéditions - Amélioré
function ExpeditionSection({ 
  title, 
  icon, 
  expeditions, 
  selectedId, 
  onSelect,
  showBorder = false,
  muted = false
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
    <div className={cn(showBorder && "border-t border-border-subtle")}>
      {/* Section Header - Plus visible */}
      <div className="px-4 py-3 flex items-center gap-2 bg-bg-surface-3/50">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          {title}
        </span>
        <span className="text-xs font-bold text-text-faint bg-bg-surface-4 px-1.5 py-0.5 rounded">
          {expeditions.length}
        </span>
      </div>
      
      {/* Items */}
      <div className="py-1">
        {expeditions.map(exp => {
          const daysLeft = getDaysLeft(exp.startDate);
          return (
            <button
              key={exp.id}
              onClick={() => onSelect(exp.id)}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-bg-surface-3/50 text-left",
                exp.id === selectedId && "bg-bg-surface-3",
                muted && "opacity-60 hover:opacity-100"
              )}
            >
              {/* Checkmark ou espace */}
              <div className="w-5 flex justify-center flex-shrink-0">
                {exp.id === selectedId ? (
                  <Check size={16} className="text-accent-cyan" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-bg-surface-4" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-primary truncate font-semibold">
                  {exp.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-muted">
                    {exp.location}
                  </span>
                  <span className="text-text-faint">•</span>
                  <span className={cn(
                    "text-xs font-medium",
                    exp.status === 'completed' ? "text-accent-emerald" : "text-text-muted"
                  )}>
                    {exp.status === 'completed' ? '✓ Terminé' : `J-${daysLeft}`}
                  </span>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold" style={{ color: getStatusColor(exp.progress) }}>
                  {exp.progress}%
                </span>
                <div 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: getStatusColor(exp.progress) }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
