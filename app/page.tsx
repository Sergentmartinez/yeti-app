// app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mountain, ArrowRight, Check, Sparkles, Compass, Map as MapIcon,
  Backpack, CloudSun, Activity, Weight, Wallet, Wind, Route,
  ChevronRight, Boxes, Zap, Target, Flag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Network3DMesh } from "@/components/landing/Network3DMesh";

// ============================================================================
// DESIGN TOKENS — Alignés sur /basecamp/dashboard
// ============================================================================
const THEME = {
  bg: "bg-[#050505]",
  card: "bg-[#111111]",
  cardHover: "hover:bg-[#161616]",
  border: "border-white/[0.08]",
  orangeDeep: "#B21D3B",
  orange: "#F9591F",
  orangeLight: "#FF8C42",
  yellow: "#FEC631",
  emerald: "#10b981",
};

// Statistiques RÉELLES du produit (alignées avec le dashboard GR20)
const HERO_STATS = [
  { label: "Items trackés", value: "450k+", sub: "base catalogue" },
  { label: "Roadbooks générés", value: "12.4k", sub: "l'an dernier" },
  { label: "Dénivelé planifié", value: "2.8M", sub: "mètres cumulés" },
  { label: "Score Sherpa AI", value: "98%", sub: "fiabilité moyenne" },
];

// Mini-preview du Dashboard (même chiffres que /basecamp/dashboard)
const DASHBOARD_PREVIEW = {
  project: "GR20 NORD → SUD",
  daysLeft: 58,
  packWeight: "4.2",
  prep: 78,
  budget: 847,
  budgetLimit: 1200,
  weather: "12°",
  weatherCity: "Calenzana",
};

// 3 piliers du système (cohérents avec les sections du Basecamp)
const PILLARS = [
  {
    icon: Backpack,
    title: "Garage 3D",
    desc: "Inventoriez votre matériel avec poids, volume et catégories. Visualisation knolling Three.js.",
    link: "/basecamp/garage",
    stat: "32 items · 12.3 kg",
  },
  {
    icon: MapIcon,
    title: "Routes & GPX",
    desc: "Importez vos tracés, analysez le dénivelé par étape et détectez les points critiques.",
    link: "/basecamp/routes",
    stat: "180 km · 11 km D+",
  },
  {
    icon: Sparkles,
    title: "Sherpa AI",
    desc: "Corrélations météo × matériel × terrain. Alertes proactives et optimisations concrètes.",
    link: "/basecamp/sherpa",
    stat: "Score 98/100",
  },
];

const WORKFLOW_STEPS = [
  { num: "01", title: "Définissez votre projet", desc: "Itinéraire, dates, niveau. YETI crée votre timeline de préparation." },
  { num: "02", title: "Garnissez le Garage", desc: "Ajoutez votre matériel. Poids, volume et compatibilités calculés en temps réel." },
  { num: "03", title: "Générez le roadbook", desc: "Sherpa AI croise météo, terrain et charge. Export PDF/GPX prêt à l'emploi." },
];

// ============================================================================
// COMPOSANT
// ============================================================================
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased font-sans selection:bg-[#F9591F]/30">

      {/* ========== NAV FLOTTANTE ========== */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-[#111111]/80 backdrop-blur-xl border border-white/10 flex items-center gap-8 shadow-2xl">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
            style={{ backgroundColor: THEME.orange, boxShadow: `0 0 20px ${THEME.orange}40` }}
          >
            <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black tracking-tighter uppercase">
            Yeti <span style={{ color: THEME.orange }}>Expédition</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#concept" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Concept</a>
          <a href="#product" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Produit</a>
          <a href="#workflow" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Workflow</a>
          <Link href="/pricing" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Tarifs</Link>
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <Link
          href="/basecamp"
          className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-white transition-all hover:scale-105"
          style={{ backgroundColor: THEME.orangeDeep }}
        >
          Launch App
        </Link>
      </nav>

      {/* ========== HERO — Image montagne en fond ========== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Photo de montagne plein écran */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop"
            alt="Montagne"
            fill
            priority
            className="object-cover"
          />
          {/* Gradient sombre pour lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/55 to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-sm"
              style={{
                backgroundColor: `${THEME.orange}10`,
                borderColor: `${THEME.orange}30`,
              }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: THEME.orange }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: THEME.orange }}>
                Système de Planification v4.0
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] block">20h de recherche.</span>
              <span
                className="block drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
                style={{
                  WebkitTextStroke: `1.5px ${THEME.orange}`,
                  color: "transparent",
                }}
              >
                Ou 30 minutes
              </span>
              <span
                className="block drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
                style={{ color: THEME.orange, textShadow: `0 0 40px ${THEME.orange}60, 0 4px 20px rgba(0,0,0,0.8)` }}
              >
                avec YETI.
              </span>
            </h1>

            <p className="text-base md:text-lg text-zinc-200 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              L&apos;IA <strong className="text-white">Sherpa</strong> croise votre équipement, la météo et le terrain
              pour générer un roadbook millimétré.{" "}
              <span className="text-white">Ne partez plus au hasard.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/basecamp"
                className="group h-14 px-8 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] text-white transition-all hover:scale-105 shadow-2xl"
                style={{ backgroundColor: THEME.orangeDeep, boxShadow: `0 12px 40px ${THEME.orangeDeep}80` }}
              >
                Démarrer l&apos;Expédition
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="h-14 px-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center hover:bg-white/15 transition-all"
              >
                Voir les tarifs
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 animate-bounce z-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-300 font-black">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-zinc-300 to-transparent" />
        </div>
      </section>

      {/* ========== DASHBOARD LIVE PREVIEW (section dédiée) ========== */}
      <section className="relative py-24 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <Image src="/images/landing/pattern_orange_2.jpg" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.orange }}>
              Mission Control Live
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-[0.9]">
              Votre expédition,<br />
              <span style={{ color: THEME.orange }}>en un coup d&apos;œil.</span>
            </h2>
            <p className="mt-5 text-sm text-zinc-400 font-medium max-w-xl mx-auto">
              Un dashboard qui agrège tout : préparation, poids, budget, météo et timeline. Sherpa AI met en lumière ce qui compte.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute -inset-6 rounded-[32px] opacity-20 blur-3xl" style={{ backgroundColor: THEME.orange }} />
            <div className="relative rounded-[24px] bg-[#111111] border border-white/10 p-6 shadow-2xl overflow-hidden">
              {/* Header preview */}
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Preview Live · Données Dashboard</span>
                  </div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">{DASHBOARD_PREVIEW.project}</div>
                </div>
                <Link
                  href="/basecamp/dashboard"
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors group"
                >
                  Ouvrir le Dashboard <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Grid KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {/* Préparation */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Préparation</span>
                    <Activity size={13} className="text-zinc-700" />
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-5xl font-black tracking-tighter" style={{ color: THEME.orangeDeep }}>
                      {DASHBOARD_PREVIEW.prep}
                    </span>
                    <span className="text-lg font-black text-zinc-600">%</span>
                  </div>
                </div>
                {/* Poids sac */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Poids Sac</span>
                    <Weight size={13} style={{ color: THEME.orange }} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter" style={{ color: THEME.orange }}>
                      {DASHBOARD_PREVIEW.packWeight}
                    </span>
                    <span className="text-xs font-black text-zinc-500">KG</span>
                  </div>
                </div>
                {/* Budget */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Budget</span>
                    <Wallet size={13} style={{ color: THEME.orange }} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter" style={{ color: THEME.orange }}>
                      {DASHBOARD_PREVIEW.budget}
                    </span>
                    <span className="text-xs font-black text-zinc-500">€</span>
                  </div>
                  <div className="mt-2 h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(DASHBOARD_PREVIEW.budget / DASHBOARD_PREVIEW.budgetLimit) * 100}%`,
                        backgroundColor: THEME.orange,
                      }}
                    />
                  </div>
                </div>
                {/* Météo */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Météo</span>
                    <CloudSun size={13} style={{ color: THEME.orange }} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter" style={{ color: THEME.orange }}>
                      {DASHBOARD_PREVIEW.weather}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{DASHBOARD_PREVIEW.weatherCity}</div>
                </div>
              </div>

              {/* Compteur J-XX */}
              <div
                className="rounded-xl p-5 border border-white/5"
                style={{ background: `linear-gradient(135deg, ${THEME.orangeDeep}18, transparent)` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Timeline Mission</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter" style={{ color: THEME.orangeDeep }}>
                        J-{DASHBOARD_PREVIEW.daysLeft}
                      </span>
                      <span className="text-xs font-black text-zinc-500 ml-3">avant départ</span>
                    </div>
                  </div>
                  <Flag className="w-10 h-10" style={{ color: THEME.orangeDeep }} strokeWidth={2} />
                </div>
                <div className="flex gap-1 mt-3">
                  <div className="flex-1 h-1 bg-emerald-500 rounded-full" />
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full" />
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full" />
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full" />
                </div>
                <div className="flex justify-between text-[8px] font-black text-zinc-600 mt-1.5 uppercase tracking-wider">
                  <span className="text-emerald-500">Planification</span>
                  <span>Matériel</span>
                  <span>Ravitaillement</span>
                  <span>Départ</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== STATS BAND ========== */}
      <section className="relative py-20 border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/landing/pattern_orange.jpg" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {HERO_STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-[#111111] border border-white/[0.08] p-6 text-center"
            >
              <div className="text-4xl md:text-5xl font-black tracking-tighter mb-2" style={{ color: THEME.orange }}>
                {s.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-1">{s.label}</div>
              <div className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== CONCEPT ========== */}
      <section id="concept" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: THEME.orange }}>
              Le Problème Analogique
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
              Le matos ne suffit plus.<br />
              <span className="text-zinc-600">Il faut de l&apos;intelligence.</span>
            </h2>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed font-medium">
              Planifier un trek, c&apos;est 10 onglets ouverts : MétéoBlue, IGN, forums, Excel, listes de matos perdues.
              YETI centralise tout via <strong className="text-white">Sherpa</strong>, un moteur qui comprend les corrélations
              entre votre équipement, le terrain et les conditions.
            </p>
            <div className="space-y-3">
              {[
                { title: "Calcul de masse dynamique", desc: "Poids du sac ajusté selon le volume de consommables (eau, gaz, nourriture)." },
                { title: "Corrélations météo × matériel", desc: "Alerte si votre duvet est sous la limite pluie-neige prévue." },
                { title: "Visualisation 3D", desc: "Knolling du Garage en Three.js pour voir votre loadout en un coup d'œil." },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl bg-[#111111] border border-white/[0.08] hover:border-white/20 transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={{ backgroundColor: `${THEME.orange}15`, color: THEME.orange }}
                  >
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{f.title}</h4>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Nuage de points 3D (IA background) */}
          <div className="relative group">
            {/* Halo orange arrière très doux (juste une lueur, pas un blob) */}
            <div
              className="absolute -inset-20 blur-[160px] rounded-full opacity-15 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${THEME.orange} 0%, transparent 70%)`,
              }}
            />

            <div
              className="relative rounded-[28px] overflow-hidden aspect-[4/5] border shadow-2xl"
              style={{
                borderColor: `${THEME.orange}20`,
                background:
                  "radial-gradient(ellipse at 50% 45%, #120805 0%, #050505 75%)",
              }}
            >
              {/* Canvas : nuage de points 3D en rotation */}
              <div className="absolute inset-0">
                <Network3DMesh color={THEME.orange} />
              </div>

              {/* Fondu doux sur tous les bords pour que le nuage se perde
                  dans le cadre au lieu d'être coupé net */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,5,5,0.85) 95%)",
                }}
              />

              {/* Gradient bas (texte) */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

              {/* Texte principal en bas (simple, comme demandé) */}
              <div className="absolute bottom-6 left-6 right-6">
                <div
                  className="text-[9px] font-black uppercase tracking-[0.3em] mb-1.5"
                  style={{ color: THEME.orange }}
                >
                  ● Sherpa Engine v4.0
                </div>
                <div className="text-xl font-black uppercase tracking-tight leading-tight text-white">
                  Analyse multi-layers active.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRODUIT / PILIERS ========== */}
      <section id="product" className="py-32 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.orange }}>
              Les 3 Piliers du Système
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
              Un produit.<br />Trois modules.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => (
              <Link
                key={i}
                href={p.link}
                className="group relative rounded-[24px] bg-[#111111] border border-white/[0.08] p-8 hover:border-white/20 transition-all overflow-hidden"
              >
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: THEME.orange }}
                />
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                    style={{ backgroundColor: `${THEME.orange}15`, color: THEME.orange }}
                  >
                    <p.icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{p.title}</h3>
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6">{p.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: THEME.orange }}>
                      {p.stat}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WORKFLOW ========== */}
      <section id="workflow" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <Image src="/images/landing/tech_background.png" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.orange }}>
              Workflow en 3 étapes
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
              De l&apos;idée<br />au sommet.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {WORKFLOW_STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-[24px] bg-[#111111] border border-white/[0.08] p-8 overflow-hidden"
              >
                <div
                  className="text-[120px] font-black tracking-tighter absolute -top-4 -right-2 leading-none select-none pointer-events-none"
                  style={{ color: `${THEME.orange}10` }}
                >
                  {s.num}
                </div>
                <div className="relative">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: THEME.orange }}>
                    Étape {s.num}
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">{s.title}</h3>
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 opacity-30">
          <Image src="/images/landing/hero_orange_layers.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/60 to-[#050505]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center space-y-10">
          <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-[0.9]">
            Prêt à optimiser<br />
            <span style={{ color: THEME.orange, textShadow: `0 0 30px ${THEME.orange}40` }}>votre sac ?</span>
          </h3>
          <p className="text-lg text-zinc-400 font-medium max-w-xl mx-auto">
            Rejoignez la nouvelle école de la randonnée technique. Gratuit pour les préparateurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/basecamp"
              className="h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-white flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl"
              style={{ backgroundColor: THEME.orangeDeep, boxShadow: `0 12px 32px ${THEME.orangeDeep}40` }}
            >
              Démarrer Gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="h-14 px-10 rounded-2xl bg-[#111111] border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center hover:bg-[#1a1a1a] transition-all"
            >
              Comparer les Plans
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: THEME.orange }}>
              <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase text-white">
              Yeti <span style={{ color: THEME.orange }}>Expédition</span>
            </span>
          </div>
          <div className="flex gap-6">
            <Link href="/basecamp" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Basecamp</Link>
            <Link href="/pricing" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Tarifs</Link>
            <a href="#concept" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Concept</a>
          </div>
          <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">
            © 2026 YETI EXPÉDITION SYSTEM
          </div>
        </div>
      </footer>
    </div>
  );
}
