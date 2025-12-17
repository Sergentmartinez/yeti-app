"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Map, ArrowRight, Info, Mountain } from 'lucide-react'; // Ajout de Mountain ici au cas où
import { cn } from '@/lib/utils';
import { getAllTreks } from '@/lib/data'; 
import { Trek } from '@/types'; 
// Si le composant Logo n'existe pas, commentez la ligne ci-dessous
import { Logo } from "@/components/Logo"; 

const TrekCard = ({ trek }: { trek: Trek }) => {
    const nameParts = trek.name.split(' ');
    const firstWord = nameParts[0];
    const restOfName = nameParts.slice(1).join(' ');
    const isSpirit = trek.theme === 'spirit';
    
    // Couleurs dynamiques
    const themeColor = isSpirit ? 'text-blue-500' : 'text-orange-500';
    const hoverBorder = isSpirit ? 'hover:border-blue-500/50' : 'hover:border-orange-500/50';
    const hoverShadow = isSpirit ? 'hover:shadow-blue-900/20' : 'hover:shadow-orange-900/20';
    const arrowBg = isSpirit ? 'group-hover:bg-blue-600' : 'group-hover:bg-orange-600';

    const getDifficultyColor = (score: number) => {
        if (score >= 4.5) return 'text-red-500';
        if (score >= 3.5) return 'text-orange-500';
        return 'text-green-500';
    };

    return (
        <Link 
            href={`/treks/${trek.slug}`}
            className={cn(
                "group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2",
                hoverBorder, hoverShadow
            )}
        >
            <div className="relative h-64 w-full overflow-hidden">
                {/* AJOUT DE unoptimized POUR EVITER LE CRASH */}
                <Image
                    src={trek.heroImage}
                    alt={trek.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized 
                />
                {/* Correction: bg-gradient-to-t est plus sûr que bg-linear-to-t */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                
                <div className="absolute top-4 left-4 bg-zinc-950/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ouvert</span>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight leading-none">
                    {firstWord} <span className={themeColor}>{restOfName}</span>
                </h3>

                <p className="text-sm text-zinc-500 mb-8 line-clamp-2 leading-relaxed">{trek.description}</p>

                <div className="grid grid-cols-4 gap-4 mb-8 border-t border-b border-white/5 py-5">
                    <div className="text-center">
                        <span className="block text-[10px] text-zinc-600 uppercase font-bold mb-1 tracking-wider">Distance</span>
                        <span className="text-xl text-white font-black">{trek.stats.dist}<span className="text-xs font-normal text-zinc-600 ml-1">km</span></span>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <span className="block text-[10px] text-zinc-600 uppercase font-bold mb-1 tracking-wider">D+</span>
                        <span className="text-xl text-white font-black">{Math.round(trek.stats.dplus/1000)}<span className="text-xs font-normal text-zinc-600 ml-1">k</span></span>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <span className="block text-[10px] text-zinc-600 uppercase font-bold mb-1 tracking-wider">Durée</span>
                        <span className="text-xl text-white font-black">{trek.stats.days}<span className="text-xs font-normal text-zinc-600 ml-1">j</span></span>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <span className="block text-[10px] text-zinc-600 uppercase font-bold mb-1 tracking-wider">Niveau</span>
                        <span className={cn("text-xl font-black", getDifficultyColor(trek.stats.difficulty))}>
                            {trek.stats.difficulty}<span className="text-xs font-normal text-zinc-600 ml-1">/5</span>
                        </span>
                    </div>
                </div>

                <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs font-medium text-zinc-500 flex items-center gap-2 uppercase tracking-wide">
                        <Map className="w-3 h-3 text-zinc-600" />
                        {trek.location}
                    </span>
                    <span className={cn("w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white transition-colors", arrowBg)}>
                        <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default function TreksPage() {
    const [filter, setFilter] = useState('all');
    // Sécurité si getAllTreks renvoie undefined
    const allTreks = getAllTreks ? getAllTreks() : [];

    const filteredTreks = allTreks.filter(trek => {
        if (filter === 'all') return true;
        if (filter === 'sportif') return trek.stats.difficulty >= 4;
        if (filter === 'modere') return trek.stats.difficulty >= 3 && trek.stats.difficulty < 4;
        if (filter === 'accessible') return trek.stats.difficulty < 3;
        return true;
    });

    return (
        <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100">
            
            <nav className="absolute top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                
                    {/* Si Logo n'existe pas, on met un texte simple pour éviter le crash */}
                    <Link href="/" className="font-bold text-2xl tracking-tighter">YETI</Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-200">
                        <Link href="/treks" className="text-white font-bold transition-colors drop-shadow-md">
                            Treks
                        </Link>
                        <Link href="/basecamp" className="hover:text-white transition-colors drop-shadow-md">
                            Basecamp
                        </Link>
                        <Link href="/basecamp/packbuilder" className="hover:text-white transition-colors drop-shadow-md">
                            Pack Builder
                        </Link>
                    </div>

                    <Link href="/treks" className="bg-white text-zinc-950 px-5 py-2 text-sm font-bold tracking-tight rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-black/20">
                        Commencer
                    </Link>
                </div>
            </nav>

            <div className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
                        Grandes <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Traversées</span>
                    </h1>
                    <p className="text-zinc-400 text-xl font-medium max-w-4xl leading-relaxed">
                        Les plus beaux itinéraires d&apos;Europe, préparés et optimisés par YETI. 
                        Chaque trek inclut roadbook, pack builder et conseils d&apos;experts.
                    </p>
                </div>
            </div>

            <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 mb-16 py-4">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'all', label: 'Tous les parcours' },
                            { id: 'sportif', label: 'Intense (4-5)' },
                            { id: 'modere', label: 'Modéré (3-4)' },
                            { id: 'accessible', label: 'Découverte (1-3)' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                                    filter === tab.id 
                                        ? "bg-white text-zinc-950" 
                                        : "bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {filteredTreks.map((trek) => (
                        <TrekCard key={trek.slug} trek={trek} />
                    ))}
                </div>

                {filteredTreks.length === 0 && (
                    <div className="text-center py-32">
                        <Info className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-lg">Aucune aventure disponible dans cette catégorie.</p>
                        <button onClick={() => setFilter('all')} className="mt-4 text-orange-500 font-bold hover:underline">Réinitialiser les filtres</button>
                    </div>
                )}
            </div>

            <div className="border-t border-white/5 bg-zinc-900/30 py-24">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <Mountain className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
                    <h3 className="text-3xl font-black text-white mb-4">La collection 2026 arrive</h3>
                    <p className="text-zinc-500 mb-10 text-lg">
                        Via Alpina, Haute Route Pyrénéenne, Kungsleden... 
                        Nos experts sont actuellement sur le terrain pour cartographier les prochaines légendes.
                    </p>
                    <button className="text-white border border-zinc-700 hover:border-orange-500 hover:text-orange-500 px-8 py-4 rounded-full font-bold transition-all">
                        Me tenir informé
                    </button>
                </div>
            </div>

        </div>
    );
}