// app/app/select-trek/page.tsx
// Sélecteur de Trek - Grille de sélection des aventures trekking

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Mountain, MapPin, Clock, TrendingUp, Calendar } from "lucide-react";
import { useYetiStore } from "@/lib/store/useYetiStore";
import { Logo } from "@/components/Logo";
import { useState } from "react";

// === TREKS DATA (Focus Randonnée) ===

interface TrekOption {
    slug: string;
    name: string;
    country: string;
    countryFlag: string;
    distance: number;
    days: string;
    elevation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    imageUrl: string;
}

const TREKS: TrekOption[] = [
    {
        slug: 'gr20-corse',
        name: 'GR20',
        country: 'Corse, France',
        countryFlag: '🇫🇷',
        distance: 180,
        days: '12-16 jours',
        elevation: '+12 500m',
        difficulty: 'hard',
        description: 'Le plus beau et le plus difficile des sentiers de grande randonnée européens.',
        imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
    },
    {
        slug: 'tour-mont-blanc',
        name: 'Tour du Mont-Blanc',
        country: 'France, Suisse, Italie',
        countryFlag: '🇫🇷🇨🇭🇮🇹',
        distance: 170,
        days: '10-12 jours',
        elevation: '+10 000m',
        difficulty: 'medium',
        description: 'Boucle mythique autour du plus haut sommet des Alpes à travers 3 pays.',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600',
    },
    {
        slug: 'camino',
        name: 'Camino de Santiago',
        country: 'Espagne',
        countryFlag: '🇪🇸',
        distance: 800,
        days: '30-35 jours',
        elevation: '+11 000m',
        difficulty: 'easy',
        description: 'Le pèlerinage le plus célèbre d\'Europe, de Saint-Jean-Pied-de-Port à Santiago.',
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600',
    },
    {
        slug: 'tour-queyras',
        name: 'Tour du Queyras',
        country: 'France',
        countryFlag: '🇫🇷',
        distance: 120,
        days: '7-9 jours',
        elevation: '+7 500m',
        difficulty: 'medium',
        description: 'Circuit sauvage dans le parc naturel du Queyras, lacs d\'altitude et villages perchés.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    },
    {
        slug: 'alta-via-1',
        name: 'Alta Via 1 - Dolomites',
        country: 'Italie',
        countryFlag: '🇮🇹',
        distance: 120,
        days: '10-12 jours',
        elevation: '+6 500m',
        difficulty: 'hard',
        description: 'Traversée spectaculaire des Dolomites italiennes, paysages à couper le souffle.',
        imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600',
    },
    {
        slug: 'haute-route',
        name: 'Haute Route Chamonix-Zermatt',
        country: 'France, Suisse',
        countryFlag: '🇫🇷🇨🇭',
        distance: 180,
        days: '10-14 jours',
        elevation: '+8 000m',
        difficulty: 'hard',
        description: 'La classique des Alpes, entre glaciers et sommets légendaires.',
        imageUrl: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=600',
    },
];

const difficultyConfig = {
    easy: { label: 'Facile', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    medium: { label: 'Moyen', color: 'bg-orange-500', textColor: 'text-orange-500' },
    hard: { label: 'Difficile', color: 'bg-red-500', textColor: 'text-red-500' },
};

export default function SelectTrekPage() {
    const router = useRouter();
    const { selectTrek, createProject } = useYetiStore();
    const [selectedDate, setSelectedDate] = useState<string>("");

    const handleSelectTrek = (trek: TrekOption) => {
        // Sélectionner le trek et créer un projet avec date
        const date = selectedDate ? new Date(selectedDate) : undefined;
        
        selectTrek(trek.slug, trek.name, 'hike');
        createProject(trek.slug, trek.name, date);

        // Naviguer vers le Basecamp
        router.push('/app/basecamp');
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            {/* === HEADER === */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/90 glass">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Space formerly occupied by Arrow and Logo */}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {/* Date Picker */}
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-1.5 focus-within:border-orange-500 transition-colors">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-sm text-white focus:outline-none [color-scheme:dark]"
                                placeholder="Date de départ"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/20">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-sm font-bold text-orange-500">Saison {new Date().getFullYear()}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* === MAIN CONTENT === */}
            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-widest mb-6">
                        <Mountain className="w-4 h-4" />
                        Choisissez votre aventure
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                        Sélectionnez votre{' '}
                        <span className="gradient-text">Trek</span>
                    </h1>

                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
                        Les grandes traversées européennes. Chaque trek charge automatiquement
                        la packlist optimisée et les informations terrain.
                    </p>

                    {/* Mobile Date Picker */}
                    <div className="md:hidden max-w-sm mx-auto mb-8">
                         <div className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus-within:border-orange-500 transition-colors">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-base text-white focus:outline-none w-full [color-scheme:dark]"
                            />
                        </div>
                        {!selectedDate && (
                            <p className="text-xs text-orange-500 mt-2">Recommandé : Sélectionnez une date pour le planning auto</p>
                        )}
                    </div>
                </div>

                {/* Trek Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TREKS.map((trek) => {
                        const difficulty = difficultyConfig[trek.difficulty];

                        return (
                            <button
                                key={trek.slug}
                                onClick={() => handleSelectTrek(trek)}
                                className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-orange-600/50 transition-all duration-300 text-left card-hover"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={trek.imageUrl}
                                        alt={trek.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />

                                    {/* Badges */}
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded-full ${difficulty.color} text-white text-xs font-bold`}>
                                            {difficulty.label}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-white/20 glass text-white text-xs font-semibold">
                                            {trek.countryFlag} {trek.country.split(',')[0]}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-orange-400 transition-colors">
                                        {trek.name}
                                    </h3>

                                    <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                                        {trek.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-4 text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {trek.distance} km
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {trek.days}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-orange-500 font-bold">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            {trek.elevation}
                                        </span>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="mt-4 flex items-center gap-2 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-sm font-bold">Sélectionner</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <p className="text-zinc-500 text-sm mb-4">
                        Vous ne trouvez pas votre trek ? Plus de destinations arrivent bientôt.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 text-sm font-bold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </main>
        </div>
    );
}
