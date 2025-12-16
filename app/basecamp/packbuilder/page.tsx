// app/basecamp/packbuilder/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getAllTreks, MOCK_USER, getOneTrek, Trek } from "@/lib/data"; // Import Trek de lib/data
import { analyzePack, SherpaReport, SherpaWarning } from "@/lib/sherpa/rules";
import { generateLLMAnalysis } from "@/lib/sherpa/engine"; 
import { GEAR_ITEMS, GEAR_CATEGORIES, calculateTotalWeight, formatWeight } from "@/lib/gear";
import { GearItemCard, WeightGauge } from "@/components/pack";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { GearItem } from "@/types";

// --- HELPERS SHERPA ---

const getSeverityStyle = (severity: SherpaWarning["severity"]) => {
  switch (severity) {
    case "high":
      return { icon: Icons.Warning, color: "text-red-600", bg: "bg-red-50", border: "border-red-300" }; 
    case "medium":
      return { icon: Icons.Warning, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300" };
    default:
      return { icon: Icons.Info, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300" };
  }
};

// --- COMPOSANT PRINCIPAL ---

export default function PackBuilderPage() {
  const MOCK_TREK_SLUG = "gr20-corse"; 
  const MOCK_TREK = useMemo(() => getOneTrek(MOCK_TREK_SLUG)!, [MOCK_TREK_SLUG]);

  const initialPack = useMemo(() => {
    const categories: Record<string, GearItem[]> = {};
    GEAR_ITEMS.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    return GEAR_CATEGORIES.map(category => {
      const lightestItem = categories[category.id]?.sort((a, b) => a.weight - b.weight)[0];
      return lightestItem;
    }).filter(Boolean) as GearItem[];
  }, []);
  
  const [pack, setPack] = useState<GearItem[]>(initialPack);
  const [activeCategory, setActiveCategory] = useState<string>("shelter");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [llmAnalysis, setLlmAnalysis] = useState<{ summary: string, recommendations: { item: string, reason: string }[] } | null>(null);
  const [isLoadingLlm, setIsLoadingLlm] = useState(false);
  
  const totalWeight = useMemo(() => calculateTotalWeight(pack), [pack]);

  useEffect(() => {
    if (!pack.length || !MOCK_TREK) {
      setLlmAnalysis(null);
      return;
    }
    
    const fetchAnalysis = async () => {
      setIsLoadingLlm(true);
      try {
        // Casting 'as any' pour éviter les conflits de types stricts entre lib/data et types/index si présents
        const analysis = await generateLLMAnalysis(pack, MOCK_TREK as any);
        setLlmAnalysis(analysis);
      } catch (error) {
        console.error("Erreur lors de l'analyse LLM:", error);
        setLlmAnalysis({ summary: "Erreur de connexion au moteur Sherpa. Veuillez réessayer.", recommendations: [] });
      } finally {
        setIsLoadingLlm(false);
      }
    };

    const debounceTimeout = setTimeout(fetchAnalysis, 500);
    return () => clearTimeout(debounceTimeout); 
  }, [pack, MOCK_TREK]);

  // --- LOGIQUE SHERPA LAYER 1 (Règles statiques) ---
  const sherpaReport = useMemo(() => {
    if (!MOCK_TREK) return { isSafe: false, warnings: [], score: 0 } as SherpaReport;
    // Casting 'as any' pour compatibilité immédiate
    return analyzePack(pack, MOCK_TREK as any);
  }, [pack, MOCK_TREK]);
  // --- FIN LOGIQUE SHERPA LAYER 1 ---

  const availableItems = useMemo(() => {
    const filteredBySearch = GEAR_ITEMS.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (searchTerm) {
      return filteredBySearch;
    }

    return filteredBySearch.filter(item => item.category === activeCategory);
  }, [searchTerm, activeCategory]);

  const toggleItemInPack = (item: GearItem) => {
    setPack(prevPack => {
      const isPresent = prevPack.some(i => i.id === item.id);
      if (isPresent) {
        return prevPack.filter(i => i.id !== item.id);
      } else {
        return [...prevPack, item];
      }
    });
  };

  const isItemInPack = (itemId: string) => pack.some(item => item.id === itemId);

  const activeCategoryData = GEAR_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans">
      
      {/* HEADER FIXE */}
      <header className="sticky top-0 bg-white border-b border-stone-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-stone-900">
            Pack Builder <span className="text-stone-400">/</span> {MOCK_TREK?.name || 'Chargement...'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-stone-600 text-sm font-medium">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isLoadingLlm ? "bg-amber-500 animate-pulse" : (sherpaReport.isSafe ? "bg-green-500" : "bg-red-600")
                )}></span>
                <span>Analyse {isLoadingLlm ? "en cours..." : "terminée"}</span>
            </div>
            <Link href="/basecamp/profile" className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg">
              {MOCK_USER.username[0]}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* === COLONNE DROITE (Infos & Stats) === */}
          <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
            
            {/* 1. JAUGE DE POIDS */}
            <div className="p-6 bg-stone-950 rounded-2xl shadow-xl border border-stone-800 sticky top-24 z-30">
              <h3 className="text-xs font-bold uppercase text-stone-400 mb-6 tracking-widest flex items-center justify-between">
                <span>Poids Total du Pack</span>
                <Icons.StatsDistance className="w-4 h-4 text-orange-600" />
              </h3>
              <WeightGauge weight={totalWeight} /> 
              <div className="flex justify-between mt-4 pt-4 border-t border-stone-800">
                <div>
                  <p className="text-sm font-medium text-stone-400">Poids Optimal</p>
                  <p className="text-lg font-black font-mono text-white">12,0 kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-400">Poids Max</p>
                  <p className="text-lg font-black font-mono text-red-500">15,0 kg</p>
                </div>
              </div>
            </div>

            {/* 2. BOUTON D'EXPORT ROADBOOK */}
            <a 
                href={`/api/export/roadbook?slug=${MOCK_TREK_SLUG}`}
                download={`YETI_Roadbook_${MOCK_TREK_SLUG}.txt`}
                className={cn(
                    "flex items-center justify-center gap-2 w-full py-3 text-white font-bold text-sm rounded-xl shadow-lg transition hover:bg-green-700",
                    sherpaReport.isSafe ? "bg-green-600" : "bg-stone-500 cursor-not-allowed" 
                )}
                target="_blank" 
                rel="noopener noreferrer"
                title={sherpaReport.isSafe ? "Télécharger le Roadbook complet" : "Résolvez les alertes de sécurité pour l'export"}
            >
                <Icons.Download className="w-4 h-4" />
                {sherpaReport.isSafe ? "Télécharger Roadbook (PDF V1)" : "Résolvez les Alertes Securité"}
            </a>


            {/* 3. RAPPORT SHERPA LLM (Layer 2) */}
            <div className="p-6 bg-white rounded-2xl shadow-xl border border-stone-200">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
                    <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                        <Icons.Yeti className="w-5 h-5 text-orange-600" /> 
                        Sherpa LLM (Analyse Avancée)
                    </h3>
                </div>
                
                {isLoadingLlm && (
                    <div className="text-center p-6 text-sm text-stone-600 animate-pulse">
                        <Icons.Gauge className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                        {/* 🚨 CORRECTION : Apostrophe échappée */}
                        L&apos;IA Sherpa est en cours d&apos;analyse...
                    </div>
                )}

                {llmAnalysis && !isLoadingLlm && (
                    <div className="space-y-4">
                        <p className="text-sm text-stone-700 leading-relaxed italic">
                            {llmAnalysis.summary}
                        </p>

                        {llmAnalysis.recommendations.length > 0 && (
                            <div className="border-t border-stone-100 pt-4">
                                <h4 className="text-xs font-bold uppercase text-stone-500 mb-2 tracking-wider">
                                    Recommandations Personnalisées
                                </h4>
                                <ul className="space-y-2">
                                    {llmAnalysis.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2 text-xs">
                                            <Icons.Star className="w-3 h-3 text-blue-500 shrink-0 mt-1" />
                                            <span className="text-stone-700">
                                                <span className="font-bold">{rec.item}:</span> {rec.reason}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                
                {!llmAnalysis && !isLoadingLlm && (
                    <div className="text-center p-6 text-sm text-stone-600">
                        <Icons.Info className="w-6 h-6 mx-auto mb-2 text-stone-400" />
                        Ajoutez des articles pour démarrer l&apos;analyse approfondie par l&apos;IA.
                    </div>
                )}
            </div>

            {/* 4. RAPPORT SHERPA STATIQUE (Layer 1) */}
            <div className="p-6 bg-white rounded-2xl shadow-xl border border-stone-200">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
                    <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                        <Icons.Layers className="w-5 h-5 text-orange-600" /> 
                        Règles Statiques (Layer 1)
                    </h3>
                    <span className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full",
                        sherpaReport.isSafe ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                        {sherpaReport.isSafe ? "Sécurité OK" : "Risque Élevé"}
                    </span>
                </div>
                
                <div className="text-center my-6">
                    <p className="text-xs font-bold uppercase text-stone-400">Score de Confiance</p>
                    <p 
                        className="text-6xl font-black font-mono mt-1" 
                        style={{ color: sherpaReport.score > 75 ? '#10b981' : sherpaReport.score > 50 ? '#f59e0b' : '#ef4444' }}
                    >
                        {sherpaReport.score}
                    </p>
                    <p className="text-sm text-stone-600">
                        {sherpaReport.score > 90 ? "Excellent ! Le pack est parfait." : sherpaReport.score > 70 ? "Bonne base. Quelques réglages." : "Ajustements critiques nécessaires."}
                    </p>
                </div>

                <h4 className="text-xs font-bold uppercase text-stone-400 mt-8 mb-3 tracking-wider">
                    {sherpaReport.warnings.length} Alertes & Recommandations Statiques
                </h4>

                {sherpaReport.warnings.length > 0 ? (
                    <div className="space-y-3">
                        {sherpaReport.warnings.map((warning) => {
                            const { icon: Icon, color, bg, border } = getSeverityStyle(warning.severity);
                            return (
                                <div key={warning.id} className={cn("flex items-start gap-3 p-3 rounded-lg border", bg, border)}>
                                    <Icon className={cn("w-4 h-4 mt-1 shrink-0", color)} /> 
                                    <div className="text-xs">
                                        <p className="font-bold text-stone-900 capitalize">{warning.category} ({warning.severity})</p>
                                        <p className="text-stone-700 mt-0.5">{warning.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-green-700 p-4 bg-green-50 rounded-lg border border-green-200">
                        Aucune alerte Layer 1 détectée.
                    </p>
                )}
            </div>

            {/* 5. RÉSUMÉ DU PACK (inchangé) */}
            <div className="p-6 bg-white rounded-2xl shadow-xl border border-stone-200">
                 {/* ... Contenu du résumé ... */}
                 <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-stone-600">Articles</span>
                    <span className="text-stone-900">{pack.length}</span>
                 </div>
            </div>


          </div>

          {/* === COLONNE GAUCHE (Sélection Matériel) === */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            
            <div className="mb-6">
                <h2 className="text-3xl font-black text-stone-900">
                    {searchTerm 
                        ? `Résultats de recherche pour "${searchTerm}"` 
                        : activeCategoryData 
                            ? activeCategoryData.name
                            : "Inventaire Complet"
                    }
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                    Sélectionnez les articles à ajouter à votre pack.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableItems.map(item => (
                <GearItemCard
                  key={item.id}
                  item={item}
                  isInPack={isItemInPack(item.id)}
                  onToggle={() => toggleItemInPack(item)}
                />
              ))}
            </div>

            {availableItems.length === 0 && (
                <div className="text-center p-12 bg-white rounded-2xl shadow-inner border border-stone-200">
                    <Icons.Info className="w-8 h-8 mx-auto text-stone-400 mb-4" />
                    <p className="text-lg font-medium text-stone-700">Aucun article trouvé.</p>
                    <p className="text-sm text-stone-500 mt-1">
                        Essayez un autre mot-clé ou sélectionnez une autre catégorie.
                    </p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}