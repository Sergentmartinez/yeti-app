// lib/store/useYetiStore.ts
// Store Zustand Global pour YETI PWA

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === TYPES ===

export type TimelinePhase = 'J-30' | 'J-15' | 'J-7' | 'J-0';
export type TrekType = 'hike' | 'bike';
export type Compartment = 'main' | 'top' | 'bottom' | 'pockets';

export interface PackedItem {
    id: string;
    name: string;
    weight: number; // en grammes
    volume: number; // en litres
    price: number;
    category: string;
    emoji: string;
    compartment: Compartment;
    brand?: string;
}

export interface SelectedPack {
    id: string;
    name: string;
    brand: string;
    capacity: number; // en litres
    weight: number; // en grammes
    maxLoad: number; // en kg
    model3dUrl: string;
}

export interface TrekProject {
    id: string;
    trekSlug: string;
    trekName: string;
    departureDate: Date | null;
    createdAt: Date;
    status: 'draft' | 'active' | 'completed';
    score: number;
}

// === PACKS DISPONIBLES ===

// === MOCK DATA FOR DEMO ===
export const MOCK_GARAGE_ITEMS: PackedItem[] = [
    { id: "tente-1", name: "Hubba Hubba NX", weight: 1720, volume: 10, price: 450, category: 'shelter', emoji: '⛺', compartment: 'main', brand: "MSR" },
    { id: "duvet-1", name: "Spark SpII", weight: 560, volume: 5, price: 390, category: 'sleep', emoji: '🛌', compartment: 'bottom', brand: "Sea to Summit" },
    { id: "matelas-1", name: "NeoAir XLite", weight: 340, volume: 2, price: 180, category: 'sleep', emoji: '🧘', compartment: 'bottom', brand: "Therm-a-Rest" },
    { id: "rechaud-1", name: "JetBoil MiniMo", weight: 415, volume: 3, price: 130, category: 'kitchen', emoji: '🔥', compartment: 'main', brand: "JetBoil" },
    { id: "filtre-1", name: "Sawyer Squeeze", weight: 85, volume: 0.5, price: 45, category: 'kitchen', emoji: '💧', compartment: 'pockets', brand: "Sawyer" },
    { id: "sac-1", name: "Talon 44", weight: 1100, volume: 44, price: 160, category: 'other', emoji: '🎒', compartment: 'main', brand: "Osprey" }
];

export const AVAILABLE_PACKS: SelectedPack[] = [
    {
        id: 'sac-bleu',
        name: 'Sac Bleu Artisanal',
        brand: 'Artisanal',
        capacity: 45,
        weight: 1300,
        maxLoad: 12,
        model3dUrl: 'https://dl.dropboxusercontent.com/scl/fi/k2sj30djixl45wte5994v/sac-a-dos-bleu.glb?rlkey=ok13nsdhs9rcl4its46xfiqy1&dl=1',
    },
    {
        id: 'osprey-talon-vert',
        name: 'Osprey Talon 33 (Vert)',
        brand: 'Osprey',
        capacity: 33,
        weight: 920,
        maxLoad: 11,
        model3dUrl: 'https://dl.dropboxusercontent.com/scl/fi/mr33npkuf9dob8r65qnra/OSPREY-TALON-BACKPACK-vert.glb?rlkey=7x46b7fo0q5q1rn8rs5ks8n73&st=4hd3q0gx&dl=1',
    },
    {
        id: 'osprey-renn-rouge',
        name: 'Osprey Renn 50 (Rouge)',
        brand: 'Osprey',
        capacity: 50,
        weight: 1450,
        maxLoad: 14,
        model3dUrl: 'https://dl.dropboxusercontent.com/scl/fi/ieovmkvt68i2fxcdzexge/OSPREY-RENN-HIKING-rouge.glb?rlkey=q1rwsi5g6cl1jn5mjrum0o86x&st=a2o6anuf&dl=1',
    },
];

// === ÉTAT DU STORE ===

interface YetiState {
    // Timeline
    currentPhase: TimelinePhase;
    departureDate: Date | null;
    daysUntilDeparture: number | null;

    // Trek Selection
    selectedTrekSlug: string | null;
    selectedTrekName: string | null;
    selectedTrekType: TrekType;

    // Pack Builder
    packedItems: PackedItem[];
    selectedPackId: string;
    targetWeight: number; // en kg

    // Projects
    currentProjectId: string | null;
    projects: TrekProject[];
    
    // Global Data (Mock for Stats)
    gearLibrary: PackedItem[];

    // Computed
    getSelectedPack: () => SelectedPack;
    getTotalWeight: () => number; // en grammes
    getTotalVolume: () => number; // en litres
    getTotalPrice: () => number;
    getBaseWeight: () => number; // en kg
    
    // Global Getters
    getGlobalStats: () => {
        totalDistance: number;
        totalElevation: number;
        totalGearValue: number;
        totalGearCount: number;
    };
}

interface YetiActions {
    // Timeline
    setPhase: (phase: TimelinePhase) => void;
    setDepartureDate: (date: Date | null) => void;

    // Trek Selection
    selectTrek: (slug: string, name: string, type?: TrekType) => void;
    clearTrekSelection: () => void;

    // Pack Builder
    addItem: (item: Omit<PackedItem, 'compartment'>, compartment?: Compartment) => void;
    removeItem: (itemId: string) => void;
    moveItem: (itemId: string, compartment: Compartment) => void;
    clearPack: () => void;
    selectPack: (packId: string) => void;
    setTargetWeight: (weight: number) => void;

    // Projects
    createProject: (trekSlug: string, trekName: string, departureDate?: Date) => string;
    setCurrentProject: (projectId: string | null) => void;
    updateProjectScore: (projectId: string, score: number) => void;

    // Utils
    reset: () => void;
}

type YetiStore = YetiState & YetiActions;

// === INITIAL STATE ===

const initialState: Omit<YetiState, 'getSelectedPack' | 'getTotalWeight' | 'getTotalVolume' | 'getTotalPrice' | 'getBaseWeight' | 'getGlobalStats'> = {
    // Timeline
    currentPhase: 'J-30',
    departureDate: null,
    daysUntilDeparture: null,

    // Trek Selection
    selectedTrekSlug: null,
    selectedTrekName: null,
    selectedTrekType: 'hike',

    // Pack Builder
    packedItems: [],
    selectedPackId: 'sac-bleu',
    targetWeight: 8,

    // Projects
    currentProjectId: null,
    projects: [],
    
    // Global
    gearLibrary: MOCK_GARAGE_ITEMS,
};

// === STORE ===

export const useYetiStore = create<YetiStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // === COMPUTED GETTERS ===

            getSelectedPack: () => {
                const packId = get().selectedPackId;
                return AVAILABLE_PACKS.find(p => p.id === packId) || AVAILABLE_PACKS[0];
            },

            getTotalWeight: () => {
                return get().packedItems.reduce((sum, item) => sum + item.weight, 0);
            },

            getTotalVolume: () => {
                return get().packedItems.reduce((sum, item) => sum + item.volume, 0);
            },

            getTotalPrice: () => {
                return get().packedItems.reduce((sum, item) => sum + item.price, 0);
            },

            getBaseWeight: () => {
                const pack = get().getSelectedPack();
                const itemsWeight = get().getTotalWeight();
                return (pack.weight + itemsWeight) / 1000; // Convert to kg
            },
            
            getGlobalStats: () => {
                const state = get();
                // Mock distances (in reality would come from treks table)
                const totalDistance = state.projects.length * 180; 
                const totalElevation = state.projects.length * 12000;
                
                const totalGearValue = state.gearLibrary.reduce((acc, item) => acc + item.price, 0);
                const totalGearCount = state.gearLibrary.length;
                
                return { totalDistance, totalElevation, totalGearValue, totalGearCount };
            },

            // === TIMELINE ACTIONS ===

            setPhase: (phase) => set({ currentPhase: phase }),

            setDepartureDate: (date) => {
                if (!date) {
                    set({ departureDate: null, daysUntilDeparture: null });
                    return;
                }

                const now = new Date();
                const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                // Auto-determine phase based on days
                let phase: TimelinePhase = 'J-30';
                if (diff <= 0) phase = 'J-0';
                else if (diff <= 7) phase = 'J-7';
                else if (diff <= 15) phase = 'J-15';
                else phase = 'J-30';

                set({
                    departureDate: date,
                    daysUntilDeparture: diff,
                    currentPhase: phase
                });
            },

            // === TREK SELECTION ACTIONS ===

            selectTrek: (slug, name, type = 'hike') => {
                set({
                    selectedTrekSlug: slug,
                    selectedTrekName: name,
                    selectedTrekType: type
                });
            },

            clearTrekSelection: () => {
                set({
                    selectedTrekSlug: null,
                    selectedTrekName: null
                });
            },

            // === PACK BUILDER ACTIONS ===

            addItem: (item, compartment = 'main') => {
                const existing = get().packedItems.find(i => i.id === item.id);
                if (existing) return; // Prevent duplicates

                set((state) => ({
                    packedItems: [...state.packedItems, { ...item, compartment }],
                }));
            },

            removeItem: (itemId) => {
                set((state) => ({
                    packedItems: state.packedItems.filter(i => i.id !== itemId),
                }));
            },

            moveItem: (itemId, compartment) => {
                set((state) => ({
                    packedItems: state.packedItems.map(i =>
                        i.id === itemId ? { ...i, compartment } : i
                    ),
                }));
            },

            clearPack: () => {
                set({ packedItems: [] });
            },

            selectPack: (packId) => {
                set({ selectedPackId: packId });
            },

            setTargetWeight: (weight) => {
                set({ targetWeight: weight });
            },

            // === PROJECT ACTIONS ===

            createProject: (trekSlug, trekName, departureDate) => {
                const id = `project-${Date.now()}`;
                const newProject: TrekProject = {
                    id,
                    trekSlug,
                    trekName,
                    departureDate: departureDate || null,
                    createdAt: new Date(),
                    status: 'active',
                    score: 0,
                };

                // Calculate initial phase if date exists
                let initialPhase: TimelinePhase = 'J-30';
                let daysUntil: number | null = null;
                
                if (departureDate) {
                    const now = new Date();
                    daysUntil = Math.ceil((departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysUntil <= 0) initialPhase = 'J-0';
                    else if (daysUntil <= 7) initialPhase = 'J-7';
                    else if (daysUntil <= 15) initialPhase = 'J-15';
                }

                set((state) => ({
                    projects: [...state.projects, newProject],
                    currentProjectId: id,
                    selectedTrekSlug: trekSlug,
                    selectedTrekName: trekName,
                    departureDate: departureDate || null,
                    daysUntilDeparture: daysUntil,
                    currentPhase: initialPhase
                }));

                return id;
            },

            setCurrentProject: (projectId) => {
                set({ currentProjectId: projectId });
            },

            updateProjectScore: (projectId, score) => {
                set((state) => ({
                    projects: state.projects.map(p =>
                        p.id === projectId ? { ...p, score } : p
                    ),
                }));
            },

            // === UTILS ===

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'yeti-storage',
            partialize: (state) => ({
                // Only persist essential data
                selectedTrekSlug: state.selectedTrekSlug,
                selectedTrekName: state.selectedTrekName,
                selectedTrekType: state.selectedTrekType,
                packedItems: state.packedItems,
                selectedPackId: state.selectedPackId,
                targetWeight: state.targetWeight,
                projects: state.projects,
                currentProjectId: state.currentProjectId,
                departureDate: state.departureDate,
            }),
        }
    )
);

// === SELECTORS ===

export const selectCurrentPhase = (state: YetiStore) => state.currentPhase;
export const selectPackedItems = (state: YetiStore) => state.packedItems;
export const selectSelectedTrek = (state: YetiStore) => ({
    slug: state.selectedTrekSlug,
    name: state.selectedTrekName,
    type: state.selectedTrekType,
});
