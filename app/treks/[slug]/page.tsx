"use client";

import { useState, useMemo, use } from 'react'; 
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CloudRain, Sun } from "lucide-react"; 

import { getAllTreks } from "@/lib/data"; 
import { Icons } from "@/components/icons";
import { StageCard } from "@/components/trek/StageCard"; // ✅ Import de la nouvelle carte
import { cn } from "@/lib/utils";
import { getTrekWeather, MonthlyWeather } from '@/lib/weather'; 
import { Stage, PrimaryAccess } from '@/types'; 
import { StageDetailsModal } from '@/components/trek/StageDetailsModal'; 
import { Logo } from "@/components/Logo"; 

export default function TrekPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const treks = getAllTreks();
  const trek = treks.find((t) => t.slug === slug);

  if (!trek) { notFound(); }

  const [selectedStage, setSelectedStage] = useState<Stage | null>(null); 
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  
  const monthlyWeather = useMemo(() => {
    try { return getTrekWeather(trek.slug); } catch (e) { return []; }
  }, [trek.slug]);
  
  const [selectedMonth, setSelectedMonth] = useState<MonthlyWeather | null>(monthlyWeather[0] || null);
  const currentMonthData = selectedMonth || { tempDay: 20, tempNight: 10, rainDays: 8, sunHours: 8, snowRisk: false };

  const isSpirit = trek.theme === "spirit";
  
  const colors = isSpirit ? {
    accent: "text-blue-600",
    bgAccent: "bg-blue-600",
    bgLight: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    textLight: "text-blue-400",
    successText: "text-green-700", 
    successBg: "bg-green-100",
    darkSuccessText: "text-green-200",
    darkSuccessBg: "bg-green-700",
  } : {
    accent: "text-orange-600",
    bgAccent: "bg-orange-600",
    bgLight: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    textLight: "text-orange-500",
    successText: "text-green-800", 
    successBg: "bg-green-200",
    darkSuccessText: "text-green-200",
    darkSuccessBg: "bg-green-700",
  };
  
  const WeatherIconComponent = currentMonthData.rainDays > 10 ? CloudRain : Sun;

  const GetAccessIcon = (type: PrimaryAccess | undefined) => {
    if (type === 'plane') return Icons.Plane;
    if (type === 'bus') return Icons.Bus;
    return Icons.Train;
  };

  const AccessText = (type: PrimaryAccess | undefined) => {
    if (type === 'plane') return "Aéroport (Démarrage)";
    if (type === 'bus') return "Station Bus (Locale)";
    return "Gare SNCF (Départ)";
  };

  const TransportIconComponent = GetAccessIcon(trek.primaryAccess);

  return (
    <div className="min-h-screen bg-stone-50 pb-40 font-sans text-stone-900">
      
      {/* HEADER HERO */}
      <header className="relative h-[75vh] min-h-[500px] w-full bg-stone-900 text-white overflow-hidden rounded-b-[2.5rem] shadow-2xl">
        
        <div className="absolute inset-0 z-0 bg-stone-950">
          <Image
            src={trek.heroImage}
            alt={trek.name}
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
        </div>

        {/* Navbar Flottante */}
        <nav className="absolute top-0 w-full z-20 flex justify-between items-center p-6 md:p-8">
          <Link 
            href="/basecamp" 
            className="flex items-center gap-2 rounded-full bg-black/20 backdrop-blur-md px-4 py-2 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <Icons.ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Basecamp</span>
          </Link>
          
          <Logo color="white" />
          
          <div className="hidden md:flex items-center gap-2 rounded-full bg-black/20 backdrop-blur-md px-4 py-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider">{trek.statusBadge || "Saison 2025"}</span>
          </div>
        </nav>

        {/* Contenu Hero */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-4 text-white/90 font-mono text-sm bg-black/30 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
              <Icons.MapPin className={cn("w-4 h-4", colors.textLight)} />
              <span>{trek.location}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8 mb-8">
              <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tighter text-white uppercase">
                {trek.name.split(" ")[0]} <span className={colors.accent}>{trek.name.split(" ").slice(1).join(" ")}</span>
              </h1>
              <span className="text-xl md:text-3xl font-light text-stone-300 mb-2 md:mb-4">
                {trek.subtitle}
              </span>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Icons.StatsDistance className="w-3 h-3" /> Distance
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {trek.stats.dist}<span className="text-lg text-stone-500 ml-1">km</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Icons.StatsElevation className="w-3 h-3" /> Dénivelé +
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {Math.round(trek.stats.dplus / 1000)}<span className="text-lg text-stone-500 ml-1">km</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Icons.StatsDuration className="w-3 h-3" /> Durée
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {trek.stats.days}<span className="text-lg text-stone-500 ml-1">j</span>
                </div>
              </div>
               <div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Difficulté</div>
                <div className="flex items-center gap-2">
                   <div className={cn("text-3xl font-black font-mono", isSpirit ? "text-green-400" : "text-orange-500")}>
                     {trek.stats.difficulty}<span className="text-lg text-stone-500">/5</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 mt-16">
        
        {/* Intro */}
        <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
            <div className="md:w-2/3">
                <h2 className="text-3xl font-bold text-stone-900 mb-4">{trek.subtitle || "L'Aventure commence"}</h2>
                <p className="text-lg text-stone-600 leading-relaxed">
                    {trek.description}
                </p>
            </div>
            <div className="md:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <div className="text-xs font-bold uppercase text-stone-400 mb-3 tracking-widest">
                    {isSpirit ? "Esprit Pèlerin" : "Expertise Alpine"}
                </div>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium text-stone-700">
                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]", isSpirit ? "bg-blue-100 text-blue-700" : colors.successBg)}>✓</span>
                        {isSpirit ? "Crédential requise" : "Terrain technique"}
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium text-stone-700">
                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]", isSpirit ? "bg-blue-100 text-blue-700" : colors.successBg)}>✓</span>
                        {isSpirit ? "Patrimoine UNESCO" : "Passages aériens"}
                    </li>
                </ul>
            </div>
        </div>

        {/* GRILLE PRINCIPALE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LISTE DES ÉTAPES */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Icons.Map className="w-5 h-5 text-stone-400" />
                    Itinéraire Détaillé
                </h2>
                <span className={cn("text-xs px-3 py-1 rounded-full font-bold", colors.bgLight, colors.accent)}>
                    {trek.stages.length} Étapes
                </span>
            </div>

            <div className="space-y-0 relative border-l-2 border-stone-200 ml-3">
                {trek.stages.map((stage) => (
                  <div 
                    key={stage.id} 
                    className="relative pl-8 pb-8 last:pb-0"
                  >
                    {/* Point Timeline */}
                    <div className={cn(
                      "absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-stone-50 z-10 bg-stone-300 transition-colors duration-300",
                      selectedStage?.id === stage.id ? colors.dot : "group-hover:bg-stone-400"
                    )} />
                    
                    <StageCard 
                        stage={stage} 
                        theme={trek.theme || 'orange'} 
                        onClick={() => setSelectedStage(stage)}
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* SIDEBAR INFO */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* MÉTÉO */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase text-stone-400 tracking-widest flex items-center gap-2">
                        <Sun className="w-4 h-4" /> Météo Moyenne
                    </h3>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Simulée</span>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                        <span className="block text-2xl font-black text-stone-800">{currentMonthData.tempDay}°</span>
                        <span className="text-xs text-stone-500 font-medium uppercase">Jour</span>
                    </div>
                    <div className="w-px h-8 bg-stone-200"></div>
                    <div className="text-center">
                        <span className="block text-2xl font-black text-stone-400">{currentMonthData.tempNight}°</span>
                        <span className="text-xs text-stone-500 font-medium uppercase">Nuit</span>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-stone-600">
                            <CloudRain className="w-4 h-4 text-stone-400" /> Jours de pluie
                        </span>
                        <span className="font-bold text-stone-900">{currentMonthData.rainDays}j</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(currentMonthData.rainDays / 30) * 100}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between text-sm mt-2">
                        <span className="flex items-center gap-2 text-stone-600">
                            <Sun className="w-4 h-4 text-stone-400" /> Ensoleillement
                        </span>
                        <span className="font-bold text-stone-900">{currentMonthData.sunHours}h /j</span>
                    </div>
                </div>

                <div className="border-t border-stone-100 pt-4">
                    <p className="text-xs font-bold text-stone-400 mb-2 uppercase">Période Idéale (Cliquer)</p>
                    <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
                        {monthlyWeather.map((m) => {
                            const isRecommended = trek.bestSeason.includes(m.month);
                            return (
                                <button
                                    key={m.month}
                                    onClick={() => setSelectedMonth(m)}
                                    className={cn(
                                        "px-2 py-1 rounded text-[10px] font-bold transition-all border",
                                        selectedMonth?.month === m.month 
                                            ? "bg-stone-900 text-white border-stone-900" 
                                            : isRecommended
                                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                                                : "bg-white text-stone-400 border-stone-100 opacity-50"
                                    )}
                                >
                                    {m.month.slice(0, 3)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* LOGISTIQUE */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-widest">Logistique & Accès</h3>
                
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg mb-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-stone-600">
                        <Icons.MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-900">Point de Départ</p>
                        <p className="text-[10px] text-stone-500">{trek.accessDetails?.primaryLocation || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg mb-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-stone-600">
                        <TransportIconComponent className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-900">Accès Principal</p>
                        <p className="text-[10px] text-stone-500">
                            {AccessText(trek.primaryAccess)}
                            {trek.accessDetails?.airportCode && ` (${trek.accessDetails.airportCode})`}
                        </p>
                    </div>
                </div>
                
                {trek.accessDetails?.advice && (
                    <p className="text-xs text-stone-600 mt-2 p-2 border-l-2 border-stone-300">
                        *Conseil : {trek.accessDetails.advice}
                    </p>
                )}
            </div>
            
            {/* EXPERTISE */}
            <div className={cn("p-6 rounded-2xl shadow-lg", "bg-stone-900 text-white")}>
              <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-widest flex items-center gap-2">
                  <Icons.Logo className="w-4 h-4" /> Expertise YETI
              </h3>
              {trek.expert && (
                  <div className="flex items-center gap-4 border-b border-stone-800 pb-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center text-xl font-black text-white">
                          {trek.expert.name[0]}
                      </div>
                      <div>
                          <p className="text-sm font-bold text-white">{trek.expert.name}</p>
                          <p className="text-xs text-stone-400">{trek.expert.title}</p>
                      </div>
                  </div>
              )}
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm font-medium text-stone-300">
                  <span className={cn("w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]", colors.darkSuccessBg, colors.darkSuccessText)}>✓</span>
                  <span>Point culminant : {trek.stats.maxAltitude}m</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* === FOOTER DECK (REPENSÉ) === */}
      {/* Barre flottante "Glassmorphism" fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-stone-200 shadow-[0_-5px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
            
            {/* 1. GAUCHE: Navigation */}
            <Link 
                href="/treks" 
                className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-stone-900 text-white shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
                <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold hidden sm:inline">Retour Catalogue</span>
                <span className="text-sm font-bold sm:hidden">Retour</span>
            </Link>

            {/* 2. CENTRE: Projet (Seulement Desktop) */}
            <div className="hidden md:flex flex-col items-center">
               <div className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-1">Mon Projet</div>
               <div className="w-32 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                   <div className={cn("h-full w-0 rounded-full transition-all duration-500", colors.bgAccent)}></div>
               </div>
            </div>

            {/* 3. DROITE: Actions Principales */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setShowMapModal(true)} 
                    className={cn(
                        "p-3 sm:px-6 sm:py-3 rounded-xl font-bold text-white transition hover:opacity-90 shadow-lg flex items-center gap-2",
                        colors.bgAccent
                    )}
                    title="Voir la carte"
                >
                    <Icons.MapPin className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">Carte</span>
                </button>

                <Link
                    href="/basecamp/packbuilder"
                    className="p-3 sm:px-6 sm:py-3 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition shadow-sm flex items-center gap-2"
                    title="Préparer mon sac"
                >
                    <Icons.NavPack className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-bold">Mon Sac</span>
                </Link>
            </div>
        </div>
      </div>

      {/* MODALES */}
      {selectedStage && (
        <StageDetailsModal 
          stage={selectedStage} 
          trekTheme={trek.theme || 'orange'} 
          onClose={() => setSelectedStage(null)} 
        />
      )}

      {showMapModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                        <Icons.Map className="w-5 h-5" />
                        Carte Globale : {trek.name}
                    </h2>
                    <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-stone-200 rounded-full transition">
                        <Icons.Close className="w-6 h-6 text-stone-500" />
                    </button>
                </div>
                <div className="flex-1 bg-stone-100 flex items-center justify-center relative">
                    {/* Placeholder Carte */}
                    <div className="text-center space-y-4">
                         <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Icons.MapPin className="w-10 h-10 text-stone-400" />
                         </div>
                         <p className="text-stone-500 font-medium">Carte interactive globale à venir...</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}