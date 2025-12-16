// app/basecamp/gear/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { GearItemCard } from "@/components/pack";
import { GEAR_ITEMS, GEAR_CATEGORIES, getOwnedGear } from "@/lib/gear"; // Import des utilitaires Gear
import { GearItem } from "@/types"; // Nécessaire pour le type GearItem

// --- Composant Principal ---

export default function GearPage() {
    
    // État pour la catégorie de tri et la recherche
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showOwnedOnly, setShowOwnedOnly] = useState<boolean>(false);

    // Filtrer l'inventaire complet en fonction des états
    const filteredItems = useMemo(() => {
        let items = GEAR_ITEMS;

        // 1. Filtrer par possession (Owned Only)
        if (showOwnedOnly) {
            items = getOwnedGear(items);
        }

        // 2. Filtrer par recherche
        if (searchTerm) {
            return items.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 3. Filtrer par catégorie active
        if (activeCategory) {
            return items.filter(item => item.category === activeCategory);
        }

        return items;
    }, [searchTerm, activeCategory, showOwnedOnly]);

    const activeCategoryData = GEAR_CATEGORIES.find(c => c.id === activeCategory);
    
    // Simuler le statut de possession (puisque ce n'est pas une page d'édition de pack)
    const isItemOwned = (itemId: string) => GEAR_ITEMS.find(item => item.id === itemId)?.owned || false;

    return (
        <div className="min-h-screen bg-stone-50 pb-20 font-sans">
            
            {/* HEADER */}
            <header className="bg-white border-b border-stone-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
                        <Icons.NavInventory className="w-7 h-7 text-blue-600" />
                        Mon Inventaire
                    </h1>
                    <Link href="/basecamp" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2">
                         <Icons.ArrowLeft className="w-4 h-4" /> Retour Basecamp
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 mt-10">

                {/* Barre de Recherche et Filtres */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-200 mb-8">
                    
                    {/* 1. Recherche */}
                    <div className="flex items-center border border-stone-300 rounded-xl px-4 py-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500">
                        <Icons.Search className="w-5 h-5 text-stone-400 shrink-0" /> 
                        <input
                            type="text"
                            placeholder="Rechercher un article ou une marque..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setActiveCategory(""); 
                            }}
                            className="flex-1 ml-3 text-stone-900 placeholder-stone-400 focus:outline-none bg-transparent text-lg font-medium"
                        />
                    </div>
                    
                    {/* 2. Filtres & Catégories */}
                    <div className="flex flex-wrap gap-2 mt-4 border-t border-stone-100 pt-4 items-center">
                        
                        <span className="text-xs font-bold uppercase text-stone-500 mr-2">Catégories :</span>
                        
                        {GEAR_CATEGORIES.map(category => {
                            const Icon = Icons[category.icon as keyof typeof Icons];
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setActiveCategory(category.id === activeCategory ? "" : category.id); // Toggle
                                        setSearchTerm("");
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition",
                                        activeCategory === category.id && !searchTerm
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                    )}
                                    disabled={!!searchTerm}
                                >
                                    <Icon className="w-4 h-4 shrink-0" /> 
                                    {category.name}
                                </button>
                            );
                        })}

                        {/* Bouton Filtre Possession */}
                        <button
                            onClick={() => setShowOwnedOnly(!showOwnedOnly)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 ml-auto rounded-full text-xs font-bold transition",
                                showOwnedOnly
                                    ? "bg-green-600 text-white shadow-md shadow-green-200"
                                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            )}
                        >
                            <Icons.Check className="w-4 h-4 shrink-0" /> 
                            Articles Possédés ({getOwnedGear(GEAR_ITEMS).length})
                        </button>
                    </div>
                </div>

                {/* Liste des Articles */}
                <div className="mb-6">
                    <h2 className="text-3xl font-black text-stone-900">
                        {showOwnedOnly ? "Votre Équipement Possédé" : (activeCategoryData ? activeCategoryData.name : "Inventaire Complet")}
                    </h2>
                    <p className="text-sm text-stone-500 mt-1">
                        {filteredItems.length} article(s) trouvé(s).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <GearItemCard
                            key={item.id}
                            item={item}
                            // Dans l'inventaire, 'isInPack' est remplacé par 'isOwned'
                            isInPack={isItemOwned(item.id)} 
                            onToggle={() => {
                                // Dans la V1, nous ne permettons pas d'éditer l'inventaire ici.
                                console.log(`Tentative d'édition de la propriété 'owned' pour ${item.name}`);
                                alert(`Fonction d'édition de l'inventaire (V2) pour ${item.name}.`);
                            }}
                        />
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-2xl shadow-inner border border-stone-200">
                        <Icons.Info className="w-8 h-8 mx-auto text-stone-400 mb-4" />
                        <p className="text-lg font-medium text-stone-700">Aucun article ne correspond à ce filtre.</p>
                        <p className="text-sm text-stone-500 mt-1">
                            Ajustez votre recherche ou désactivez le filtre &quot;Possédés&quot;.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}