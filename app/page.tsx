"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
  const router = useRouter();

  const demoAction = () => {
    router.push("/app/select-trek");
  };

  useEffect(() => {
    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        // Check if internal anchor link
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div id="landingPage" className="min-h-screen bg-stone-50 text-stone-900 antialiased font-sans">

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 pt-6">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <Logo variant="light" />

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/90 drop-shadow-md">
            <a href="#features" className="hover:text-white transition hover:underline decoration-2 underline-offset-4 decoration-orange-500">Fonctionnalités</a>
            <a href="#how" className="hover:text-white transition hover:underline decoration-2 underline-offset-4 decoration-orange-500">Comment ça marche</a>
            <a href="#pricing" className="hover:text-white transition hover:underline decoration-2 underline-offset-4 decoration-orange-500">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={demoAction} className="px-5 py-2.5 rounded-full bg-white text-stone-900 text-sm font-bold hover:bg-orange-600 hover:text-white transition shadow-lg">
              Ouvrir l'app
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-stone-950 text-white flex items-center pt-20">
        <div className="absolute inset-0">
          <Image
            className="w-full h-full object-cover opacity-60"
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2400&auto=format&fit=crop"
            alt="Montagne"
            fill
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-transparent to-stone-950"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-8 glass">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Your European Trek Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] drop-shadow-xl">
            <span className="block">20h de recherche.</span>
            <span className="block mt-2">Ou <span className="text-orange-500">30 minutes</span></span>
            <span className="block mt-2 text-stone-300">avec YETI.</span>
          </h1>

          <p className="mt-8 text-xl text-stone-200 max-w-2xl leading-relaxed drop-shadow-md">
            Choisis ton trek. Récupère une config validée terrain. Génère ton dossier complet.
            <span className="text-white font-bold">Les randonneurs sérieux préparent comme des pros.</span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button onClick={demoAction} className="h-14 px-8 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-black tracking-tight transition shadow-[0_0_60px_-15px_rgba(249,115,22,0.6)] flex items-center justify-center gap-3">
              <span>Créer mon premier projet</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </button>
            <a href="#how" className="h-14 px-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold glass transition flex items-center justify-center backdrop-blur-md">
              Voir comment ça marche
            </a>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <div className="text-4xl font-black">70%</div>
              <div className="mt-2 text-sm text-stone-300">des randonneurs partent mal équipés</div>
            </div>
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <div className="text-4xl font-black">10h+</div>
              <div className="mt-2 text-sm text-stone-300">perdues en recherche moyenne</div>
            </div>
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <div className="text-4xl font-black">40%</div>
              <div className="mt-2 text-sm text-stone-300">de retours sacs mal adaptés</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-600/30 to-orange-500/20 border border-orange-500/30 backdrop-blur-md">
              <div className="text-4xl font-black text-orange-400">0→1</div>
              <div className="mt-2 text-sm text-orange-200">plateforme qui résout tout</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[#F5F5F4]"> 
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-widest mb-4">
              Fonctionnalités
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900">
              Ce que les autres ne font pas
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-8 rounded-3xl bg-white shadow-sm border border-stone-200 card-hover cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-6 border border-stone-100">
                <svg className="w-10 h-10 text-orange-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4L4 20h16L12 4z" />
                  <path d="M12 10v10" />
                </svg>
              </div>
              <h3 className="text-xl font-black mb-2 text-stone-900">Basecamp</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Dashboard contextuel qui évolue selon J-X. Tu vois exactement où tu en es et quoi faire.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white shadow-sm border border-stone-200 card-hover cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                 <svg className="w-10 h-10 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
                  <path d="M13 11l-3 5h4l-3 5" /> 
                </svg>
              </div>
              <h3 className="text-xl font-black mb-2 text-stone-900">Weather Intelligence</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Météo croisée avec ton équipement. &quot;Ton duvet sera limite J3 à 2400m.&quot;</p>
            </div>

            <div className="p-8 rounded-3xl bg-white shadow-sm border border-stone-200 card-hover cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 border border-emerald-100">
                <svg className="w-10 h-10 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="8" width="10" height="12" rx="2" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                  <path d="M16 4l2 2" /> 
                  <path d="M6 18l-2 2" /> 
                </svg>
              </div>
              <h3 className="text-xl font-black mb-2 text-stone-900">Clone & Adapt</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Clone une config validée terrain et adapte-la automatiquement à ton profil.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white shadow-sm border border-stone-200 card-hover cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-6 border border-stone-200">
                <svg className="w-14 h-14 text-stone-800" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="30" y2="12" />
                  <circle cx="8" cy="12" r="3" fill="white" />
                  <circle cx="20" cy="12" r="3" fill="white" />
                  <circle cx="32" cy="12" r="5" fill="white" />
                  <polyline points="30 12 31.5 13.5 34.5 10.5" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-xl font-black mb-2 text-stone-900">Timeline Auto</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Tâches générées automatiquement : J-30 planif, J-15 test, J-7 météo, J-1 check final.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white shadow-sm border border-stone-200 card-hover cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 border border-orange-100">
                <svg className="w-10 h-10 text-red-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 21l-6-6" />
                  <circle cx="10" cy="10" r="7" />
                  <path d="M7 11l3-3 3 3" /> 
                </svg>
              </div>
              <h3 className="text-xl font-black mb-2 text-stone-900">Analyse Sherpa</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Score de préparation + alertes contextuelles. Pas juste &quot;attention&quot;, mais &quot;voici la solution&quot;.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white shadow-sm border border-stone-200 card-hover cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-6 border border-zinc-200">
                <svg className="w-12 h-12 text-zinc-800" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="16" y1="2" x2="16" y2="22" />
                   <rect x="4" y="10" width="8" height="10" rx="2" />
                   <circle cx="8" cy="6" r="2.5" />
                   <path d="M5 10v4h6v-4" strokeWidth="1" />
                   <rect x="20" y="10" width="8" height="10" rx="2" />
                   <circle cx="24" cy="6" r="2.5" />
                   <path d="M21 10v4h6v-4" strokeWidth="1" />
                </svg>
              </div>
              <h3 className="text-xl font-black mb-2 text-stone-900">Split Mode</h3>
              <p className="text-stone-600 text-sm leading-relaxed">Mode groupe avec répartition intelligente du matériel et checklist par personne.</p>
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-widest mb-4">
              Comment ça marche
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900">
              De l'idée au départ en <span className="gradient-text">3 étapes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg shadow-orange-500/30">1</div>
              <h3 className="text-xl font-black mb-3">Choisis ton trek</h3>
              <p className="text-stone-600">GR20, TMB, Camino... Sélectionne ta destination et tes dates. YETI récupère les données terrain.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg shadow-orange-500/30">2</div>
              <h3 className="text-xl font-black mb-3">Clone une config pro</h3>
              <p className="text-stone-600">Récupère un pack validé par la communauté. Adapte-le à ton profil, ton budget, ta morphologie.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg shadow-orange-500/30">3</div>
              <h3 className="text-xl font-black mb-3">Score 100% et pars</h3>
              <p className="text-stone-600">Sherpa analyse ton pack × météo × terrain. Résous les alertes, exporte ton dossier, pars serein.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4">
              Tarifs
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900">
              Simple et transparent
            </h2>
            <p className="mt-4 text-xl text-stone-500">Gratuit pour préparer. Payant pour l'intelligence avancée.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-3xl bg-white border border-stone-200">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Gratuit</div>
              <div className="text-4xl font-black">0€</div>
              <div className="text-sm text-stone-500 mb-6">Pour commencer</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Pack Builder complet</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> 3 projets actifs</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Export liste TXT</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Communauté</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white border-2 border-orange-500 shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-bold">Populaire</div>
              <div className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">Diagnostic</div>
              <div className="text-4xl font-black">7€</div>
              <div className="text-sm text-stone-500 mb-6">par projet</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Tout le gratuit +</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Analyse Sherpa complète</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Weather Intelligence</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Export PDF</li>
              </ul>
              <button className="mt-6 w-full py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-500 transition">Choisir</button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Groupe</div>
              <div className="text-4xl font-black">12€</div>
              <div className="text-sm text-stone-500 mb-6">par projet</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Jusqu'à 6 personnes</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Répartition auto</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Export par membre</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span> Sync temps réel</li>
              </ul>
              <button className="mt-6 w-full py-3 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition">Choisir</button>
            </div>

            <div className="p-6 rounded-3xl bg-stone-900 text-white">
              <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">YETI Pass</div>
              <div className="text-4xl font-black">29€</div>
              <div className="text-sm text-stone-400 mb-6">par an</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><span className="text-orange-400">✓</span> Tout illimité</li>
                <li className="flex items-center gap-2"><span className="text-orange-400">✓</span> Projets illimités</li>
                <li className="flex items-center gap-2"><span className="text-orange-400">✓</span> Treks en avant-première</li>
                <li className="flex items-center gap-2"><span className="text-orange-400">✓</span> Badge Supporter</li>
              </ul>
              <button className="mt-6 w-full py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-500 transition">S'abonner</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-stone-950 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            Prêt à préparer<br/>
            <span className="gradient-text">comme un pro ?</span>
          </h2>
          <p className="mt-6 text-xl text-stone-400 max-w-2xl mx-auto">
            Rejoins les randonneurs qui préparent intelligemment.
          </p>
          <div className="mt-10">
            <button onClick={demoAction} className="h-14 px-10 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-black transition shadow-[0_0_60px_-15px_rgba(249,115,22,0.5)]">
              Créer mon premier projet — Gratuit
            </button>
          </div>
          <p className="mt-6 text-sm text-stone-500">Pas de carte bancaire • Export gratuit • Données sécurisées</p>
        </div>
      </section>

    </div>
  );
}