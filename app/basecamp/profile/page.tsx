// app/basecamp/profile/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useYetiStore, AVAILABLE_PACKS, type SelectedPack } from "@/lib/store/useYetiStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Ruler, Weight, Activity, Mountain, Backpack, Check,
  Info, TrendingUp, Settings, Heart, Award, ChevronRight,
  Camera, Edit3, RotateCw, Save, Target, Zap, Footprints,
} from "lucide-react";

// ============================================================================
// TYPES & DATA
// ============================================================================
interface UserProfile {
  firstName: string;
  lastName: string;
  level: "Débutant" | "Intermédiaire" | "Confirmé" | "Expert";
  gender: "M" | "F";
  // Mensurations
  height: number;      // cm
  weight: number;      // kg
  torsoLength: number; // cm (C7 -> crête iliaque) — CLÉ pour la taille du sac !
  hipCircumference: number; // cm
  shoulderWidth: number; // cm
  shoeSize: number;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: "Marco",
  lastName: "N.",
  level: "Confirmé",
  gender: "M",
  height: 178,
  weight: 75,
  torsoLength: 48,
  hipCircumference: 88,
  shoulderWidth: 45,
  shoeSize: 43,
};

const THEME = {
  red: "#f21e2c",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
};

// Taille du sac recommandée selon la longueur du torse (standard Osprey/Deuter)
const TORSO_TO_PACK_SIZE = (torso: number): "XS" | "S" | "M" | "L" | "XL" => {
  if (torso < 40) return "XS";
  if (torso < 45) return "S";
  if (torso < 50) return "M";
  if (torso < 55) return "L";
  return "XL";
};

// Poids max recommandé (20-25% du poids du corps selon Decathlon)
const MAX_RECOMMENDED_WEIGHT = (bodyWeight: number) => Math.round(bodyWeight * 0.22);

// ============================================================================
// PAGE
// ============================================================================
export default function ProfilePage() {
  const { selectedPackId, selectPack, getTotalWeight, getSelectedPack } = useYetiStore();

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [packRotation, setPackRotation] = useState<"back" | "side">("back");

  // Persist profile to localStorage
  useEffect(() => {
    const stored = localStorage.getItem("yeti-profile");
    if (stored) {
      try { setProfile(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("yeti-profile", JSON.stringify(profile));
  }, [profile]);

  const selectedPack = getSelectedPack();
  const packContentWeight = getTotalWeight() / 1000; // kg
  const totalPackWeight = packContentWeight + selectedPack.weight / 1000;
  const maxWeight = MAX_RECOMMENDED_WEIGHT(profile.weight);
  const packSize = TORSO_TO_PACK_SIZE(profile.torsoLength);

  // Score de fit entre l'utilisateur et le sac
  const fitScore = useMemo(() => {
    let score = 100;
    // Poids : -5 par kg au-dessus du recommandé
    if (totalPackWeight > maxWeight) {
      score -= Math.min(40, (totalPackWeight - maxWeight) * 5);
    }
    // Volume utile par rapport à la taille
    if (selectedPack.capacity < 30 && profile.height > 180) score -= 10;
    return Math.max(0, Math.round(score));
  }, [totalPackWeight, maxWeight, selectedPack, profile]);

  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-16 selection:bg-red-600/30">
      <div className="max-w-[1500px] mx-auto px-6 md:px-8 py-6">

        {/* ============ HEADER ============ */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-500">
              Fiche athlète · Biométrie & Ajustement
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                <User className="text-[#f21e2c]" size={42} strokeWidth={1.5} />
                Mon profil
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                Entrez vos mensurations pour obtenir une recommandation de sac optimale et
                visualiser en direct son ajustement sur votre silhouette.
              </p>
            </div>

            <button
              onClick={() => setEditMode(!editMode)}
              className={cn(
                "h-11 px-5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors",
                editMode
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              )}
            >
              {editMode ? <><Save size={16} /> Enregistrer</> : <><Edit3 size={16} /> Modifier</>}
            </button>
          </div>
        </header>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* =================== COLUMN LEFT : IDENTITÉ + MENSURATIONS =================== */}
          <div className="lg:col-span-4 space-y-5">

            {/* IDENTITY CARD */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.08] bg-[#111] overflow-hidden"
            >
              {/* Hero banner */}
              <div className="h-24 relative bg-gradient-to-br from-[#f21e2c]/20 via-[#F9591F]/10 to-[#0a0a0a]">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 40%, ${THEME.red}40 0%, transparent 50%)`,
                  }}
                />
              </div>

              {/* Avatar circle */}
              <div className="-mt-12 px-5">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#f21e2c] to-[#B21D3B] border-4 border-[#111] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-[#f21e2c]/20">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </div>
              </div>

              <div className="p-5 pt-3">
                <h2 className="text-xl font-black text-white">
                  {profile.firstName} {profile.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="px-2 py-0.5 rounded bg-[#f21e2c]/20 border border-[#f21e2c]/30 text-[#f21e2c] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Award size={9} /> Pro
                  </div>
                  <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Activity size={9} /> {profile.level}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                  <QuickStat value={`${profile.height}`} unit="cm" label="Taille" />
                  <QuickStat value={`${profile.weight}`} unit="kg" label="Poids" />
                  <QuickStat value={profile.shoeSize.toString()} unit="EU" label="Pointure" />
                </div>
              </div>
            </motion.section>

            {/* MENSURATIONS */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-white/[0.08] bg-[#111] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Ruler size={14} className="text-[#f21e2c]" /> Mensurations
                </h3>
                <Info size={12} className="text-zinc-600" />
              </div>

              <div className="space-y-3">
                <MeasurementRow
                  label="Taille"
                  value={profile.height}
                  unit="cm"
                  min={140}
                  max={220}
                  editMode={editMode}
                  icon={Ruler}
                  color={THEME.cyan}
                  onChange={(v) => setProfile({ ...profile, height: v })}
                />
                <MeasurementRow
                  label="Poids"
                  value={profile.weight}
                  unit="kg"
                  min={40}
                  max={150}
                  editMode={editMode}
                  icon={Weight}
                  color={THEME.orange}
                  onChange={(v) => setProfile({ ...profile, weight: v })}
                />
                <MeasurementRow
                  label="Torse (C7 → crête)"
                  value={profile.torsoLength}
                  unit="cm"
                  min={35}
                  max={60}
                  editMode={editMode}
                  icon={Target}
                  color={THEME.red}
                  highlight
                  onChange={(v) => setProfile({ ...profile, torsoLength: v })}
                />
                <MeasurementRow
                  label="Tour de hanches"
                  value={profile.hipCircumference}
                  unit="cm"
                  min={60}
                  max={140}
                  editMode={editMode}
                  icon={Target}
                  color={THEME.violet}
                  onChange={(v) => setProfile({ ...profile, hipCircumference: v })}
                />
                <MeasurementRow
                  label="Largeur épaules"
                  value={profile.shoulderWidth}
                  unit="cm"
                  min={30}
                  max={60}
                  editMode={editMode}
                  icon={Target}
                  color={THEME.yellow}
                  onChange={(v) => setProfile({ ...profile, shoulderWidth: v })}
                />
                <MeasurementRow
                  label="Pointure"
                  value={profile.shoeSize}
                  unit="EU"
                  min={35}
                  max={50}
                  editMode={editMode}
                  icon={Footprints}
                  color={THEME.emerald}
                  onChange={(v) => setProfile({ ...profile, shoeSize: v })}
                />
              </div>

              {/* Recommandation */}
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="rounded-xl bg-gradient-to-br from-[#f21e2c]/10 to-[#F9591F]/5 border border-[#f21e2c]/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={12} className="text-[#f21e2c]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#f21e2c]">
                      Taille de sac recommandée
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    Taille {packSize}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Basé sur torse {profile.torsoLength}cm · charge max {maxWeight}kg
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* =================== COLUMN CENTER : AVATAR SVG =================== */}
          <div className="lg:col-span-5">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden sticky top-6"
            >
              {/* Top bar */}
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Camera size={14} className="text-cyan-400" /> Essayage virtuel
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Visualisation 1:1 de votre silhouette avec le sac sélectionné
                  </p>
                </div>
                <button
                  onClick={() => setPackRotation(packRotation === "back" ? "side" : "back")}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                  title="Changer de vue"
                >
                  <RotateCw size={14} />
                </button>
              </div>

              {/* SVG Avatar viewport */}
              <div className="relative h-[560px] overflow-hidden bg-gradient-to-b from-[#0d0d0d] via-[#080808] to-[#000000]">
                {/* Grid floor */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "24px 24px",
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 70%, black 100%)",
                  }}
                />

                {/* Floor glow */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[60px] rounded-full opacity-60 blur-2xl"
                  style={{ background: selectedPack.id.includes("renn") ? THEME.red : selectedPack.id.includes("talon") ? THEME.emerald : THEME.cyan }}
                />

                {/* Height ruler */}
                <HeightRuler height={profile.height} />

                {/* AVATAR SVG */}
                <div className="absolute inset-0 flex items-end justify-center pb-8">
                  <AvatarSVG
                    profile={profile}
                    pack={selectedPack}
                    view={packRotation}
                  />
                </div>

                {/* Labels flottants (mesures indiquées sur l'avatar) */}
                <FloatingLabel top="18%" right="12%" label="Torse" value={`${profile.torsoLength}cm`} color={THEME.red} />
                <FloatingLabel top="38%" right="8%" label="Épaules" value={`${profile.shoulderWidth}cm`} color={THEME.yellow} />
                <FloatingLabel bottom="32%" right="10%" label="Hanches" value={`${profile.hipCircumference}cm`} color={THEME.violet} />
                <FloatingLabel top="50%" left="8%" label="Sac" value={`${selectedPack.capacity}L · ${packSize}`} color={THEME.cyan} side="left" />
              </div>

              {/* Bottom: fit score */}
              <div className="p-4 border-t border-white/[0.06] bg-black/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Heart size={10} className="text-[#f21e2c]" />
                    Score d&apos;ajustement
                  </span>
                  <span
                    className="text-lg font-black tabular-nums"
                    style={{
                      color: fitScore > 75 ? THEME.emerald : fitScore > 50 ? THEME.yellow : THEME.red,
                    }}
                  >
                    {fitScore}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fitScore}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        fitScore > 75
                          ? `linear-gradient(90deg, ${THEME.emerald}, ${THEME.cyan})`
                          : fitScore > 50
                          ? `linear-gradient(90deg, ${THEME.yellow}, ${THEME.orange})`
                          : `linear-gradient(90deg, ${THEME.red}, ${THEME.orange})`,
                    }}
                  />
                </div>
              </div>
            </motion.section>
          </div>

          {/* =================== COLUMN RIGHT : SÉLECTEUR DE SACS =================== */}
          <div className="lg:col-span-3 space-y-5">

            {/* PACK SELECTOR */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/[0.08] bg-[#111] p-4"
            >
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <Backpack size={14} className="text-[#f21e2c]" /> Mon sac
              </h3>

              <div className="space-y-2.5">
                {AVAILABLE_PACKS.map((pack) => (
                  <PackOption
                    key={pack.id}
                    pack={pack}
                    isSelected={pack.id === selectedPackId}
                    recommended={packSize === "M" && pack.id === "osprey-talon-vert"}
                    onSelect={() => selectPack(pack.id)}
                  />
                ))}
              </div>
            </motion.section>

            {/* LOAD STATS */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/[0.08] bg-[#111] p-4"
            >
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-[#f21e2c]" /> Analyse de charge
              </h3>

              <div className="space-y-3">
                <LoadBar
                  label="Sac (vide)"
                  value={selectedPack.weight / 1000}
                  max={3}
                  unit="kg"
                  color={THEME.cyan}
                />
                <LoadBar
                  label="Contenu"
                  value={packContentWeight}
                  max={maxWeight}
                  unit="kg"
                  color={THEME.yellow}
                />
                <LoadBar
                  label="Total porté"
                  value={totalPackWeight}
                  max={maxWeight}
                  unit="kg"
                  color={totalPackWeight > maxWeight ? THEME.red : THEME.emerald}
                  highlight
                />

                <div className="pt-3 mt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Charge corporelle
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                      {Math.round((totalPackWeight / profile.weight) * 100)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 leading-relaxed">
                    Recommandation Decathlon : <strong className="text-zinc-300">max 20-25%</strong> du poids du corps pour éviter les douleurs.
                  </div>
                </div>
              </div>
            </motion.section>

            {/* PREP STATS */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#f21e2c]/10 to-transparent p-4"
            >
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                <Mountain size={14} className="text-[#f21e2c]" /> Prochaine mission
              </h3>
              <div className="text-lg font-black text-white">GR20 Nord → Sud</div>
              <div className="text-xs text-zinc-400 mt-1">J-58 · 16 jours · 180 km</div>
              <button className="mt-3 w-full h-9 rounded-lg bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                Voir la préparation <ChevronRight size={12} />
              </button>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AVATAR SVG (silhouette humaine avec sac à dos superposé)
// ============================================================================
function AvatarSVG({
  profile,
  pack,
  view,
}: {
  profile: UserProfile;
  pack: SelectedPack;
  view: "back" | "side";
}) {
  // Couleur du sac selon l'id
  const packColor =
    pack.id.includes("renn") ? "#f21e2c" :
    pack.id.includes("talon") ? "#10b981" :
    "#3b82f6";

  // Scale vertical basé sur la taille (178cm = scale 1)
  const scale = profile.height / 178;
  // Largeur basée sur le poids (75kg = scale 1)
  const widthScale = 0.85 + (profile.weight - 50) / 200;
  // Capacité du sac (33L = small, 58L = large)
  const packScale = 0.8 + (pack.capacity - 30) / 80;

  return (
    <motion.svg
      key={view}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      viewBox="0 0 300 500"
      width="280"
      height="500"
      style={{
        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
        transform: `scaleY(${scale}) scaleX(${widthScale})`,
        transformOrigin: "bottom center",
      }}
    >
      <defs>
        <linearGradient id="body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="pack-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={packColor} stopOpacity="1" />
          <stop offset="100%" stopColor={packColor} stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="pack-highlight" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {view === "back" ? (
        <>
          {/* Shadow under feet */}
          <ellipse cx="150" cy="488" rx="60" ry="5" fill="#000" opacity="0.6" />

          {/* Legs */}
          <rect x="125" y="300" width="20" height="180" rx="8" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1" />
          <rect x="155" y="300" width="20" height="180" rx="8" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1" />

          {/* Shoes */}
          <ellipse cx="135" cy="485" rx="15" ry="6" fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1" />
          <ellipse cx="165" cy="485" rx="15" ry="6" fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1" />

          {/* Hips */}
          <path d="M 115 280 Q 150 270 185 280 L 180 310 Q 150 318 120 310 Z" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1" />

          {/* Torso (back view — wide at top, narrow at hips) */}
          <path
            d="M 110 140
               Q 108 160 112 200
               L 118 280
               L 182 280
               L 188 200
               Q 192 160 190 140
               Z"
            fill="url(#body-grad)"
            stroke="#3a3a3a"
            strokeWidth="1"
          />

          {/* Arms */}
          <rect x="88" y="145" width="22" height="130" rx="10" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1" />
          <rect x="190" y="145" width="22" height="130" rx="10" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1" />

          {/* Hands */}
          <circle cx="99" cy="285" r="11" fill="#2a2a2a" />
          <circle cx="201" cy="285" r="11" fill="#2a2a2a" />

          {/* Shoulders */}
          <path d="M 95 140 Q 150 125 205 140 L 200 155 Q 150 140 100 155 Z" fill="#2d2d2d" stroke="#3a3a3a" strokeWidth="1" />

          {/* Neck */}
          <rect x="140" y="105" width="20" height="25" fill="url(#body-grad)" />

          {/* Head */}
          <circle cx="150" cy="85" r="28" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1.5" />
          {/* Hair (back) */}
          <path d="M 124 80 Q 125 60 150 55 Q 175 60 176 80 Q 176 75 150 68 Q 124 75 124 80 Z" fill="#0a0a0a" />

          {/* ============ BACKPACK ============ */}
          <g transform={`translate(150, 200) scale(${packScale}) translate(-150, -200)`}>
            {/* Main body of pack */}
            <motion.path
              initial={{ scaleY: 0.5, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              style={{ transformOrigin: "150px 280px" }}
              d="M 115 150
                 Q 110 145 112 165
                 L 108 270
                 Q 107 290 120 295
                 L 180 295
                 Q 193 290 192 270
                 L 188 165
                 Q 190 145 185 150
                 Z"
              fill="url(#pack-grad)"
              stroke={packColor}
              strokeWidth="1"
            />
            {/* Shine */}
            <path
              d="M 115 150 L 108 270 Q 107 290 120 295 L 145 295 L 145 150 Z"
              fill="url(#pack-highlight)"
            />
            {/* Top lid */}
            <path
              d="M 115 150 Q 150 140 185 150 L 183 175 Q 150 168 117 175 Z"
              fill={packColor}
              opacity="0.85"
              stroke={packColor}
              strokeWidth="1"
            />
            {/* Horizontal straps */}
            <rect x="110" y="200" width="80" height="3" fill="#000" opacity="0.4" />
            <rect x="110" y="235" width="80" height="3" fill="#000" opacity="0.4" />
            {/* Center stitching */}
            <line x1="150" y1="155" x2="150" y2="290" stroke={packColor} strokeWidth="1" opacity="0.5" />
            {/* Brand logo area */}
            <rect x="140" y="175" width="20" height="6" rx="2" fill="#fff" opacity="0.25" />
            {/* Side pocket */}
            <path
              d="M 108 210 Q 100 215 100 240 Q 100 260 108 265 Z"
              fill={packColor}
              opacity="0.6"
            />
            <path
              d="M 192 210 Q 200 215 200 240 Q 200 260 192 265 Z"
              fill={packColor}
              opacity="0.6"
            />
            {/* Compression straps visible from back */}
            <rect x="150" y="180" width="2" height="100" fill="#000" opacity="0.3" />
          </g>

          {/* Straps going over shoulders (visible from back) */}
          <path
            d="M 115 145 Q 105 170 108 200"
            stroke={packColor}
            strokeWidth="5"
            fill="none"
            opacity="0.9"
            strokeLinecap="round"
          />
          <path
            d="M 185 145 Q 195 170 192 200"
            stroke={packColor}
            strokeWidth="5"
            fill="none"
            opacity="0.9"
            strokeLinecap="round"
          />
          {/* Hip belt */}
          <rect x="105" y="275" width="90" height="8" rx="3" fill={packColor} opacity="0.85" />
        </>
      ) : (
        // ============ SIDE VIEW ============
        <>
          <ellipse cx="150" cy="488" rx="50" ry="5" fill="#000" opacity="0.6" />

          {/* Leg */}
          <rect x="135" y="300" width="24" height="180" rx="8" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1" />

          {/* Shoe */}
          <ellipse cx="150" cy="485" rx="24" ry="6" fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1" />

          {/* Hip */}
          <path d="M 125 280 Q 147 272 165 280 L 160 310 Q 140 316 128 310 Z" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1" />

          {/* Torso side view */}
          <path
            d="M 130 140
               Q 128 170 135 210
               L 140 280
               L 162 280
               L 168 210
               Q 172 170 170 140
               Z"
            fill="url(#body-grad)"
            stroke="#3a3a3a"
            strokeWidth="1"
          />

          {/* Arm */}
          <rect x="138" y="150" width="20" height="130" rx="8" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1" />
          <circle cx="148" cy="285" r="10" fill="#2a2a2a" />

          {/* Shoulder */}
          <path d="M 125 140 Q 150 128 175 140 L 172 155 Q 150 143 128 155 Z" fill="#2d2d2d" stroke="#3a3a3a" strokeWidth="1" />

          {/* Neck */}
          <rect x="145" y="105" width="15" height="25" fill="url(#body-grad)" />

          {/* Head (side profile) */}
          <ellipse cx="155" cy="85" rx="25" ry="28" fill="url(#body-grad)" stroke="#3a3a3a" strokeWidth="1.5" />
          {/* Nose */}
          <path d="M 180 85 Q 186 90 180 95" stroke="#3a3a3a" strokeWidth="1" fill="none" />
          {/* Hair */}
          <path d="M 130 80 Q 130 55 155 55 Q 180 55 180 80 L 178 75 Q 155 62 132 78 Z" fill="#0a0a0a" />

          {/* ============ BACKPACK (SIDE VIEW) ============ */}
          <g transform={`translate(115, 220) scale(${packScale}) translate(-115, -220)`}>
            <motion.path
              initial={{ scaleY: 0.5, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              style={{ transformOrigin: "115px 280px" }}
              d="M 85 155
                 Q 80 150 82 170
                 L 78 270
                 Q 77 290 90 295
                 L 135 295
                 L 138 160
                 Q 135 145 115 148
                 Q 95 145 85 155
                 Z"
              fill="url(#pack-grad)"
              stroke={packColor}
              strokeWidth="1"
            />
            <path
              d="M 85 155 L 78 270 Q 77 290 90 295 L 110 295 L 110 155 Z"
              fill="url(#pack-highlight)"
            />
            {/* Top curvature */}
            <path
              d="M 85 155 Q 115 140 138 160 L 135 180 Q 115 170 88 180 Z"
              fill={packColor}
              opacity="0.85"
            />
            {/* Compression straps */}
            <line x1="80" y1="190" x2="138" y2="190" stroke="#000" strokeWidth="2" opacity="0.4" />
            <line x1="80" y1="230" x2="138" y2="230" stroke="#000" strokeWidth="2" opacity="0.4" />
            <line x1="80" y1="265" x2="138" y2="265" stroke="#000" strokeWidth="2" opacity="0.4" />
            {/* Side pocket */}
            <path
              d="M 78 220 Q 70 225 70 255 Q 70 270 78 275 Z"
              fill={packColor}
              opacity="0.55"
            />
          </g>

          {/* Shoulder strap side */}
          <path
            d="M 135 150 Q 120 170 125 220"
            stroke={packColor}
            strokeWidth="5"
            fill="none"
            opacity="0.95"
            strokeLinecap="round"
          />
          {/* Hip belt */}
          <rect x="115" y="278" width="55" height="10" rx="3" fill={packColor} opacity="0.9" />
        </>
      )}
    </motion.svg>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const QuickStat = ({ value, unit, label }: { value: string; unit: string; label: string }) => (
  <div className="text-center">
    <div className="text-lg font-black text-white tabular-nums leading-none">
      {value}
      <span className="text-[10px] font-bold text-zinc-500 ml-0.5">{unit}</span>
    </div>
    <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-1">
      {label}
    </div>
  </div>
);

const MeasurementRow = ({
  label, value, unit, min, max, editMode, icon: Icon, color, highlight = false, onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  editMode: boolean;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  highlight?: boolean;
  onChange: (v: number) => void;
}) => (
  <div className={cn("group", highlight && "p-2.5 rounded-lg bg-[#f21e2c]/5 border border-[#f21e2c]/20 -mx-2")}>
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2">
        <Icon size={11} style={{ color }} />
        <span className="text-[11px] font-semibold text-zinc-300">{label}</span>
      </div>
      {editMode ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 h-7 px-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold text-right focus:outline-none focus:border-[#f21e2c]/50"
          />
          <span className="text-[10px] font-bold text-zinc-500 uppercase w-6">{unit}</span>
        </div>
      ) : (
        <span className="text-sm font-black text-white tabular-nums">
          {value}
          <span className="text-[10px] font-bold text-zinc-500 ml-0.5">{unit}</span>
        </span>
      )}
    </div>
    {!editMode && (
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((value - min) / (max - min)) * 100}%` }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    )}
  </div>
);

const PackOption = ({
  pack,
  isSelected,
  recommended,
  onSelect,
}: {
  pack: SelectedPack;
  isSelected: boolean;
  recommended?: boolean;
  onSelect: () => void;
}) => {
  const dotColor =
    pack.id.includes("renn") ? THEME.red :
    pack.id.includes("talon") ? THEME.emerald :
    "#3b82f6";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-3 rounded-xl border text-left transition-all relative",
        isSelected
          ? "bg-[#f21e2c]/10 border-[#f21e2c]/50"
          : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
      )}
    >
      {recommended && !isSelected && (
        <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider">
          ✓ Reco
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${dotColor}20`, border: `1px solid ${dotColor}30` }}
        >
          <Backpack size={18} style={{ color: dotColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-white truncate">{pack.name}</div>
          <div className="text-[10px] text-zinc-500 mb-1.5">{pack.brand}</div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="font-bold">{pack.capacity}L</span>
            <span className="text-zinc-600">·</span>
            <span>{(pack.weight / 1000).toFixed(1)}kg</span>
            <span className="text-zinc-600">·</span>
            <span>max {pack.maxLoad}kg</span>
          </div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#f21e2c] flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
};

const LoadBar = ({
  label, value, max, unit, color, highlight = false,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  highlight?: boolean;
}) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn(highlight && "p-2 rounded-lg bg-white/[0.03] border border-white/5")}>
      <div className="flex items-center justify-between mb-1">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider", highlight ? "text-white" : "text-zinc-400")}>
          {label}
        </span>
        <span className="text-[11px] font-black text-white tabular-nums">
          {value.toFixed(1)}
          <span className="text-[9px] text-zinc-500 ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
};

const FloatingLabel = ({
  label, value, color, top, bottom, left, right, side = "right",
}: {
  label: string;
  value: string;
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  side?: "left" | "right";
}) => (
  <motion.div
    initial={{ opacity: 0, x: side === "right" ? 10 : -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 }}
    className="absolute flex items-center gap-2 pointer-events-none"
    style={{ top, bottom, left, right }}
  >
    {side === "right" && (
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-px" style={{ background: `${color}60` }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    )}
    <div
      className="px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm border text-[9px] font-bold"
      style={{ borderColor: `${color}40`, color }}
    >
      <div className="uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-white text-[11px] tabular-nums">{value}</div>
    </div>
    {side === "left" && (
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <div className="w-6 h-px" style={{ background: `${color}60` }} />
      </div>
    )}
  </motion.div>
);

const HeightRuler = ({ height }: { height: number }) => {
  // Graduation de 140 à 200 cm tous les 10cm
  const marks = [140, 150, 160, 170, 180, 190, 200];
  const range = 60; // 140-200
  const start = 140;

  return (
    <div className="absolute left-3 top-4 bottom-8 w-10 pointer-events-none">
      <div className="relative h-full border-l-2 border-white/10">
        {marks.map((m) => {
          const pct = ((m - start) / range) * 100;
          const isUser = Math.abs(m - height) < 5;
          return (
            <div
              key={m}
              className="absolute flex items-center gap-1"
              style={{ bottom: `${pct}%`, left: 0 }}
            >
              <div
                className="h-px"
                style={{
                  width: isUser ? "20px" : "8px",
                  background: isUser ? THEME.cyan : "rgba(255,255,255,0.2)",
                }}
              />
              <span
                className={cn(
                  "text-[9px] font-bold tabular-nums",
                  isUser ? "text-cyan-400" : "text-white/30"
                )}
              >
                {m}
              </span>
            </div>
          );
        })}
        {/* User's height marker */}
        <div
          className="absolute left-0 flex items-center gap-1"
          style={{ bottom: `${((height - start) / range) * 100}%` }}
        >
          <div className="w-7 h-0.5 bg-cyan-400 rounded-full" style={{ boxShadow: `0 0 8px ${THEME.cyan}` }} />
          <span className="text-[10px] font-black text-cyan-400 tabular-nums bg-black/80 px-1.5 py-0.5 rounded">
            {height}
          </span>
        </div>
      </div>
    </div>
  );
};
