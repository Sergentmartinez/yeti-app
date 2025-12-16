// app/basecamp/routes/page.tsx (CODE INTÉGRAL FINAL CORRIGÉ)
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

// --- MOCK DE DONNÉES ---

interface RouteSummary {
    id: string;
    name: string;
    distance: number; // km
    elevation: number; // m
    dateCompleted: string;
    isJubilee: boolean; // Marque si c'est un trek "Trophée"
    slug: string;
}

const MOCK_ROUTES: RouteSummary[] = [
    { id: 'gr20', name: 'GR20 (Corse)', distance: 180, elevation: 11000, dateCompleted: '2024-08-15', isJubilee: true, slug: 'gr20-corse' },
    { id: 'tmb', name: 'Tour du Mont-Blanc', distance: 170, elevation: 10000, dateCompleted: '2023-07-20', isJubilee: false, slug: 'tmb-suisse' },
    { id: 'camino', name: 'Camino Francés (Partiel)', distance: 350, elevation: 5000, dateCompleted: '2023-05-01', isJubilee: true, slug: 'camino-frances' },
    { id: 'lac-annecy', name: 'Tour du Lac d\'Annecy', distance: 40, elevation: 200, dateCompleted: '2024-09-10', isJubilee: false, slug: 'lac-annecy' },
];

// --- COMPOSANTS INTERNES ---

const JubileeCard = ({ route }: { route: RouteSummary }) => {
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 shadow-sm transition hover:shadow-md hover:border-orange-300">
            <Icons.Trophy className="w-8 h-8 text-yellow-600 shrink-0" />
            <div className-="flex-1">
                <Link href={`/treks/${route.slug}`} className="text-lg font-bold text-stone-900 hover:text-orange-600 transition">
                    {route.name}
                </Link>
                <p className="text-sm text-stone-500">
                    Complété le {route.dateCompleted}. {route.distance} km | {route.elevation.toLocaleString()} m D+.
                </p>
            </div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">JUBILÉ</span>
        </div>
    );
};

const RouteItem = ({ route }: { route: RouteSummary }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:border-blue-300 transition">
            <div className="flex-1">
                <Link href={`/treks/${route.slug}`} className="text-base font-bold text-stone-900 hover:text-blue-600 transition">
                    {route.name}
                </Link>
                <p className="text-xs text-stone-500 mt-0.5">
                    {route.distance} km | {route.elevation.toLocaleString()} m D+
                </p>
            </div>
            <div className="flex items-center gap-4">
                {/* CORRECTION TYPAGE: Emballage de Icons.Trophy avec title */}
                {route.isJubilee && (
                    <span title="Trophée JUBILÉ" className="cursor-help">
                        <Icons.Trophy className="w-4 h-4 text-yellow-500" />
                    </span>
                )}
                <Link href={`/basecamp/packbuilder?trek=${route.slug}`} className="text-xs text-stone-500 hover:text-orange-600 font-medium flex items-center gap-1">
                    <Icons.NavPack className="w-3 h-3" />
                    Pack
                </Link>
                <Icons.ChevronRight className="w-4 h-4 text-stone-400" />
            </div>
        </div>
    );
};


// --- COMPOSANT PRINCIPAL ---

export default function RoutesPage() {
    const [searchTerm, setSearchTerm] = useState(''); 
    
    const filteredRoutes = useMemo(() => {
        return MOCK_ROUTES.filter(route => 
            route.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => b.dateCompleted.localeCompare(a.dateCompleted)); 
    }, [searchTerm]);

    const jubileeRoutes = useMemo(() => filteredRoutes.filter(r => r.isJubilee), [filteredRoutes]);

    return (
        <main className="min-h-screen bg-stone-50 p-6 lg:p-10 ml-64 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
                    <Icons.NavRoutes className="w-6 h-6 text-orange-600" />
                    Mes Routes & Trophées
                </h1>
                <p className="text-stone-500 mt-1">Gère tes parcours enregistrés et tes réussites (JUBILÉS).</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLONNE GAUCHE : Listes (Routes & Jubilés) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Bar de Recherche et Filtre */}
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
                        <Icons.Search className="w-5 h-5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une route ou une ville..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400"
                            value={searchTerm}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue !== searchTerm) {
                                    setSearchTerm(newValue);
                                }
                            }}
                        />
                        {/* CORRECTION TYPAGE: Emballage de Icons.Filter avec title */}
                        <span title="Filtrer les routes" className="cursor-pointer">
                            <Icons.Filter className="w-5 h-5 text-stone-500 hover:text-orange-600 transition" />
                        </span>
                    </div>

                    {/* Section JUBILÉ */}
                    {jubileeRoutes.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                <Icons.Trophy className="w-6 h-6 text-yellow-600" />
                                JUBILÉ ({jubileeRoutes.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {jubileeRoutes.map(route => (
                                    <JubileeCard key={route.id} route={route} />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Section Routes Enregistrées */}
                    <div className="space-y-4 pt-4 border-t border-stone-200">
                        <h2 className="text-xl font-bold text-stone-900">
                            Toutes les Routes ({filteredRoutes.length})
                        </h2>
                        <div className="space-y-3">
                            {filteredRoutes.map(route => (
                                <RouteItem key={route.id} route={route} />
                            ))}
                        </div>
                    </div>

                    {filteredRoutes.length === 0 && (
                        <p className="text-center text-stone-500 p-8 bg-white rounded-xl border border-stone-200">
                            Aucune route trouvée. Essayez une recherche différente ou <Link href="/treks" className="text-orange-600 hover:underline">explorez nos treks</Link>.
                        </p>
                    )}

                </div>

                {/* COLONNE DROITE : Carte & Statistiques */}
                <div className="lg:col-span-1 space-y-8 sticky top-10">
                    
                    {/* Carte Mock */}
                    <div className="p-6 bg-stone-950 rounded-2xl shadow-xl border border-stone-800 text-white min-h-[350px]">
                        <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-widest flex items-center gap-2">
                            <Icons.Map className="w-4 h-4 text-orange-600" />
                            Carte (Mock)
                        </h3>
                        <div className="h-64 flex items-center justify-center bg-stone-800 rounded-lg border-2 border-dashed border-stone-700">
                             <Icons.Compass className="w-12 h-12 text-stone-600 opacity-50" />
                        </div>
                    </div>

                    {/* Stats de l'Aventurier */}
                    <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                         <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                            <Icons.StatsDistance className="w-5 h-5 text-blue-600" />
                            Statistiques Globales
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                <span className="text-stone-600">Distance Totale</span>
                                <span className="font-bold text-stone-900">740 km</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                <span className="text-stone-600">Dénivelé Total</span>
                                <span className="font-bold text-stone-900">26 200 m</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-stone-600">Jours de Trek</span>
                                <span className="font-bold text-stone-900">30 Jours</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}