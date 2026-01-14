"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Filter, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { GarageItemCard } from "@/components/garage/GarageItemCard";
import { GearItem } from "@/types/database";

// === MOCK DATA FOR DEMO ===
const MOCK_ITEMS: GearItem[] = [
    {
        id: "tente-1",
        user_id: "demo",
        name: "Hubba Hubba NX",
        weight_g: 1720,
        category: "shelter",
        status: "owned",
        brand: "MSR",
        created_at: new Date().toISOString()
    },
    {
        id: "duvet-1",
        user_id: "demo",
        name: "Spark SpII",
        weight_g: 560,
        category: "sleep",
        status: "owned",
        brand: "Sea to Summit",
        created_at: new Date().toISOString()
    },
    {
        id: "matelas-1",
        user_id: "demo",
        name: "NeoAir XLite",
        weight_g: 340,
        category: "sleep",
        status: "owned",
        brand: "Therm-a-Rest",
        created_at: new Date().toISOString()
    },
    {
        id: "rechaud-1",
        user_id: "demo",
        name: "JetBoil MiniMo",
        weight_g: 415,
        category: "kitchen",
        status: "owned",
        brand: "JetBoil",
        created_at: new Date().toISOString()
    },
    {
        id: "filtre-1",
        user_id: "demo",
        name: "Sawyer Squeeze",
        weight_g: 85,
        category: "kitchen",
        status: "owned",
        brand: "Sawyer",
        created_at: new Date().toISOString()
    },
     {
        id: "sac-1",
        user_id: "demo",
        name: "Talon 44",
        weight_g: 1100,
        category: "other",
        status: "owned",
        brand: "Osprey",
        created_at: new Date().toISOString()
    }
];

export default function GaragePage() {
    // State pour la démo "Conflit"
    const [simulateConflict, setSimulateConflict] = useState(true);

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            
            {/* === HEADER === */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/95 glass">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="font-bold">Mon Garage</span>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
                            <Search className="w-4 h-4 text-zinc-500 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Rechercher..." 
                                className="bg-transparent text-sm focus:outline-none w-48"
                            />
                        </div>
                        <button className="p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* === MAIN CONTENT === */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            Stock Matériel
                        </h1>
                        <p className="text-zinc-400">
                            Gérez votre inventaire global. Les items ici sont disponibles pour tous vos projets.
                        </p>
                    </div>

                    {/* DEMO TOGGLE */}
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                            <AlertTriangle className="w-4 h-4" />
                            Mode Démo
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={simulateConflict}
                                    onChange={(e) => setSimulateConflict(e.target.checked)} 
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </div>
                            <span className="text-sm font-medium text-white">Simuler Conflit</span>
                        </label>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                    {['Tous', 'Couchage', 'Abri', 'Cuisine', 'Vêtements', 'Tech'].map((filter, i) => (
                        <button 
                            key={filter}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${i === 0 ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {MOCK_ITEMS.map((item) => {
                        // Simulation du conflit sur la Tente Hubba Hubba si activé
                        const isConflict = simulateConflict && item.name.includes("Hubba Hubba");

                        return (
                            <GarageItemCard 
                                key={item.id} 
                                item={item} 
                                isConflict={isConflict}
                            />
                        );
                    })}
                </div>

            </main>
        </div>
    );
}
