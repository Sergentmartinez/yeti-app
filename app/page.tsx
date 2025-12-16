"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mountain, Package, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative bg-zinc-950 text-white font-sans selection:bg-orange-500/30">

      {/* --- NAVIGATION TRANSPARENTE --- */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            
            {/* LOGO YETI */}
            <Link href="/" className="flex items-baseline gap-1 cursor-pointer select-none group decoration-0">
                <span 
                    className="text-3xl font-bold tracking-tighter text-white group-hover:text-zinc-300 transition-colors uppercase" 
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                    YETI
                </span>
                {/* Carré qui tourne */}
                <div className="w-2.5 h-2.5 bg-orange-600 shadow-[0_0_5px_rgba(234,88,12,0.8)] group-hover:shadow-[0_0_10px_rgba(234,88,12,1)] transition-all transform group-hover:rotate-45 duration-300"></div>
            </Link>

            {/* Menu */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-200">
                <Link href="/treks" className="hover:text-white transition-colors drop-shadow-md hover:scale-105 duration-200">Treks</Link>
                <Link href="/basecamp" className="hover:text-white transition-colors drop-shadow-md hover:scale-105 duration-200">Basecamp</Link>
                <Link href="/basecamp/packbuilder" className="hover:text-white transition-colors drop-shadow-md hover:scale-105 duration-200">Pack Builder</Link>
            </div>

            {/* CTA */}
            <Link href="/treks" className="bg-white text-zinc-950 px-5 py-2 text-sm font-bold tracking-tight rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-black/20">
                Commencer
            </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        {/* Fond */}
        <div className="absolute inset-0 z-0">
            <Image 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop" 
                alt="Montagne Background" 
                fill
                className="object-cover"
                priority
            />
            {/* Correction Tailwind : bg-linear-to-b */}
            <div className="absolute inset-0 bg-linear-to-b from-zinc-950/30 via-zinc-950/50 to-zinc-950"></div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-10">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                Saison 2025 Ouverte
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white mb-6 leading-[0.9]">
                PRÉPARE.<br />
                OPTIMISE.<br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">
                    CONQUIERS.
                </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light drop-shadow-md">
                La plateforme premium de préparation pour les grandes traversées européennes.
                Planifiez votre <Link href="/treks/gr20-corse" className="text-white font-medium hover:text-orange-500 underline decoration-orange-500/30 underline-offset-4 transition-colors">GR20</Link>, 
                <Link href="/treks/tour-mont-blanc" className="text-white font-medium hover:text-orange-500 underline decoration-orange-500/30 underline-offset-4 transition-colors">TMB</Link> ou 
                <Link href="/treks/camino" className="text-white font-medium hover:text-orange-500 underline decoration-orange-500/30 underline-offset-4 transition-colors">Camino</Link> avec une précision algorithmique.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link href="/treks" className="group h-12 px-8 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-bold tracking-tight transition-all flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(234,88,12,0.6)]">
                    Explorer les Treks
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link href="/basecamp/packbuilder" className="h-12 px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium backdrop-blur-md transition-all flex items-center gap-2">
                    <Package className="w-4 h-4 text-zinc-400" />
                    Pack Builder IA
                </Link>
            </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400">Scroll</span>
            <div className="w-px h-8 bg-linear-to-b from-transparent via-zinc-400 to-transparent"></div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="bg-zinc-950 py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
           <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-600/30 transition-colors group">
             <Mountain className="w-8 h-8 text-orange-600 mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">Itinéraires Intelligents</h3>
             {/* CORRECTION ICI : L'algorithme avec &apos; */}
             <p className="text-zinc-400 text-sm leading-relaxed">L&apos;algorithme recalcule vos étapes en temps réel selon votre rythme cardiaque et votre progression.</p>
           </div>

           <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-600/30 transition-colors group">
             <Package className="w-8 h-8 text-orange-600 mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">Matériel Optimisé</h3>
             <p className="text-zinc-400 text-sm leading-relaxed">Générez la liste parfaite. Chaque gramme est pesé et justifié selon la météo locale.</p>
           </div>

           <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-600/30 transition-colors group">
             <CheckCircle className="w-8 h-8 text-orange-600 mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">Experts Certifiés</h3>
             <p className="text-zinc-400 text-sm leading-relaxed">Accédez aux conseils et conditions validés quotidiennement par des guides de haute montagne.</p>
           </div>

        </div>
      </section>

    </div>
  );
}