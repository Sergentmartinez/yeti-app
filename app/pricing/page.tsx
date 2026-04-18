// app/pricing/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Mountain, ArrowRight, Check, X, Sparkles, Shield, Zap,
  Users, Backpack, Map as MapIcon, CloudSun, Database, Flag
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// DESIGN TOKENS — Alignés avec la landing + dashboard
// ============================================================================
const THEME = {
  orangeDeep: "#B21D3B",
  orange: "#F9591F",
  orangeLight: "#FF8C42",
  yellow: "#FEC631",
  emerald: "#10b981",
};

// ============================================================================
// PLANS (cohérents avec les capacités réelles du produit)
// ============================================================================
interface Plan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  highlight?: boolean;
  badge?: string;
  cta: string;
  features: { label: string; included: boolean; note?: string }[];
  limits: { projects: string; gearItems: string; sherpaQueries: string; storage: string };
}

const PLANS: Plan[] = [
  {
    id: "scout",
    name: "Scout",
    tagline: "Pour tester la méthode.",
    priceMonthly: 0,
    priceYearly: 0,
    cta: "Démarrer gratuitement",
    limits: {
      projects: "1 projet actif",
      gearItems: "50 items max",
      sherpaQueries: "10 requêtes / mois",
      storage: "100 MB",
    },
    features: [
      { label: "Garage 3D (Three.js)", included: true },
      { label: "Calcul masse dynamique", included: true },
      { label: "Import GPX & dénivelé", included: true },
      { label: "Timeline de préparation", included: true },
      { label: "Sherpa AI (basique)", included: true, note: "10 analyses / mois" },
      { label: "Export PDF roadbook", included: false },
      { label: "Corrélations météo × matos", included: false },
      { label: "Support prioritaire", included: false },
    ],
  },
  {
    id: "alpiniste",
    name: "Alpiniste",
    tagline: "Le plan des planificateurs sérieux.",
    priceMonthly: 9,
    priceYearly: 7,
    highlight: true,
    badge: "Le plus choisi",
    cta: "Passer à l'Alpiniste",
    limits: {
      projects: "Projets illimités",
      gearItems: "Items illimités",
      sherpaQueries: "500 requêtes / mois",
      storage: "10 GB",
    },
    features: [
      { label: "Tout du plan Scout", included: true },
      { label: "Sherpa AI (complet)", included: true, note: "500 analyses / mois" },
      { label: "Corrélations météo × matos", included: true },
      { label: "Alertes proactives (vent, froid, pluie)", included: true },
      { label: "Export PDF roadbook HD", included: true },
      { label: "Import/Export GPX avancé", included: true },
      { label: "Knolling 3D haute résolution", included: true },
      { label: "Support e-mail sous 48h", included: true },
    ],
  },
  {
    id: "expedition",
    name: "Expédition",
    tagline: "Pour les équipes et guides pros.",
    priceMonthly: 29,
    priceYearly: 23,
    badge: "Équipes",
    cta: "Contacter le team",
    limits: {
      projects: "Projets illimités",
      gearItems: "Items illimités",
      sherpaQueries: "Requêtes illimitées",
      storage: "100 GB",
    },
    features: [
      { label: "Tout du plan Alpiniste", included: true },
      { label: "Multi-utilisateurs (jusqu'à 10)", included: true },
      { label: "Partage de roadbooks", included: true },
      { label: "API Sherpa (accès dev)", included: true },
      { label: "Priorité nouvelles fonctions", included: true },
      { label: "Branding personnalisé (PDF)", included: true },
      { label: "Support dédié sous 4h", included: true },
      { label: "Onboarding 1-to-1", included: true },
    ],
  },
];

// ============================================================================
// FAQ (questions concrètes et vérifiables)
// ============================================================================
const FAQ = [
  {
    q: "Comment est calculé le poids de mon sac ?",
    a: "YETI additionne le poids de chaque item du Garage, puis ajuste dynamiquement selon les consommables (eau, nourriture, gaz) prévus pour chaque étape. Le poids affiché correspond à ce que vous portez réellement ce jour-là.",
  },
  {
    q: "Sur quelles sources météo repose Sherpa AI ?",
    a: "Nous croisons plusieurs modèles (ECMWF, GFS, AROME pour l'Europe) et appliquons une couche de ressenti alpin (vent + altitude + humidité). Sherpa alerte quand la combinaison dépasse la plage opérationnelle de votre matériel déclaré.",
  },
  {
    q: "Puis-je importer mes propres traces GPX ?",
    a: "Oui, dès le plan Scout. YETI parse les traces, calcule automatiquement dénivelé positif / négatif, distance réelle et propose un découpage par étape. Compatible avec IGN, Iphigénie, Strava, Komoot, Garmin.",
  },
  {
    q: "Le Garage 3D fonctionne-t-il sur mobile ?",
    a: "Oui. Nous utilisons React Three Fiber avec un mode dégradé automatique : knolling 2D sur mobile bas de gamme, 3D complète dès qu'un GPU est disponible. Aucune installation, tout tourne dans le navigateur.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui. Les plans mensuels s'arrêtent à la fin du cycle en cours. Les plans annuels sont remboursés au prorata si vous résiliez dans les 30 premiers jours. Pas d'engagement, pas de piège.",
  },
  {
    q: "Mes données sont-elles privées ?",
    a: "Oui. Vos projets, votre Garage et vos roadbooks sont stockés sur Supabase (UE) et chiffrés. Nous ne vendons jamais vos données et vous pouvez tout exporter/supprimer à tout moment.",
  },
];

// ============================================================================
// COMPARAISON FEATURES
// ============================================================================
const COMPARE = [
  { cat: "Planification", rows: [
    { label: "Projets actifs", scout: "1", alpiniste: "∞", expedition: "∞" },
    { label: "Items dans le Garage", scout: "50", alpiniste: "∞", expedition: "∞" },
    { label: "Import GPX", scout: true, alpiniste: true, expedition: true },
    { label: "Timeline préparation", scout: true, alpiniste: true, expedition: true },
  ]},
  { cat: "Sherpa AI", rows: [
    { label: "Analyses / mois", scout: "10", alpiniste: "500", expedition: "∞" },
    { label: "Corrélations météo × matos", scout: false, alpiniste: true, expedition: true },
    { label: "Alertes proactives", scout: false, alpiniste: true, expedition: true },
    { label: "API Sherpa", scout: false, alpiniste: false, expedition: true },
  ]},
  { cat: "Export & Partage", rows: [
    { label: "Export PDF roadbook", scout: false, alpiniste: true, expedition: true },
    { label: "Export GPX avancé", scout: false, alpiniste: true, expedition: true },
    { label: "Branding personnalisé", scout: false, alpiniste: false, expedition: true },
    { label: "Multi-utilisateurs", scout: false, alpiniste: false, expedition: "10 max" },
  ]},
];

// ============================================================================
// COMPOSANT
// ============================================================================
export default function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased font-sans selection:bg-[#F9591F]/30">

      {/* NAV */}
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
          <Link href="/#concept" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Concept</Link>
          <Link href="/#product" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Produit</Link>
          <Link href="/pricing" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors">Tarifs</Link>
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

      {/* HERO */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/landing/pattern_orange.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/70 to-[#050505]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#111111] border border-white/10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: THEME.orange }} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              Tarifs transparents
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
            Un plan pour<br />
            <span style={{ color: THEME.orange, textShadow: `0 0 30px ${THEME.orange}40` }}>chaque altitude.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
            Commencez gratuitement. Évoluez quand vos ambitions grimpent. Annulation à tout moment, sans question.
          </p>

          {/* Toggle Mensuel/Annuel */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span className={cn("text-xs font-black uppercase tracking-widest transition-colors", !yearly ? "text-white" : "text-zinc-600")}>
              Mensuel
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-14 h-7 rounded-full bg-[#111111] border border-white/10 transition-colors"
              style={{ backgroundColor: yearly ? THEME.orange : "#111111" }}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-transform",
                  yearly ? "translate-x-7" : "translate-x-0.5"
                )}
              />
            </button>
            <span className={cn("text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2", yearly ? "text-white" : "text-zinc-600")}>
              Annuel
              <span
                className="px-2 py-0.5 rounded text-[9px]"
                style={{ backgroundColor: `${THEME.emerald}20`, color: THEME.emerald }}
              >
                −22%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* PLANS GRID */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-[24px] p-8 border transition-all",
                plan.highlight
                  ? "bg-gradient-to-b from-[#1a0f0a] to-[#111111] border-[#F9591F]/30 shadow-2xl scale-100 md:scale-105"
                  : "bg-[#111111] border-white/[0.08]"
              )}
              style={plan.highlight ? { boxShadow: `0 20px 60px ${THEME.orange}20` } : undefined}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: plan.highlight ? THEME.orange : "#1a1a1a",
                    color: plan.highlight ? "white" : "#a1a1aa",
                    border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-zinc-500 font-medium">{plan.tagline}</p>
              </div>

              {/* Prix */}
              <div className="mb-6 pb-6 border-b border-white/5">
                {plan.priceMonthly === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter text-white">0</span>
                    <span className="text-lg font-black text-zinc-500">€</span>
                    <span className="text-xs font-bold text-zinc-500 ml-2">pour toujours</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-5xl font-black tracking-tighter"
                        style={{ color: plan.highlight ? THEME.orange : "white" }}
                      >
                        {yearly ? plan.priceYearly : plan.priceMonthly}
                      </span>
                      <span className="text-lg font-black text-zinc-500">€</span>
                      <span className="text-xs font-bold text-zinc-500 ml-2">/mois</span>
                    </div>
                    {yearly && (
                      <div className="text-[10px] font-bold text-zinc-600 mt-1 uppercase tracking-wider">
                        Facturé {plan.priceYearly * 12}€ / an
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Limits quick */}
              <div className="space-y-1.5 mb-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  <Flag size={12} className="text-zinc-600" />
                  <span className="text-zinc-400 font-medium">{plan.limits.projects}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Backpack size={12} className="text-zinc-600" />
                  <span className="text-zinc-400 font-medium">{plan.limits.gearItems}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles size={12} className="text-zinc-600" />
                  <span className="text-zinc-400 font-medium">{plan.limits.sherpaQueries}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Database size={12} className="text-zinc-600" />
                  <span className="text-zinc-400 font-medium">{plan.limits.storage}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        f.included ? "" : "bg-zinc-900"
                      )}
                      style={f.included ? { backgroundColor: `${THEME.orange}20`, color: THEME.orange } : undefined}
                    >
                      {f.included ? <Check size={10} strokeWidth={3} /> : <X size={10} className="text-zinc-700" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-xs font-bold", f.included ? "text-white" : "text-zinc-600 line-through")}>
                        {f.label}
                      </div>
                      {f.note && (
                        <div className="text-[10px] text-zinc-600 font-medium mt-0.5">{f.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={plan.id === "expedition" ? "mailto:team@yeti-expedition.com" : "/basecamp"}
                className={cn(
                  "block w-full h-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]",
                  plan.highlight ? "text-white shadow-2xl" : "bg-[#1a1a1a] border border-white/10 text-white hover:bg-[#222]"
                )}
                style={plan.highlight ? { backgroundColor: THEME.orangeDeep, boxShadow: `0 12px 32px ${THEME.orangeDeep}40` } : undefined}
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-20 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: THEME.orange }}>
              Comparaison détaillée
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">
              Tout, au même endroit.
            </h2>
          </div>

          <div className="rounded-[24px] bg-[#111111] border border-white/[0.08] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-white/5">
              <div className="p-5 text-[10px] font-black uppercase tracking-wider text-zinc-600">Fonctionnalité</div>
              <div className="p-5 text-center text-xs font-black uppercase tracking-wider text-zinc-400">Scout</div>
              <div className="p-5 text-center text-xs font-black uppercase tracking-wider" style={{ color: THEME.orange }}>
                Alpiniste
              </div>
              <div className="p-5 text-center text-xs font-black uppercase tracking-wider text-zinc-400">Expédition</div>
            </div>

            {/* Rows */}
            {COMPARE.map((section, i) => (
              <div key={i}>
                <div className="grid grid-cols-4 bg-[#0a0a0a] border-b border-white/5">
                  <div className="col-span-4 p-3 text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: THEME.orange }}>
                    {section.cat}
                  </div>
                </div>
                {section.rows.map((row, j) => (
                  <div key={j} className="grid grid-cols-4 border-b border-white/5 last:border-b-0 hover:bg-white/[0.01] transition-colors">
                    <div className="p-4 text-xs text-zinc-300 font-medium">{row.label}</div>
                    {(["scout", "alpiniste", "expedition"] as const).map((k) => {
                      const val = row[k];
                      return (
                        <div key={k} className="p-4 text-center">
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check size={16} className="mx-auto" style={{ color: THEME.orange }} strokeWidth={3} />
                            ) : (
                              <X size={16} className="mx-auto text-zinc-700" />
                            )
                          ) : (
                            <span className="text-xs font-black text-white">{val}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-3" style={{ color: THEME.orange }}>
              Questions fréquentes
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">
              On vous répond.
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-[#111111] border border-white/[0.08] hover:border-white/20 transition-all overflow-hidden"
              >
                <summary className="p-5 cursor-pointer flex items-center justify-between list-none">
                  <span className="text-sm font-black text-white uppercase tracking-tight pr-4">{item.q}</span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-open:rotate-45"
                    style={{ backgroundColor: `${THEME.orange}15`, color: THEME.orange }}
                  >
                    <span className="text-lg leading-none">+</span>
                  </div>
                </summary>
                <div className="px-5 pb-5 text-sm text-zinc-400 font-medium leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 opacity-25">
          <Image src="/images/landing/hero_orange_layers.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 to-[#050505]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-8 text-center space-y-8">
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-[0.9]">
            Tentez l&apos;<span style={{ color: THEME.orange }}>ascension</span>.
          </h3>
          <p className="text-base text-zinc-400 font-medium max-w-xl mx-auto">
            14 jours d&apos;essai sur l&apos;Alpiniste. Pas de CB requise. Si vous n&apos;êtes pas convaincu, vous restez sur le plan gratuit.
          </p>
          <Link
            href="/basecamp"
            className="inline-flex h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-white items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl"
            style={{ backgroundColor: THEME.orangeDeep, boxShadow: `0 12px 32px ${THEME.orangeDeep}40` }}
          >
            Démarrer l&apos;essai gratuit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
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
            <Link href="/#concept" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Concept</Link>
          </div>
          <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">
            © 2026 YETI EXPÉDITION SYSTEM
          </div>
        </div>
      </footer>
    </div>
  );
}
