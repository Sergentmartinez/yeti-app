"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Map, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trek } from '@/types';

interface TrekCardProps {
    trek: Trek;
}

export const TrekCard = ({ trek }: TrekCardProps) => {
    const nameParts = trek.name.split(' ');
    const firstWord = nameParts[0];
    const restOfName = nameParts.slice(1).join(' ');
    const isSpirit = trek.theme === 'spirit';
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
                <Image
                    src={trek.heroImage}
                    alt={trek.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                
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

export default TrekCard;