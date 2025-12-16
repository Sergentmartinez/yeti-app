"use client";

import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { MOCK_USER, getAllTreks } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo"; // ✅ Import du nouveau Logo

export default function BasecampPage() {
    const user = MOCK_USER;
    const allTreks = getAllTreks();
    const currentTrek = allTreks[0];

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            
            {/* HEADER BASECAMP */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    
                    {/* ✅ UTILISATION DU LOGO (Version Dark par défaut) */}
                    <Logo />
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-stone-900">{user.username}</p>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">{user.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-stone-200 border-2 border-white shadow-sm overflow-hidden relative flex items-center justify-center">
                             <span className="text-stone-500 font-bold">{user.username[0]}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                
                <div className="mb-10 pt-4">
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight">
                        Bienvenue, {user.username}!
                    </h1>
                    <p className="text-stone-500 mt-1">
                        Prêt pour votre prochaine expédition ? Aperçu de vos outils et treks planifiés.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CARTE 1: MON PROJET */}
                    <div className="md:col-span-2 bg-stone-900 rounded-2xl p-8 text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute inset-0 opacity-40">
                             {currentTrek && (
                                 <Image 
                                    src={currentTrek.heroImage} 
                                    alt="Trek Background" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                 />
                             )}
                             <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    En préparation
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
                                    {currentTrek?.name || "Aucun projet"}
                                </h2>
                                <p className="text-stone-300 max-w-md text-sm line-clamp-2">
                                    {currentTrek?.description}
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-xs text-stone-500 uppercase font-bold">Départ</p>
                                        <p className="font-mono font-bold text-lg">J-42</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-500 uppercase font-bold">Sac</p>
                                        <p className="font-mono font-bold text-lg">4.2kg</p>
                                    </div>
                                </div>
                                {currentTrek && (
                                    <Link 
                                        href={`/treks/${currentTrek.slug}`}
                                        className="bg-white text-stone-950 px-6 py-3 rounded-xl font-bold text-sm hover:bg-stone-200 transition-colors"
                                    >
                                        Reprendre
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CARTE 2: PACK BUILDER */}
                    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                                <Icons.NavPack className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Pack Builder</h3>
                            <p className="text-stone-500 text-sm">
                                Optimisez le poids de votre sac gramme par gramme.
                            </p>
                        </div>
                        <Link 
                            href="/basecamp/packbuilder"
                            className="mt-6 w-full flex items-center justify-center gap-2 border border-stone-200 py-3 rounded-xl text-sm font-bold text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition-all"
                        >
                            Ouvrir <Icons.ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* CARTE 3: STATS */}
                    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Vos Statistiques</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center">
                                <span className="text-sm font-medium text-stone-600">Treks</span>
                                <span className="text-stone-900 font-black font-mono">0</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-sm font-medium text-stone-600">Distance</span>
                                <span className="text-stone-900 font-black font-mono">0 km</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}