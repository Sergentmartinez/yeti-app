"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Euro, Plane, Train, Ship, Car, Backpack, UtensilsCrossed, Home,
  Plus, Edit3, Check, X, ChevronDown, Trash2, Wallet, Link2,
  TrendingUp, TrendingDown, AlertTriangle, Sparkles, Calendar,
  Package, FileCheck, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useYetiStore } from "@/lib/store/useYetiStore";

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
  bgDeep: "#000000",
  bgCard: "#1c1c1e",
  orange: "#f97316",
  cyan: "#06b6d4",
  emerald: "#10b981",
  red: "#ef4444",
  violet: "#8b5cf6",
  amber: "#d97706",
};

// ============================================================================
// TYPES
// ============================================================================

interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  note?: string;
  paid: boolean;
  source?: 'manual' | 'packbuilder' | 'timeline'; // D'où vient cette donnée
  sourceId?: string; // ID de l'item source pour le lien
}

interface BudgetCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
  items: BudgetItem[];
}

// ============================================================================
// BUDGET INTELLIGENT - Agrégation des données
// ============================================================================

// Hook pour récupérer les données du store et les transformer en budget
const useBudgetData = () => {
  const { packedItems, gearLibrary } = useYetiStore();
  
  // Items du PackBuilder avec prix
  const packBuilderItems: BudgetItem[] = useMemo(() => {
    return packedItems
      .filter(item => item.price > 0)
      .map(item => ({
        id: `pack-${item.id}`,
        label: item.name,
        amount: item.price,
        note: `Pack Builder • ${item.brand || item.category}`,
        paid: true, // On considère le matos possédé comme payé
        source: 'packbuilder' as const,
        sourceId: item.id,
      }));
  }, [packedItems]);
  
  return { packBuilderItems };
};

// ============================================================================
// COMPOSANTS
// ============================================================================

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl border border-white/[0.06] bg-[#1c1c1e] p-5", className)}>
    {children}
  </div>
);

// Source Badge - indique d'où vient l'item
const SourceBadge = ({ source }: { source?: string }) => {
  if (!source || source === 'manual') return null;
  
  const config = {
    packbuilder: { label: 'Pack Builder', color: COLORS.orange, icon: Backpack },
    timeline: { label: 'Timeline', color: COLORS.cyan, icon: Calendar },
  }[source];
  
  if (!config) return null;
  const Icon = config.icon;
  
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-bold" style={{ color: config.color }}>
      <Link2 className="w-2.5 h-2.5" />
      {config.label}
    </div>
  );
};

// Jauge horizontale simple
const BudgetGauge = ({ categories, limit }: { categories: BudgetCategory[]; limit: number }) => {
  const totalSpent = categories.reduce((sum, cat) => 
    sum + cat.items.reduce((s, item) => s + item.amount, 0), 0
  );
  
  const segments = categories.map(cat => ({
    ...cat,
    total: cat.items.reduce((sum, item) => sum + item.amount, 0)
  }));
  
  return (
    <div className="space-y-3">
      {/* Barre */}
      <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden flex">
        {segments.map((seg, i) => {
          const widthPercent = (seg.total / limit) * 100;
          if (widthPercent === 0) return null;
          return (
            <motion.div
              key={seg.id}
              className="h-full relative group"
              style={{ 
                width: `${Math.max(widthPercent, 1)}%`,
                backgroundColor: seg.color,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {seg.label}: {seg.total}€
              </div>
            </motion.div>
          );
        })}
        
        {/* Dépassement */}
        {totalSpent > limit && (
          <motion.div
            className="h-full bg-red-500/50"
            style={{ width: `${((totalSpent - limit) / limit) * 100}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
          />
        )}
      </div>
      
      {/* Légende */}
      <div className="flex flex-wrap gap-3">
        {segments.map(seg => (
          <div key={seg.id} className="flex items-center gap-1.5 text-[11px]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-zinc-400">{seg.label}</span>
            <span className="text-zinc-600 font-mono">{seg.total}€</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Catégorie expandable
const BudgetCategoryCard = ({ 
  category, 
  onUpdate, 
  onAddItem, 
  onDeleteItem 
}: { 
  category: BudgetCategory;
  onUpdate: (categoryId: string, itemId: string, updates: Partial<BudgetItem>) => void;
  onAddItem: (categoryId: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const total = category.items.reduce((sum, item) => sum + item.amount, 0);
  const paidTotal = category.items.filter(i => i.paid).reduce((sum, item) => sum + item.amount, 0);
  const linkedItems = category.items.filter(i => i.source && i.source !== 'manual').length;
  const Icon = category.icon;
  
  return (
    <Card className="overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between -m-5 p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
            <Icon className="w-5 h-5" style={{ color: category.color }} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{category.label}</h3>
              {linkedItems > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">
                  {linkedItems} liés
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">{category.items.length} éléments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-lg font-black text-white">{total}€</div>
            <div className="text-[10px] text-zinc-500">
              {paidTotal > 0 && <span className="text-emerald-400">{paidTotal}€ payé</span>}
              {paidTotal > 0 && total - paidTotal > 0 && ' · '}
              {total - paidTotal > 0 && <span>{total - paidTotal}€ restant</span>}
            </div>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform", isExpanded && "rotate-180")} />
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-5 border-t border-white/5 space-y-2">
              {category.items.map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-colors",
                    item.paid ? "bg-white/[0.02]" : "bg-white/[0.04]",
                    item.source && item.source !== 'manual' && "border-l-2",
                  )}
                  style={item.source && item.source !== 'manual' ? { borderLeftColor: category.color } : undefined}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Checkbox payé */}
                    <button
                      onClick={() => onUpdate(category.id, item.id, { paid: !item.paid })}
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        item.paid ? "border-emerald-500 bg-emerald-500/20" : "border-zinc-600 hover:border-zinc-400"
                      )}
                    >
                      {item.paid && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium truncate", item.paid ? "text-zinc-400 line-through" : "text-white")}>
                          {item.label}
                        </span>
                        <SourceBadge source={item.source} />
                      </div>
                      {item.note && <div className="text-[10px] text-zinc-500 truncate">{item.note}</div>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={item.amount}
                          className="w-20 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-white text-right"
                          onBlur={(e) => { 
                            onUpdate(category.id, item.id, { amount: parseInt(e.target.value) || 0 }); 
                            setEditingId(null); 
                          }}
                          onKeyDown={(e) => { 
                            if (e.key === 'Enter') { 
                              onUpdate(category.id, item.id, { amount: parseInt((e.target as HTMLInputElement).value) || 0 }); 
                              setEditingId(null); 
                            }
                          }}
                          autoFocus
                        />
                        <span className="text-zinc-400">€</span>
                      </div>
                    ) : (
                      <>
                        <span className={cn("text-sm font-bold font-mono", item.amount === 0 ? "text-zinc-500" : "text-white")}>
                          {item.amount}€
                        </span>
                        {(!item.source || item.source === 'manual') && (
                          <>
                            <button onClick={() => setEditingId(item.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDeleteItem(category.id, item.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {item.source && item.source !== 'manual' && (
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-orange-400 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Bouton ajouter */}
              <button
                onClick={() => onAddItem(category.id)}
                className="w-full p-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Ajouter manuellement
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// ============================================================================
// PAGE PRINCIPALE
// ============================================================================

export default function BudgetPage() {
  const { packBuilderItems } = useBudgetData();
  const [budgetLimit, setBudgetLimit] = useState(1500);
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(budgetLimit.toString());
  
  // État initial des catégories avec données automatiques
  const [categories, setCategories] = useState<BudgetCategory[]>(() => [
    {
      id: 'transport',
      label: 'Transport',
      icon: Plane,
      color: COLORS.cyan,
      items: [
        { id: 't1', label: 'Vol A/R Paris-Ajaccio', amount: 180, paid: true, source: 'manual' },
        { id: 't2', label: 'Train Paris-Orly', amount: 35, paid: true, source: 'manual' },
        { id: 't3', label: 'Ferry vers Calenzana', amount: 55, paid: false, source: 'manual' },
        { id: 't4', label: 'Navette retour Conca', amount: 50, paid: false, source: 'manual' },
      ]
    },
    {
      id: 'materiel',
      label: 'Matériel',
      icon: Backpack,
      color: COLORS.orange,
      items: [
        // Ces items seraient automatiquement liés au PackBuilder
        { id: 'm1', label: 'Sac de couchage Spark SpII', amount: 390, note: 'Pack Builder • Sea to Summit', paid: true, source: 'packbuilder', sourceId: 'duvet-1' },
        { id: 'm2', label: 'Matelas NeoAir XLite', amount: 180, note: 'Pack Builder • Therm-a-Rest', paid: true, source: 'packbuilder', sourceId: 'matelas-1' },
        { id: 'm3', label: 'Filtre Sawyer Squeeze', amount: 45, note: 'Pack Builder • Sawyer', paid: false, source: 'packbuilder', sourceId: 'filtre-1' },
        { id: 'm4', label: 'Tente Hubba Hubba NX', amount: 0, note: 'Déjà possédé', paid: true, source: 'manual' },
      ]
    },
    {
      id: 'nourriture',
      label: 'Nourriture',
      icon: UtensilsCrossed,
      color: COLORS.emerald,
      items: [
        { id: 'n1', label: 'Lyophilisés (16 jours)', amount: 160, paid: false, source: 'manual' },
        { id: 'n2', label: 'Barres & snacks', amount: 45, paid: false, source: 'manual' },
        { id: 'n3', label: 'Repas refuges (8×15€)', amount: 120, paid: false, source: 'manual' },
      ]
    },
    {
      id: 'hebergement',
      label: 'Hébergement',
      icon: Home,
      color: COLORS.violet,
      items: [
        { id: 'h1', label: 'Nuit refuge Carrozzu', amount: 18, paid: false, source: 'manual' },
        { id: 'h2', label: 'Nuit refuge Manganu', amount: 18, paid: false, source: 'manual' },
        { id: 'h3', label: 'Nuit Vizzavona (hôtel)', amount: 65, paid: false, source: 'manual' },
      ]
    },
    {
      id: 'assurance',
      label: 'Assurance & Admin',
      icon: FileCheck,
      color: COLORS.amber,
      items: [
        { id: 'a1', label: 'Assurance rapatriement', amount: 89, paid: false, source: 'manual' },
        { id: 'a2', label: 'Frais carte IGN', amount: 15, paid: true, source: 'manual' },
      ]
    },
  ]);
  
  // Calculs
  const totalSpent = categories.reduce((sum, cat) => 
    sum + cat.items.reduce((s, item) => s + item.amount, 0), 0
  );
  const totalPaid = categories.reduce((sum, cat) => 
    sum + cat.items.filter(i => i.paid).reduce((s, item) => s + item.amount, 0), 0
  );
  const remaining = budgetLimit - totalSpent;
  const isOverBudget = remaining < 0;
  const linkedItemsCount = categories.reduce((sum, cat) => 
    sum + cat.items.filter(i => i.source && i.source !== 'manual').length, 0
  );
  
  // Handlers
  const handleUpdateItem = (categoryId: string, itemId: string, updates: Partial<BudgetItem>) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, ...updates } : item) };
      }
      return cat;
    }));
  };
  
  const handleAddItem = (categoryId: string) => {
    const newItem: BudgetItem = { 
      id: `new-${Date.now()}`, 
      label: 'Nouvel élément', 
      amount: 0, 
      paid: false,
      source: 'manual'
    };
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat));
  };
  
  const handleDeleteItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, items: cat.items.filter(item => item.id !== itemId) } : cat));
  };
  
  const handleSaveLimit = () => {
    const newLimit = parseInt(tempLimit);
    if (!isNaN(newLimit) && newLimit > 0) setBudgetLimit(newLimit);
    setIsEditingLimit(false);
  };
  
  return (
    <div className="min-h-screen text-white font-sans" style={{ backgroundColor: COLORS.bgDeep }}>
      <div className="px-4 md:px-6 lg:px-8 pt-8 pb-24 max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-orange-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Budget Intelligent</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Budget Trek</h1>
            <div className="flex items-center gap-2 text-[11px]">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-zinc-400">{linkedItemsCount} éléments synchronisés</span>
            </div>
          </div>
        </header>
        
        {/* Summary Card */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            {/* Total */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Total prévu</div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{totalSpent}</span>
                <span className="text-xl font-bold text-zinc-500">€</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6 lg:gap-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Payé</div>
                <div className="text-2xl font-bold text-emerald-400">{totalPaid}€</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Restant</div>
                <div className="text-2xl font-bold text-amber-400">{totalSpent - totalPaid}€</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">{isOverBudget ? 'Dépassement' : 'Marge'}</div>
                <div className={cn("text-2xl font-bold flex items-center gap-1", isOverBudget ? "text-red-400" : "text-cyan-400")}>
                  {isOverBudget ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {Math.abs(remaining)}€
                </div>
              </div>
            </div>
            
            {/* Limite */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Limite</div>
              {isEditingLimit ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={tempLimit} 
                    onChange={(e) => setTempLimit(e.target.value)}
                    className="w-24 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-xl font-bold text-white text-right" 
                    autoFocus 
                  />
                  <span className="text-zinc-400">€</span>
                  <button onClick={handleSaveLimit} className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsEditingLimit(false)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setTempLimit(budgetLimit.toString()); setIsEditingLimit(true); }} className="flex items-center gap-2 group">
                  <span className="text-2xl font-bold text-white">{budgetLimit}€</span>
                  <Edit3 className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </button>
              )}
            </div>
          </div>
          
          {/* Jauge */}
          <BudgetGauge categories={categories} limit={budgetLimit} />
          
          {/* Info sync */}
          <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-400">Synchronisation intelligente</p>
              <p className="text-xs text-zinc-400 mt-1">
                Les prix du Pack Builder et de la Timeline sont automatiquement importés. 
                Les éléments liés sont marqués avec un badge orange.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Catégories */}
        <div className="space-y-4">
          {categories.map(category => (
            <BudgetCategoryCard
              key={category.id}
              category={category}
              onUpdate={handleUpdateItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
