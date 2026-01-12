// app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased selection:bg-cyan-vibrant selection:text-white">
      
      {/* FLOATING NAV */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-bg-surface-1/60 backdrop-blur-xl border border-white/10 flex items-center gap-8 shadow-2xl">
          <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-cyan-vibrant text-white rounded-lg flex items-center justify-center shadow-lg shadow-cyan-vibrant/20 group-hover:scale-110 transition-transform">
                  <Icons.Logo className="w-5 h-5" />
              </div>
              <span className="text-sm font-black tracking-tighter uppercase">Yeti <span className="text-cyan-vibrant">Expédition</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
              {['Concept', 'Basecamp', 'Sherpa', 'Tarifs'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-widest text-text-faint hover:text-cyan-vibrant transition-colors">{item}</a>
              ))}
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <Link href="/basecamp" className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-vibrant hover:text-white transition-all">
              Launch App
          </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
               <Image 
                 src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2400&auto=format&fit=crop" 
                 alt="Background" 
                 fill 
                 className="object-cover opacity-20 filter grayscale scale-110 animate-pulse-slow"
               />
               <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-transparent to-bg-base" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-8 text-center space-y-12 animate-slide-up">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-bg-surface-2 border border-border-subtle shadow-xl">
                  <div className="w-2 h-2 rounded-full bg-orange-vibrant animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Système de Planification Tactique v4.0</span>
              </div>

              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase flex flex-col">
                  <span className="text-text-primary drop-shadow-2xl">20h de Recherche.</span>
                  <span className="text-transparent border-text stroke-cyan-vibrant" style={{ WebkitTextStroke: '1px var(--color-cyan-vibrant)' }}>Ou 30 minutes</span>
                  <span className="text-cyan-vibrant drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">avec YETI.</span>
              </h1>

              <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto font-medium leading-relaxed">
                  L&apos;IA Sherpa croise votre équipement, la météo et le terrain pour générer un roadbook millimétré. <span className="text-text-primary">Ne partez plus au hasard.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <Link href="/basecamp" className="h-14 px-10 rounded-2xl bg-cyan-vibrant text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-cyan-vibrant/20">
                      Démarrer l&apos;Expédition
                      <Icons.ArrowRight className="w-5 h-5" />
                  </Link>
                  <a href="#concept" className="h-14 px-10 rounded-2xl bg-bg-surface-2 border border-border-default text-text-primary font-black text-xs uppercase tracking-[0.2em] flex items-center hover:bg-bg-surface-3 transition-all">
                      Voir le Concept
                  </a>
              </div>

              {/* SOCIAL PROOF / STATS */}
              <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                   {[
                       { label: 'Projets Actifs', value: '12.4k' },
                       { label: 'Items Trackés', value: '450k+' },
                       { label: 'Dénivelé Planifié', value: '2.8M m' },
                       { label: 'Sherpa AI Score', value: '98%' }
                   ].map((stat, i) => (
                       <div key={i} className="premium-card p-6 rounded-2xl text-center">
                           <div className="text-2xl font-black text-text-primary font-mono tracking-tighter">{stat.value}</div>
                           <div className="text-[8px] font-black text-text-faint uppercase tracking-[0.2em] mt-2">{stat.label}</div>
                       </div>
                   ))}
              </div>
          </div>
      </section>

      {/* NARRATIVE SECTION */}
      <section id="concept" className="py-40 bg-bg-surface-1">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                  <div className="text-[10px] font-black text-cyan-vibrant uppercase tracking-[0.4em]">Le Problème Analogique</div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight text-text-primary uppercase leading-none">
                      Le matos ne suffit plus. <br/>
                      <span className="text-text-faint">Il faut de l&apos;intelligence.</span>
                  </h2>
                  <p className="text-lg text-text-muted leading-relaxed font-medium">
                      Historiquement, planifier un trek demandait des dizaines d&apos;onglets ouverts : Météo Blue, Iphigénie, forums spécialisés, fichiers Excel... YETI centralise tout via son moteur neuronal <strong>Sherpa</strong>.
                  </p>
                  <div className="space-y-4">
                      {[
                          { title: 'Calcul de masse dynamique', desc: 'Ajustement du poids du sac selon le volume consommé.' },
                          { title: 'Corrélations météorologiques', desc: 'Alertes si votre duvet n’est pas adapté à la limite pluie-neige.' },
                          { title: 'Tactical Backbone', desc: 'Visualisez l’équilibre de votre charge en 3D Studio.' }
                      ].map((feature, i) => (
                          <div key={i} className="flex gap-4 p-6 premium-card rounded-2xl group cursor-default">
                              <div className="w-12 h-12 rounded-xl bg-bg-surface-3 flex items-center justify-center group-hover:bg-cyan-vibrant/20 group-hover:text-cyan-vibrant transition-all">
                                  <Icons.Check className="w-5 h-5" />
                              </div>
                              <div>
                                  <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">{feature.title}</h4>
                                  <p className="text-xs text-text-muted mt-1 font-medium">{feature.desc}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="relative group">
                   <div className="absolute inset-0 bg-cyan-vibrant opacity-20 blur-[100px] rounded-full group-hover:opacity-30 transition-opacity" />
                   <div className="premium-card rounded-3xl overflow-hidden aspect-square relative z-10 border-white/5 shadow-2xl scale-95 group-hover:scale-100 transition-transform duration-700">
                        <Image 
                          src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop" 
                          alt="Expedition" 
                          fill 
                          className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8">
                             <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Système Sherpa v4.0</div>
                             <div className="text-xl font-black text-white uppercase tracking-tight leading-none">Analyse de charge multi-layers active.</div>
                        </div>
                   </div>
              </div>
          </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="py-40 bg-bg-base border-t border-border-subtle overflow-hidden relative">
          <div className="max-w-4xl mx-auto px-8 text-center relative z-10 space-y-10">
               <h3 className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-text-primary leading-none">
                   Prêt à optimiser <br/>
                   <span className="text-cyan-vibrant drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">votre sac ?</span>
               </h3>
               <p className="text-lg text-text-muted font-medium max-w-xl mx-auto">
                   Rejoignez la nouvelle école de la randonnée technique. Gratuit pour les préparateurs.
               </p>
               <div className="flex justify-center">
                   <Link href="/basecamp" className="h-16 px-12 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-[0.3em] flex items-center hover:scale-105 transition-all shadow-2xl">
                       Get Started Now
                   </Link>
               </div>
               <div className="pt-20 text-[8px] font-black text-text-faint uppercase tracking-[0.5em]">
                   © 2026 YETI EXPÉDITION SYSTEM — ALL RIGHTS RESERVED
               </div>
          </div>
          
          {/* Background Text Decor */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[20vw] font-black text-white/[0.02] uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap">
              EXPD-INFRASTRUCTURE
          </div>
      </footer>
    </div>
  );
}