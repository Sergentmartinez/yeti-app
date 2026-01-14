// app/app/pack/page.tsx
// Pack Builder 3D - Outil de construction de sac avec visualisation 3D

"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    Search,
    Filter,
    Download,
    Target,
    Package,
    Weight,
    Wallet,
    AlertTriangle,
    CheckCircle,
    X,
    ChevronDown
} from "lucide-react";
import { useYetiStore, AVAILABLE_PACKS, PackedItem, Compartment } from "@/lib/store/useYetiStore";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

// Dynamic import for 3D Canvas (client-only)
const PackCanvas = dynamic(() => import("./PackCanvas"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-3xl">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-zinc-600">Chargement du modèle 3D...</p>
            </div>
        </div>
    )
});

// === GEAR ITEMS DATA ===

interface GearItem {
    id: string;
    name: string;
    brand: string;
    weight: number; // en grammes
    volume: number; // en litres
    price: number;
    category: string;
    emoji: string;
    recommended?: boolean;
}

const GEAR_ITEMS: GearItem[] = [
    // Abri
    { id: "tente-nemo", name: "Tente Nemo Hornet 2P", brand: "Nemo", weight: 850, volume: 3.5, price: 420, category: "abri", emoji: "🏕️" },
    { id: "tarp-sts", name: "Tarp Ultralight 3x3", brand: "Sea to Summit", weight: 400, volume: 1.5, price: 90, category: "abri", emoji: "🏕️" },
    { id: "msr-hubba", name: "MSR Hubba Hubba NX", brand: "MSR", weight: 1540, volume: 4.5, price: 480, category: "abri", emoji: "⛺" },
    // Couchage
    { id: "cumulus-400", name: "Cumulus X-Lite 400", brand: "Cumulus", weight: 580, volume: 4.0, price: 380, category: "couchage", emoji: "😴" },
    { id: "cumulus-300", name: "Cumulus X-Lite 300 (-5°C)", brand: "Cumulus", weight: 520, volume: 3.5, price: 410, category: "couchage", emoji: "😴", recommended: true },
    { id: "matelas-neoair", name: "Matelas NeoAir XLite", brand: "Thermarest", weight: 350, volume: 1.0, price: 220, category: "couchage", emoji: "🛏️" },
    { id: "oreiller-aeros", name: "Oreiller Aeros UL", brand: "Sea to Summit", weight: 60, volume: 0.3, price: 45, category: "couchage", emoji: "💤" },
    // Cuisine
    { id: "rechaud-msr", name: "Réchaud MSR PocketRocket", brand: "MSR", weight: 73, volume: 0.2, price: 55, category: "cuisine", emoji: "🔥" },
    { id: "popote-toaks", name: "Popote Toaks 750ml", brand: "Toaks", weight: 120, volume: 0.8, price: 35, category: "cuisine", emoji: "🍳" },
    { id: "cartouche-gaz", name: "Cartouche gaz 230g", brand: "MSR", weight: 370, volume: 0.5, price: 9, category: "cuisine", emoji: "🔥" },
    { id: "spork-titanium", name: "Spork Titanium", brand: "Light My Fire", weight: 20, volume: 0.05, price: 8, category: "cuisine", emoji: "🥄" },
    // Hydratation
    { id: "filtre-katadyn", name: "Filtre Katadyn BeFree", brand: "Katadyn", weight: 63, volume: 0.6, price: 42, category: "hydratation", emoji: "💧", recommended: true },
    { id: "gourde-nalgene", name: "Gourde Nalgene 1L", brand: "Nalgene", weight: 180, volume: 1.0, price: 16, category: "hydratation", emoji: "🍶" },
    { id: "poche-osprey", name: "Poche Osprey 2L", brand: "Osprey", weight: 150, volume: 0.2, price: 35, category: "hydratation", emoji: "💧" },
    // Vêtements
    { id: "veste-arcteryx", name: "Veste Arc'teryx Beta LT", brand: "Arc'teryx", weight: 310, volume: 1.0, price: 450, category: "vetements", emoji: "🧥" },
    { id: "doudoune-cerium", name: "Doudoune Cerium SL", brand: "Arc'teryx", weight: 210, volume: 1.5, price: 380, category: "vetements", emoji: "🧥" },
    { id: "pantalon-trek", name: "Pantalon Trek 100", brand: "Forclaz", weight: 280, volume: 0.8, price: 40, category: "vetements", emoji: "👖" },
    { id: "tshirt-merinos", name: "T-shirt Mérinos 150", brand: "Icebreaker", weight: 150, volume: 0.3, price: 80, category: "vetements", emoji: "👕" },
    { id: "buff", name: "Buff Original", brand: "Buff", weight: 40, volume: 0.1, price: 22, category: "vetements", emoji: "🧣" },
    // Électronique
    { id: "lampe-petzl", name: "Lampe Petzl Actik Core", brand: "Petzl", weight: 99, volume: 0.2, price: 75, category: "electronique", emoji: "💡" },
    { id: "batterie-anker", name: "Batterie Anker 10000mAh", brand: "Anker", weight: 190, volume: 0.3, price: 30, category: "electronique", emoji: "🔋" },
    { id: "garmin-inreach", name: "Garmin inReach Mini 2", brand: "Garmin", weight: 100, volume: 0.1, price: 400, category: "electronique", emoji: "📡" },
    // Sécurité
    { id: "trousse-secours", name: "Trousse secours", brand: "Deuter", weight: 280, volume: 0.5, price: 25, category: "securite", emoji: "🩹" },
    { id: "couverture-survie", name: "Couverture survie SOL", brand: "SOL", weight: 120, volume: 0.2, price: 35, category: "securite", emoji: "🆘" },
    { id: "sifflet", name: "Sifflet urgence", brand: "Fox 40", weight: 10, volume: 0.02, price: 8, category: "securite", emoji: "📢" },
];

const CATEGORIES = [
    { id: "all", name: "Toutes", icon: "📦" },
    { id: "abri", name: "Abri", icon: "🏕️" },
    { id: "couchage", name: "Couchage", icon: "😴" },
    { id: "cuisine", name: "Cuisine", icon: "🍳" },
    { id: "hydratation", name: "Eau", icon: "💧" },
    { id: "vetements", name: "Vêtements", icon: "👕" },
    { id: "electronique", name: "Électronique", icon: "📱" },
    { id: "securite", name: "Sécurité", icon: "🩹" },
];

export default function PackBuilderPage() {
    const router = useRouter();
    const {
        selectedTrekName,
        selectedTrekSlug,
        packedItems,
        selectedPackId,
        targetWeight,
        addItem,
        removeItem,
        clearPack,
        selectPack,
        getSelectedPack,
        getTotalWeight,
        getTotalVolume,
        getTotalPrice,
        getBaseWeight,
    } = useYetiStore();

    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if no trek selected
    useEffect(() => {
        if (mounted && !selectedTrekSlug) {
            router.push('/app/select-trek');
        }
    }, [mounted, selectedTrekSlug, router]);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const selectedPack = getSelectedPack();
    const totalWeight = getTotalWeight(); // en grammes
    const totalVolume = getTotalVolume();
    const totalPrice = getTotalPrice();
    const baseWeight = getBaseWeight(); // en kg
    const totalDepartWeight = baseWeight + 5; // +5kg eau et nourriture

    // Filter gear items
    const filteredGear = GEAR_ITEMS.filter(item => {
        const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    // Check if item is in pack
    const isItemPacked = (itemId: string) => packedItems.some(p => p.id === itemId);

    // Handle item toggle
    const handleToggleItem = (item: GearItem) => {
        if (isItemPacked(item.id)) {
            removeItem(item.id);
        } else {
            addItem({
                id: item.id,
                name: item.name,
                weight: item.weight,
                volume: item.volume,
                price: item.price,
                category: item.category,
                emoji: item.emoji,
                brand: item.brand,
            });
        }
    };

    // Export pack
    const handleExport = () => {
        let txt = '═══════════════════════════════════════\n';
        txt += '          YETI PACK EXPORT\n';
        txt += '═══════════════════════════════════════\n\n';
        txt += `📅 Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
        txt += `🎒 Sac: ${selectedPack.name} (${selectedPack.capacity}L)\n`;
        txt += `🏔️ Trek: ${selectedTrekName}\n\n`;
        txt += '───────────────────────────────────────\n';
        txt += `      ÉQUIPEMENT (${packedItems.length} items)\n`;
        txt += '───────────────────────────────────────\n\n';

        packedItems.forEach(item => {
            txt += `${item.emoji} ${item.name}\n`;
            txt += `   └─ ${(item.weight / 1000).toFixed(2)}kg • ${item.volume}L • ${item.price}€\n\n`;
        });

        txt += '───────────────────────────────────────\n';
        txt += '              TOTAUX\n';
        txt += '───────────────────────────────────────\n\n';
        txt += `⚖️  Base Weight: ${baseWeight.toFixed(2)}kg\n`;
        txt += `🎒 Total départ: ${totalDepartWeight.toFixed(1)}kg\n`;
        txt += `💰 Budget: ${totalPrice}€\n\n`;
        txt += '═══════════════════════════════════════\n';

        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `yeti-pack-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Weight status
    const weightPercent = Math.min((baseWeight / targetWeight) * 100, 100);
    const volumePercent = Math.min((totalVolume / selectedPack.capacity) * 100, 100);
    const isOverweight = baseWeight > targetWeight;

    // Alerts
    const alerts: string[] = [];
    if (isOverweight) {
        alerts.push(`Poids dépasse l'objectif de ${targetWeight}kg`);
    }
    if (totalVolume > selectedPack.capacity * 0.9) {
        alerts.push('Volume proche de la capacité max');
    }
    if (totalDepartWeight > selectedPack.maxLoad) {
        alerts.push(`Charge totale dépasse le max du sac (${selectedPack.maxLoad}kg)`);
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900">

            {/* === HEADER === */}
            <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 glass-light">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-lg font-black">Pack Builder</h1>
                            <p className="text-xs text-zinc-500">{selectedTrekName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-sm font-bold text-orange-700">{packedItems.length} items</span>
                        </div>

                        <button
                            onClick={handleExport}
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition"
                        >
                            <Download className="w-4 h-4" />
                            Exporter
                        </button>
                    </div>
                </div>
            </header>

            {/* === MAIN CONTENT === */}
            <main className="max-w-[1600px] mx-auto px-6 py-6">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* LEFT: Gear Catalogue */}
                    <div className="xl:col-span-4 space-y-4">

                        {/* Search & Filter */}
                        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un item..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                    />
                                </div>
                            </div>

                            {/* Category pills */}
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                                            selectedCategory === cat.id
                                                ? "bg-orange-600 text-white"
                                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                        )}
                                    >
                                        {cat.icon} {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gear List */}
                        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                            {filteredGear.map(item => {
                                const isPacked = isItemPacked(item.id);

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleToggleItem(item)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border shadow-sm text-left transition-all card-hover",
                                            isPacked
                                                ? "bg-emerald-50 border-emerald-300"
                                                : "bg-white border-zinc-200 hover:border-orange-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
                                                isPacked ? "bg-emerald-100" : "bg-zinc-100"
                                            )}>
                                                {item.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm truncate">{item.name}</span>
                                                    {item.recommended && (
                                                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-full font-bold">
                                                            Recommandé
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-zinc-500">{item.brand}</div>
                                                <div className="flex items-center gap-3 mt-1 text-xs">
                                                    <span className="font-bold">{(item.weight / 1000).toFixed(2)}kg</span>
                                                    <span className="text-zinc-300">•</span>
                                                    <span>{item.volume}L</span>
                                                    <span className="text-zinc-300">•</span>
                                                    <span className="text-emerald-600 font-bold">{item.price}€</span>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                isPacked
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-zinc-100 text-zinc-600 hover:bg-orange-500 hover:text-white"
                                            )}>
                                                {isPacked ? <CheckCircle className="w-5 h-5" /> : "+"}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* CENTER: 3D Viewer */}
                    <div className="xl:col-span-5">
                        <div className="sticky top-24 space-y-4">

                            {/* 3D Canvas */}
                            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-xl" style={{ height: '420px' }}>
                                <Suspense fallback={
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                                    </div>
                                }>
                                    <PackCanvas
                                        modelUrl={selectedPack.model3dUrl}
                                        rotation={rotation}
                                    />
                                </Suspense>

                                {/* Controls */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <button
                                        onClick={() => setRotation(r => r - Math.PI / 4)}
                                        className="w-10 h-10 rounded-xl bg-white/80 glass-light border border-white/50 flex items-center justify-center hover:bg-white transition shadow-sm"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setRotation(r => r + Math.PI / 4)}
                                        className="w-10 h-10 rounded-xl bg-white/80 glass-light border border-white/50 flex items-center justify-center hover:bg-white transition shadow-sm"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setRotation(0)}
                                        className="w-10 h-10 rounded-xl bg-white/80 glass-light border border-white/50 flex items-center justify-center hover:bg-white transition shadow-sm"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                    <div className="bg-white/90 glass-light rounded-xl px-4 py-3 shadow-sm">
                                        <p className="text-xs text-zinc-500">Sac sélectionné</p>
                                        <p className="font-bold text-zinc-800">{selectedPack.name}</p>
                                    </div>
                                    <div className="bg-white/90 glass-light rounded-xl px-4 py-3 shadow-sm text-right">
                                        <p className="text-xs text-zinc-500">Charge max</p>
                                        <p className="font-bold text-zinc-800">{selectedPack.maxLoad} kg</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pack Selection */}
                            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                                <h4 className="font-bold text-sm mb-3">Changer de sac</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {AVAILABLE_PACKS.map(pack => (
                                        <button
                                            key={pack.id}
                                            onClick={() => selectPack(pack.id)}
                                            className={cn(
                                                "p-3 rounded-xl border-2 text-center transition hover:border-orange-400",
                                                selectedPackId === pack.id
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-zinc-200 bg-white"
                                            )}
                                        >
                                            <div className="text-2xl mb-1">
                                                {pack.id === 'sac-bleu' ? '🔵' : pack.id === 'osprey-talon-vert' ? '🟢' : '🔴'}
                                            </div>
                                            <div className="text-xs font-bold">{pack.name.split(' ')[0]}</div>
                                            <div className="text-[10px] text-zinc-500">{pack.capacity}L • {(pack.weight / 1000).toFixed(1)}kg</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Compartments Visualization */}
                            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                                <h4 className="font-bold text-sm mb-3">Répartition dans le sac</h4>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <div className="relative h-40 rounded-xl border-2 border-zinc-300 bg-gradient-to-t from-zinc-100 to-white overflow-hidden">
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-400 to-orange-300 opacity-80 transition-all duration-500"
                                                style={{ height: `${Math.min(volumePercent, 100)}%` }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center z-10">
                                                    <div className="text-2xl font-black text-zinc-700">{totalVolume.toFixed(1)}L</div>
                                                    <div className="text-xs text-zinc-500">/ {selectedPack.capacity}L</div>
                                                </div>
                                            </div>
                                            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-white/80 text-[10px] font-bold text-zinc-600">
                                                Principal
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-20 space-y-2">
                                        <div className="relative h-[76px] rounded-xl border-2 border-zinc-300 bg-gradient-to-t from-zinc-100 to-white overflow-hidden">
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 opacity-80 transition-all duration-500"
                                                style={{ height: `${Math.min(volumePercent * 0.8, 100)}%` }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-zinc-600 z-10">Top</span>
                                            </div>
                                        </div>
                                        <div className="relative h-[76px] rounded-xl border-2 border-zinc-300 bg-gradient-to-t from-zinc-100 to-white overflow-hidden">
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-400 to-emerald-300 opacity-80 transition-all duration-500"
                                                style={{ height: `${Math.min(volumePercent * 0.5, 100)}%` }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-zinc-600 z-10">Bas</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-400 mt-3 text-center">💡 Placer les items lourds au centre/dos</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Pack Summary */}
                    <div className="xl:col-span-3 space-y-4">
                        <div className="sticky top-24 space-y-4">

                            {/* Stats Card */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-black text-lg">Mon Pack</h3>
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold">
                                        {packedItems.length} items
                                    </span>
                                </div>

                                {/* Base Weight */}
                                <div className="mb-5">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-zinc-400">Base Weight</span>
                                        <span className="font-black text-xl">{baseWeight.toFixed(2)} kg</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                isOverweight
                                                    ? "bg-gradient-to-r from-red-400 to-red-500"
                                                    : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                            )}
                                            style={{ width: `${weightPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                                        <span>Objectif : {targetWeight}kg</span>
                                        <span className={isOverweight ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                                            {isOverweight ? '+' : '-'}{Math.abs(baseWeight - targetWeight).toFixed(2)}kg
                                        </span>
                                    </div>
                                </div>

                                {/* Volume */}
                                <div className="mb-5">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-zinc-400">Volume utilisé</span>
                                        <span className="font-black text-xl">{totalVolume.toFixed(1)} L</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${volumePercent}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">
                                        Capacité : {selectedPack.capacity}L
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="pt-5 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-zinc-400">Total départ</span>
                                        <span className="text-3xl font-black">{totalDepartWeight.toFixed(1)} kg</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mb-4">Inclut eau (2L) + nourriture (3kg)</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Budget</span>
                                        <span className="text-xl font-black text-emerald-400">€{totalPrice}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleExport}
                                        className="py-3 rounded-xl bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-100 transition"
                                    >
                                        Exporter
                                    </button>
                                    <Link
                                        href="/app/basecamp"
                                        className="py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-500 transition text-center"
                                    >
                                        Analyser →
                                    </Link>
                                </div>
                            </div>

                            {/* Packed Items List */}
                            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm max-h-64 overflow-y-auto">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-sm">Dans le pack</h4>
                                    {packedItems.length > 0 && (
                                        <button
                                            onClick={clearPack}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Vider tout
                                        </button>
                                    )}
                                </div>

                                {packedItems.length === 0 ? (
                                    <div className="text-center py-6 text-zinc-400">
                                        <div className="text-3xl mb-2">🎒</div>
                                        <p className="text-sm">Ton sac est vide</p>
                                        <p className="text-xs mt-1">Clique sur un item pour l&apos;ajouter</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {packedItems.map(item => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl group hover:bg-zinc-100 transition"
                                            >
                                                <span className="text-lg">{item.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm truncate">{item.name}</div>
                                                    <div className="text-xs text-zinc-500">
                                                        {(item.weight / 1000).toFixed(2)}kg • {item.volume}L
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Alerts Panel */}
                            {alerts.length > 0 && (
                                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                                        <span className="font-bold text-sm text-orange-800">Alertes</span>
                                    </div>
                                    <div className="space-y-2 text-sm text-orange-700">
                                        {alerts.map((alert, i) => (
                                            <p key={i}>⚠️ {alert}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
