// app/basecamp/packbuilder/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Share2, Download, Copy, MoreVertical, Trash2,
  ChevronDown, ChevronRight, Edit3, Package, Weight, Shirt,
  Apple, Tag, Info, Check, X, Backpack, Filter, SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GEAR_ITEMS, GEAR_CATEGORIES, formatWeight } from "@/lib/gear";
import type { GearItem } from "@/types";

// ============================================================================
// DESIGN TOKENS — aligné Dashboard
// ============================================================================
const THEME = {
  bg: "#050505",
  card: "#111111",
  cardHover: "#161616",
  border: "rgba(255,255,255,0.08)",
  red: "#f21e2c",
  redDark: "#B21D3B",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
};

// Couleurs par catégorie (utilisées pour chart + pastilles)
const CATEGORY_COLORS: Record<string, string> = {
  shelter: "#B21D3B",
  sleep: "#f21e2c",
  pack: "#F9591F",
  clothing: "#FEC631",
  footwear: "#a16207",
  cooking: "#84cc16",
  water: "#06b6d4",
  navigation: "#8b5cf6",
  safety: "#ec4899",
  electronics: "#6366f1",
  hygiene: "#14b8a6",
  misc: "#64748b",
};

const CATEGORY_ICONS: Record<string, string> = {
  shelter: "⛺",
  sleep: "🛏️",
  pack: "🎒",
  clothing: "🧥",
  footwear: "👟",
  cooking: "🍳",
  water: "💧",
  navigation: "🧭",
  safety: "⚕️",
  electronics: "🔋",
  hygiene: "🧴",
  misc: "📦",
};

// ============================================================================
// TYPES
// ============================================================================
type PackItemMeta = {
  qty: number;
  worn: boolean;      // porté sur soi (ne compte pas dans le sac)
  consumable: boolean; // nourriture, gaz, eau (se consomme pendant le trek)
};

type PackItem = GearItem & PackItemMeta;

// ============================================================================
// HELPERS
// ============================================================================
const formatKg = (grams: number) => `${(grams / 1000).toFixed(2)} kg`;
const formatG = (grams: number) => `${grams} g`;

// ============================================================================
// COMPOSANTS
// ============================================================================

const StatCard = ({
  label,
  value,
  unit,
  hint,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-5 flex flex-col justify-between min-h-[120px]">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <Icon size={16} className="text-zinc-600" />
    </div>
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-black tracking-tight" style={{ color }}>
          {value}
        </span>
        {unit && <span className="text-sm font-bold text-zinc-500">{unit}</span>}
      </div>
      {hint && <div className="text-[11px] text-zinc-500 mt-1">{hint}</div>}
    </div>
  </div>
);

const CategoryBar = ({
  segments,
  total,
}: {
  segments: { id: string; name: string; weight: number; color: string }[];
  total: number;
}) => {
  if (total === 0) {
    return (
      <div className="h-3 w-full rounded-full bg-zinc-900" />
    );
  }
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-900">
      {segments.map((s) => {
        const pct = (s.weight / total) * 100;
        if (pct < 0.5) return null;
        return (
          <div
            key={s.id}
            title={`${s.name} · ${formatKg(s.weight)} (${pct.toFixed(0)}%)`}
            style={{ width: `${pct}%`, backgroundColor: s.color }}
            className="transition-all hover:brightness-110"
          />
        );
      })}
    </div>
  );
};

// ============================================================================
// PAGE
// ============================================================================
export default function PackBuilderPage() {
  // État du pack : Map(itemId -> meta). Init avec un sac pré-rempli réaliste.
  const [packMeta, setPackMeta] = useState<Map<string, PackItemMeta>>(() => {
    const m = new Map<string, PackItemMeta>();
    // 1) Essentiels possédés (max 8)
    const essentials = GEAR_ITEMS.filter((i) => i.essential && i.owned).slice(0, 8);
    // 2) Au moins 1 item par catégorie possédée (diversité)
    const categoriesSeen = new Set<string>();
    essentials.forEach((i) => categoriesSeen.add(i.category));
    const extra = GEAR_ITEMS.filter((i) => i.owned && !categoriesSeen.has(i.category))
      .slice(0, 6);

    [...essentials, ...extra].forEach((i) => {
      const isWorn = i.category === "footwear" || i.category === "clothing";
      const isConsumable =
        (i.category === "cooking" && /repas|lyophil|sem|œuf/i.test(i.name)) ||
        (i.category === "water" && /flask|gourde/i.test(i.name) === false && false);
      m.set(i.id, {
        qty: 1,
        worn: isWorn,
        consumable: isConsumable,
      });
    });
    return m;
  });


  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  const [packName, setPackName] = useState("GR20 — Nord → Sud");
  const [editingName, setEditingName] = useState(false);
  const [listName, setListName] = useState("Ma liste principale");

  // Dérivation des items du pack
  const packItems: PackItem[] = useMemo(() => {
    const result: PackItem[] = [];
    for (const [id, meta] of packMeta.entries()) {
      const gear = GEAR_ITEMS.find((g) => g.id === id);
      if (gear) result.push({ ...gear, ...meta });
    }
    return result;
  }, [packMeta]);

  // Items groupés par catégorie
  const grouped = useMemo(() => {
    const groups = new Map<string, PackItem[]>();
    for (const item of packItems) {
      if (!groups.has(item.category)) groups.set(item.category, []);
      groups.get(item.category)!.push(item);
    }
    return groups;
  }, [packItems]);

  // Calcul des poids
  const stats = useMemo(() => {
    let base = 0;
    let worn = 0;
    let consumable = 0;
    let total = 0;
    let totalPrice = 0;
    for (const it of packItems) {
      const w = it.weight * it.qty;
      total += w;
      totalPrice += (it.price || 0) * it.qty;
      if (it.worn) worn += w;
      else if (it.consumable) consumable += w;
      else base += w;
    }
    return { base, worn, consumable, total, totalPrice, count: packItems.reduce((s, i) => s + i.qty, 0) };
  }, [packItems]);

  // Segments pour la barre de répartition (par catégorie, hors worn)
  const categorySegments = useMemo(() => {
    const segs: { id: string; name: string; weight: number; color: string }[] = [];
    for (const cat of GEAR_CATEGORIES) {
      const items = packItems.filter((i) => i.category === cat.id && !i.worn);
      if (items.length === 0) continue;
      const weight = items.reduce((s, i) => s + i.weight * i.qty, 0);
      segs.push({
        id: cat.id,
        name: cat.name,
        weight,
        color: CATEGORY_COLORS[cat.id] || "#64748b",
      });
    }
    return segs.sort((a, b) => b.weight - a.weight);
  }, [packItems]);

  const carriedTotal = stats.base + stats.consumable; // ce qui est dans le sac

  // Actions
  const addItem = (item: GearItem) => {
    setPackMeta((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      if (existing) {
        next.set(item.id, { ...existing, qty: existing.qty + 1 });
      } else {
        next.set(item.id, {
          qty: 1,
          worn: item.category === "footwear" || item.category === "clothing",
          consumable: item.category === "cooking" && item.name.toLowerCase().includes("repas"),
        });
      }
      return next;
    });
  };

  const removeItem = (id: string) => {
    setPackMeta((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const updateMeta = (id: string, patch: Partial<PackItemMeta>) => {
    setPackMeta((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) next.set(id, { ...existing, ...patch });
      return next;
    });
  };

  const toggleCategory = (catId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  // Catalogue filtré (items PAS encore dans le pack)
  const catalogItems = useMemo(() => {
    return GEAR_ITEMS.filter((item) => {
      if (packMeta.has(item.id)) return false;
      if (catalogCategory !== "all" && item.category !== catalogCategory) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return item.name.toLowerCase().includes(q) || (item.brand || "").toLowerCase().includes(q);
      }
      return true;
    }).slice(0, 60);
  }, [packMeta, catalogCategory, searchTerm]);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-16 selection:bg-red-600/30">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6">

        {/* ============ HEADER ============ */}
        <header className="flex items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
                Projet Actif
              </span>
            </div>
            {editingName ? (
              <input
                autoFocus
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                className="text-4xl md:text-5xl font-black tracking-tight text-white bg-transparent border-b-2 border-red-600 outline-none"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="group flex items-center gap-3 text-left"
              >
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                  {packName}
                </h1>
                <Edit3 size={18} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              Composez votre sac, pesez chaque gramme, visualisez la répartition.
              Inspiré de <span className="text-white font-semibold">LighterPack</span>, intégré à votre garage Yeti.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="h-10 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-[#111] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors">
              <Share2 size={14} /> Partager
            </button>
            <button className="h-10 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-[#111] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors">
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => setCatalogOpen(true)}
              className="h-10 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-colors"
            >
              <Plus size={14} strokeWidth={3} /> Ajouter un item
            </button>
          </div>
        </header>

        {/* ============ STATS ROW ============ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Poids de base"
            value={formatKg(stats.base).replace(" kg", "")}
            unit="kg"
            hint="Sans consommables ni vêtements portés"
            color={THEME.red}
            icon={Backpack}
          />
          <StatCard
            label="Porté sur soi"
            value={formatKg(stats.worn).replace(" kg", "")}
            unit="kg"
            hint="Vêtements, chaussures, montre…"
            color="#FEC631"
            icon={Shirt}
          />
          <StatCard
            label="Consommables"
            value={formatKg(stats.consumable).replace(" kg", "")}
            unit="kg"
            hint="Nourriture, eau, gaz"
            color={THEME.cyan}
            icon={Apple}
          />
          <StatCard
            label="Poids total"
            value={formatKg(stats.total).replace(" kg", "")}
            unit="kg"
            hint={`${stats.count} items · ${stats.totalPrice.toFixed(0)} €`}
            color={THEME.emerald}
            icon={Weight}
          />
        </div>

        {/* ============ REPARTITION BAR ============ */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-white">Répartition dans le sac</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {formatKg(carriedTotal)} transportés — hors poids porté sur soi
              </div>
            </div>
            <div className="text-[11px] text-zinc-500">
              {categorySegments.length} catégories
            </div>
          </div>
          <CategoryBar segments={categorySegments} total={carriedTotal} />
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
            {categorySegments.map((s) => {
              const pct = carriedTotal > 0 ? (s.weight / carriedTotal) * 100 : 0;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-zinc-400">{s.name}</span>
                  <span className="text-xs font-semibold text-zinc-600">
                    {formatKg(s.weight)} · {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============ LIST HEADER ============ */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button className="text-xs font-bold text-white bg-[#111] border border-white/10 rounded-lg px-3 py-1.5">
              {listName}
            </button>
            <button className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
              <Plus size={12} /> Nouvelle liste
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                placeholder="Rechercher dans mon sac…"
                className="h-8 pl-8 pr-3 rounded-lg bg-[#111] border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
              />
            </div>
            <button className="h-8 w-8 rounded-lg bg-[#111] border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center">
              <SlidersHorizontal size={13} />
            </button>
          </div>
        </div>

        {/* ============ ITEMS LIST (groupé par catégorie) ============ */}
        <div className="space-y-3">
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[1fr_90px_70px_60px_60px_80px_40px] gap-3 px-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            <div>Item</div>
            <div className="text-right">Poids</div>
            <div className="text-center">Qté</div>
            <div className="text-center" title="Porté sur soi">
              <Shirt size={12} className="inline" />
            </div>
            <div className="text-center" title="Consommable">
              <Apple size={12} className="inline" />
            </div>
            <div className="text-right">Prix</div>
            <div />
          </div>

          {grouped.size === 0 && (
            <EmptyState onAdd={() => setCatalogOpen(true)} />
          )}

          {Array.from(grouped.entries()).map(([catId, items]) => {
            const cat = GEAR_CATEGORIES.find((c) => c.id === catId);
            const isCollapsed = collapsed.has(catId);
            const catWeight = items.reduce((s, i) => s + i.weight * i.qty, 0);
            const catColor = CATEGORY_COLORS[catId] || "#64748b";
            return (
              <div
                key={catId}
                className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden"
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(catId)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight size={14} className="text-zinc-500" />
                    ) : (
                      <ChevronDown size={14} className="text-zinc-500" />
                    )}
                    <span className="text-lg">{CATEGORY_ICONS[catId] || "📦"}</span>
                    <span className="text-sm font-bold text-white">{cat?.name || catId}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{ backgroundColor: `${catColor}20`, color: catColor }}
                    >
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500">
                      Total : <span className="font-bold text-white">{formatKg(catWeight)}</span>
                    </span>
                  </div>
                </button>

                {/* Items */}
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
                        {items.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            onRemove={() => removeItem(item.id)}
                            onQty={(q) => updateMeta(item.id, { qty: Math.max(1, q) })}
                            onWorn={(v) => updateMeta(item.id, { worn: v, consumable: v ? false : item.consumable })}
                            onConsumable={(v) =>
                              updateMeta(item.id, { consumable: v, worn: v ? false : item.worn })
                            }
                            categoryColor={catColor}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ============ FOOTER TOTALS ============ */}
        {packItems.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#111] to-[#0a0a0a] p-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <FooterStat label="Items" value={stats.count.toString()} />
              <FooterStat label="Poids de base" value={formatKg(stats.base)} />
              <FooterStat label="Sac chargé" value={formatKg(carriedTotal)} highlight />
              <FooterStat label="Porté" value={formatKg(stats.worn)} />
              <FooterStat label="Prix total" value={`${stats.totalPrice.toFixed(0)} €`} />
            </div>
          </div>
        )}
      </div>

      {/* ============ CATALOG MODAL ============ */}
      <AnimatePresence>
        {catalogOpen && (
          <CatalogModal
            onClose={() => setCatalogOpen(false)}
            items={catalogItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            category={catalogCategory}
            setCategory={setCatalogCategory}
            onAdd={(item) => {
              addItem(item);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// COMPOSANTS INTERNES
// ============================================================================

const FooterStat = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">
      {label}
    </div>
    <div
      className={cn(
        "text-xl font-black tracking-tight",
        highlight ? "text-[#f21e2c]" : "text-white"
      )}
    >
      {value}
    </div>
  </div>
);

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="rounded-2xl border-2 border-dashed border-white/10 py-16 flex flex-col items-center justify-center text-center">
    <Backpack size={40} className="text-zinc-700 mb-4" />
    <div className="text-white font-bold mb-1">Votre sac est vide</div>
    <div className="text-sm text-zinc-500 mb-5 max-w-xs">
      Ajoutez votre premier équipement depuis votre Garage pour commencer.
    </div>
    <button
      onClick={onAdd}
      className="h-10 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold flex items-center gap-2 transition-colors"
    >
      <Plus size={14} strokeWidth={3} /> Ajouter un item
    </button>
  </div>
);

const ItemRow = ({
  item,
  onRemove,
  onQty,
  onWorn,
  onConsumable,
  categoryColor,
}: {
  item: PackItem;
  onRemove: () => void;
  onQty: (q: number) => void;
  onWorn: (v: boolean) => void;
  onConsumable: (v: boolean) => void;
  categoryColor: string;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalWeight = item.weight * item.qty;

  return (
    <div className="group grid grid-cols-[1fr_90px_70px_60px_60px_80px_40px] gap-3 items-center px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors">
      {/* Item info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-white/5 flex items-center justify-center overflow-hidden shrink-0"
          style={{ borderLeftColor: categoryColor, borderLeftWidth: 2 }}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Package size={16} className="text-zinc-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate capitalize">
              {item.name.replace(/_/g, " ")}
            </span>
            {item.essential && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                Essentiel
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
            {item.brand && <span className="font-semibold text-zinc-400">{item.brand}</span>}
            {item.brand && <span>·</span>}
            <span>{formatG(item.weight)} / unité</span>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="text-right">
        <div className="text-sm font-bold text-white tabular-nums">
          {formatG(totalWeight)}
        </div>
        {item.qty > 1 && (
          <div className="text-[10px] text-zinc-600">
            ({formatG(item.weight)} × {item.qty})
          </div>
        )}
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => onQty(item.qty - 1)}
            disabled={item.qty <= 1}
            className="w-6 h-7 text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
          >
            −
          </button>
          <span className="w-6 text-center text-xs font-bold text-white">{item.qty}</span>
          <button
            onClick={() => onQty(item.qty + 1)}
            className="w-6 h-7 text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Worn */}
      <div className="flex justify-center">
        <CheckToggle
          checked={item.worn}
          onToggle={() => onWorn(!item.worn)}
          activeColor="#FEC631"
          title="Porté sur soi (ne compte pas dans le poids du sac)"
        />
      </div>

      {/* Consumable */}
      <div className="flex justify-center">
        <CheckToggle
          checked={item.consumable}
          onToggle={() => onConsumable(!item.consumable)}
          activeColor="#06b6d4"
          title="Consommable (nourriture, eau, gaz)"
        />
      </div>

      {/* Price */}
      <div className="text-right">
        {item.price ? (
          <span className="text-xs font-semibold text-zinc-400 tabular-nums">
            {item.price} €
          </span>
        ) : (
          <span className="text-xs text-zinc-700">—</span>
        )}
      </div>

      {/* Actions */}
      <div className="relative flex justify-end">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-9 z-50 w-40 rounded-lg border border-white/10 bg-[#1a1a1a] shadow-2xl overflow-hidden">
              <button
                onClick={() => {
                  onRemove();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={12} /> Retirer du sac
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CheckToggle = ({
  checked,
  onToggle,
  activeColor,
  title,
}: {
  checked: boolean;
  onToggle: () => void;
  activeColor: string;
  title: string;
}) => (
  <button
    onClick={onToggle}
    title={title}
    className={cn(
      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
      checked
        ? "border-transparent"
        : "border-zinc-700 hover:border-zinc-500 bg-transparent"
    )}
    style={{
      backgroundColor: checked ? activeColor : "transparent",
    }}
  >
    {checked && <Check size={12} className="text-black" strokeWidth={3} />}
  </button>
);

// ============================================================================
// CATALOG MODAL
// ============================================================================
const CatalogModal = ({
  onClose,
  items,
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  onAdd,
}: {
  onClose: () => void;
  items: GearItem[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  onAdd: (item: GearItem) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[85vh] rounded-3xl border border-white/10 bg-[#0d0d0d] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Ajouter un item</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Choisissez parmi votre garage — {items.length} items disponibles
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-5 border-b border-white/[0.06] space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              autoFocus
              placeholder="Rechercher par nom ou marque…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600/50"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                category === "all"
                  ? "bg-white text-black"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
            >
              Toutes
            </button>
            {GEAR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  category === cat.id
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                )}
              >
                <span>{CATEGORY_ICONS[cat.id]}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">
              Aucun item ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onAdd(item)}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[#131313] hover:bg-[#1a1a1a] border border-white/5 hover:border-red-600/30 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Package size={18} className="text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate capitalize">
                      {item.name.replace(/_/g, " ")}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {item.brand} · {formatG(item.weight)}
                      {item.price ? ` · ${item.price} €` : ""}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-600 text-zinc-500 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus size={14} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
