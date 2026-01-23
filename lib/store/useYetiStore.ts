// lib/store/useYetiStore.ts
// Store Zustand Global pour YETI - Version complète avec Budget Intelligent

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === TYPES ===

export type TimelinePhase = 'J-60' | 'J-30' | 'J-15' | 'J-7' | 'J-0';
export type TrekType = 'hike' | 'bike';
export type Compartment = 'main' | 'top' | 'bottom' | 'pockets';
export type BudgetCategory = 'transport' | 'materiel' | 'nourriture' | 'hebergement' | 'assurance' | 'divers';

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
    owned?: boolean; // Si l'item est déjà possédé
}

export interface SelectedPack {
    id: string;
    name: string;
    brand: string;
    capacity: number;
    weight: number;
    maxLoad: number;
    model3dUrl: string;
}

export interface BudgetItem {
    id: string;
    label: string;
    amount: number;
    note?: string;
    paid: boolean;
    category: BudgetCategory;
    source: 'manual' | 'packbuilder' | 'timeline';
    sourceId?: string;
    createdAt: Date;
}

export interface Task {
    id: string;
    label: string;
    status: 'done' | 'active' | 'pending';
    date: string;
    phase: TimelinePhase;
    cost?: number;
}

export interface TrekProject {
    id: string;
    trekSlug: string;
    trekName: string;
    departureDate: Date | null;
    createdAt: Date;
    status: 'draft' | 'active' | 'completed';
    score: number;
    budgetLimit: number;
}

export interface TrekInfo {
    name: string;
    distance: number;
    elevation: number;
    days: number;
    difficulty: number;
}

// === DONNÉES CONSTANTES ===

export const TREK_DATABASE: Record<string, TrekInfo> = {
    'gr20-corse': { name: 'GR20 Corse', distance: 180, elevation: 11000, days: 16, difficulty: 5 },
    'tmb': { name: 'Tour du Mont-Blanc', distance: 170, elevation: 10000, days: 11, difficulty: 3 },
    'camino': { name: 'Camino de Santiago', distance: 800, elevation: 12500, days: 35, difficulty: 2 }
};

export const AVAILABLE_PACKS: SelectedPack[] = [
    { id: 'sac-bleu', name: 'Sac Bleu Artisanal', brand: 'Artisanal', capacity: 45, weight: 1300, maxLoad: 12, model3dUrl: 'https://dl.dropboxusercontent.com/scl/fi/k2sj30djixl45wte5994v/sac-a-dos-bleu.glb?rlkey=ok13nsdhs9rcl4its46xfiqy1&dl=1' },
    { id: 'osprey-talon-vert', name: 'Osprey Talon 33', brand: 'Osprey', capacity: 33, weight: 920, maxLoad: 11, model3dUrl: 'https://dl.dropboxusercontent.com/scl/fi/mr33npkuf9dob8r65qnra/OSPREY-TALON-BACKPACK-vert.glb?rlkey=7x46b7fo0q5q1rn8rs5ks8n73&st=4hd3q0gx&dl=1' },
    { id: 'osprey-renn-rouge', name: 'Osprey Renn 50', brand: 'Osprey', capacity: 50, weight: 1450, maxLoad: 14, model3dUrl: 'https://dl.dropboxusercontent.com/scl/fi/ieovmkvt68i2fxcdzexge/OSPREY-RENN-HIKING-rouge.glb?rlkey=q1rwsi5g6cl1jn5mjrum0o86x&st=a2o6anuf&dl=1' },
];

export const MOCK_GARAGE_ITEMS: PackedItem[] = [
    { id: "tente-1", name: "Hubba Hubba NX", weight: 1720, volume: 10, price: 450, category: 'shelter', emoji: '⛺', compartment: 'main', brand: "MSR", owned: true },
    { id: "duvet-1", name: "Spark SpII", weight: 560, volume: 5, price: 390, category: 'sleep', emoji: '🛌', compartment: 'bottom', brand: "Sea to Summit", owned: true },
    { id: "matelas-1", name: "NeoAir XLite", weight: 340, volume: 2, price: 180, category: 'sleep', emoji: '🧘', compartment: 'bottom', brand: "Therm-a-Rest", owned: true },
    { id: "rechaud-1", name: "JetBoil MiniMo", weight: 415, volume: 3, price: 130, category: 'kitchen', emoji: '🔥', compartment: 'main', brand: "JetBoil", owned: true },
    { id: "filtre-1", name: "Sawyer Squeeze", weight: 85, volume: 0.5, price: 45, category: 'kitchen', emoji: '💧', compartment: 'pockets', brand: "Sawyer", owned: false },
    { id: "sac-1", name: "Talon 44", weight: 1100, volume: 44, price: 160, category: 'other', emoji: '🎒', compartment: 'main', brand: "Osprey", owned: true },
    { id: "veste-1", name: "Arc'teryx Beta LT", weight: 350, volume: 1.5, price: 550, category: 'clothing', emoji: '🧥', compartment: 'top', brand: "Arc'teryx", owned: true },
    { id: "baton-1", name: "Black Diamond Distance", weight: 340, volume: 1, price: 140, category: 'other', emoji: '🥢', compartment: 'pockets', brand: "Black Diamond", owned: true },
];

// === ÉTAT DU STORE ===

interface YetiState {
    currentProjectId: string | null;
    projects: TrekProject[];
    selectedTrekSlug: string;
    selectedTrekName: string;
    selectedTrekType: TrekType;
    departureDate: Date | null;
    packedItems: PackedItem[];
    selectedPackId: string;
    targetWeight: number;
    gearLibrary: PackedItem[];
    budgetItems: BudgetItem[];
    budgetLimit: number;
    tasks: Task[];
    preparationScores: { materiel: number; physique: number; logistique: number; };
}

interface YetiGetters {
    getSelectedPack: () => SelectedPack;
    getTotalWeight: () => number;
    getTotalVolume: () => number;
    getPackPrice: () => number;
    getBaseWeight: () => number;
    getWeightByCategory: () => Record<string, number>;
    getTotalBudget: () => number;
    getBudgetByCategory: () => Record<BudgetCategory, number>;
    getPaidAmount: () => number;
    getRemainingBudget: () => number;
    getTrekInfo: () => TrekInfo | null;
    getDaysUntilDeparture: () => number | null;
    getCurrentPhase: () => TimelinePhase;
    getGlobalPreparationScore: () => number;
    getTasksByPhase: () => Record<TimelinePhase, Task[]>;
    getActiveTasks: () => Task[];
    getCompletedTasksCount: () => number;
}

interface YetiActions {
    createProject: (trekSlug: string, departureDate?: Date) => string;
    setCurrentProject: (id: string | null) => void;
    updateProjectBudgetLimit: (limit: number) => void;
    selectTrek: (slug: string, name: string, type?: TrekType) => void;
    setDepartureDate: (date: Date | null) => void;
    addItemToPack: (item: PackedItem) => void;
    removeItemFromPack: (itemId: string) => void;
    moveItem: (itemId: string, compartment: Compartment) => void;
    clearPack: () => void;
    selectPack: (packId: string) => void;
    setTargetWeight: (weight: number) => void;
    addBudgetItem: (item: Omit<BudgetItem, 'id' | 'createdAt'>) => void;
    updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
    removeBudgetItem: (id: string) => void;
    setBudgetLimit: (limit: number) => void;
    syncPackBuilderToBudget: () => void;
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    completeTask: (id: string) => void;
    removeTask: (id: string) => void;
    updatePreparationScore: (key: keyof YetiState['preparationScores'], value: number) => void;
    reset: () => void;
}

type YetiStore = YetiState & YetiGetters & YetiActions;

const initialState: YetiState = {
    currentProjectId: 'project-gr20-default',
    projects: [{
        id: 'project-gr20-default',
        trekSlug: 'gr20-corse',
        trekName: 'GR20 Nord → Sud',
        departureDate: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        status: 'active',
        score: 79,
        budgetLimit: 1200,
    }],
    selectedTrekSlug: 'gr20-corse',
    selectedTrekName: 'GR20 Nord → Sud',
    selectedTrekType: 'hike',
    departureDate: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000),
    packedItems: [MOCK_GARAGE_ITEMS[0], MOCK_GARAGE_ITEMS[1], MOCK_GARAGE_ITEMS[2], MOCK_GARAGE_ITEMS[3], MOCK_GARAGE_ITEMS[4]],
    selectedPackId: 'osprey-talon-vert',
    targetWeight: 5000,
    gearLibrary: MOCK_GARAGE_ITEMS,
    budgetItems: [
        { id: 'b1', label: 'Vol A/R Nice-Calvi', amount: 180, paid: true, category: 'transport', source: 'manual', createdAt: new Date() },
        { id: 'b2', label: 'Ferry Bastia-Nice', amount: 55, paid: false, category: 'transport', source: 'manual', createdAt: new Date() },
        { id: 'b3', label: 'Navettes locales', amount: 40, paid: false, category: 'transport', source: 'manual', createdAt: new Date() },
        { id: 'b4', label: 'Lyophilisés 16j', amount: 160, paid: false, category: 'nourriture', source: 'manual', createdAt: new Date() },
        { id: 'b5', label: 'Refuges (8 nuits)', amount: 144, paid: false, category: 'hebergement', source: 'manual', createdAt: new Date() },
        { id: 'b6', label: 'Assurance rando', amount: 89, paid: true, category: 'assurance', source: 'manual', createdAt: new Date() },
    ],
    budgetLimit: 1200,
    tasks: [
        { id: 't1', label: 'Pack finalisé', status: 'done', date: '2025-01-15', phase: 'J-60' },
        { id: 't2', label: 'Ferry réservé', status: 'done', date: '2025-01-20', phase: 'J-60' },
        { id: 't3', label: 'Test terrain', status: 'active', date: '2025-01-28', phase: 'J-30' },
        { id: 't4', label: 'Ravitaillement', status: 'pending', date: '2025-02-05', phase: 'J-15' },
        { id: 't5', label: 'Réserver refuges', status: 'pending', date: '2025-02-01', phase: 'J-30', cost: 72 },
        { id: 't6', label: 'Cartouches gaz', status: 'pending', date: '2025-02-10', phase: 'J-15', cost: 25 },
    ],
    preparationScores: { materiel: 85, physique: 62, logistique: 90 },
};

export const useYetiStore = create<YetiStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            getSelectedPack: () => AVAILABLE_PACKS.find(p => p.id === get().selectedPackId) || AVAILABLE_PACKS[0],
            getTotalWeight: () => get().packedItems.reduce((sum, item) => sum + item.weight, 0),
            getTotalVolume: () => get().packedItems.reduce((sum, item) => sum + item.volume, 0),
            getPackPrice: () => get().packedItems.reduce((sum, item) => sum + (item.owned ? 0 : item.price), 0),
            getBaseWeight: () => (get().getSelectedPack().weight + get().getTotalWeight()) / 1000,
            
            getWeightByCategory: () => {
                const cats: Record<string, number> = {};
                get().packedItems.forEach(item => { cats[item.category] = (cats[item.category] || 0) + item.weight; });
                return cats;
            },

            getTotalBudget: () => get().budgetItems.reduce((sum, item) => sum + item.amount, 0),
            
            getBudgetByCategory: () => {
                const result: Record<BudgetCategory, number> = { transport: 0, materiel: 0, nourriture: 0, hebergement: 0, assurance: 0, divers: 0 };
                get().budgetItems.forEach(item => { result[item.category] += item.amount; });
                return result;
            },

            getPaidAmount: () => get().budgetItems.filter(i => i.paid).reduce((sum, item) => sum + item.amount, 0),
            getRemainingBudget: () => get().budgetLimit - get().getTotalBudget(),
            getTrekInfo: () => TREK_DATABASE[get().selectedTrekSlug] || null,
            
            getDaysUntilDeparture: () => {
                const date = get().departureDate;
                if (!date) return null;
                return Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            },

            getCurrentPhase: (): TimelinePhase => {
                const days = get().getDaysUntilDeparture();
                if (days === null) return 'J-60';
                if (days <= 0) return 'J-0';
                if (days <= 7) return 'J-7';
                if (days <= 15) return 'J-15';
                if (days <= 30) return 'J-30';
                return 'J-60';
            },

            getGlobalPreparationScore: () => {
                const s = get().preparationScores;
                return Math.round((s.materiel + s.physique + s.logistique) / 3);
            },

            getTasksByPhase: () => {
                const result: Record<TimelinePhase, Task[]> = { 'J-60': [], 'J-30': [], 'J-15': [], 'J-7': [], 'J-0': [] };
                get().tasks.forEach(task => { result[task.phase].push(task); });
                return result;
            },

            getActiveTasks: () => get().tasks.filter(t => t.status === 'active' || t.status === 'pending'),
            getCompletedTasksCount: () => get().tasks.filter(t => t.status === 'done').length,

            createProject: (trekSlug, departureDate) => {
                const id = `project-${Date.now()}`;
                const trekInfo = TREK_DATABASE[trekSlug];
                set(state => ({
                    projects: [...state.projects, { id, trekSlug, trekName: trekInfo?.name || trekSlug, departureDate: departureDate || null, createdAt: new Date(), status: 'active', score: 0, budgetLimit: 1500 }],
                    currentProjectId: id,
                    selectedTrekSlug: trekSlug,
                    selectedTrekName: trekInfo?.name || trekSlug,
                    departureDate: departureDate || null,
                }));
                return id;
            },

            setCurrentProject: (id) => {
                const project = get().projects.find(p => p.id === id);
                if (project) set({ currentProjectId: id, selectedTrekSlug: project.trekSlug, selectedTrekName: project.trekName, departureDate: project.departureDate, budgetLimit: project.budgetLimit });
            },

            updateProjectBudgetLimit: (limit) => {
                const projectId = get().currentProjectId;
                if (projectId) set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, budgetLimit: limit } : p), budgetLimit: limit }));
            },

            selectTrek: (slug, name, type = 'hike') => set({ selectedTrekSlug: slug, selectedTrekName: name, selectedTrekType: type }),
            setDepartureDate: (date) => set({ departureDate: date }),

            addItemToPack: (item) => {
                if (get().packedItems.find(i => i.id === item.id)) return;
                set(state => ({ packedItems: [...state.packedItems, item] }));
                if (item.price > 0 && !item.owned) get().syncPackBuilderToBudget();
            },

            removeItemFromPack: (itemId) => set(state => ({ packedItems: state.packedItems.filter(i => i.id !== itemId) })),
            moveItem: (itemId, compartment) => set(state => ({ packedItems: state.packedItems.map(i => i.id === itemId ? { ...i, compartment } : i) })),
            clearPack: () => set({ packedItems: [] }),
            selectPack: (packId) => set({ selectedPackId: packId }),
            setTargetWeight: (weight) => set({ targetWeight: weight }),

            addBudgetItem: (item) => set(state => ({ budgetItems: [...state.budgetItems, { ...item, id: `budget-${Date.now()}`, createdAt: new Date() }] })),
            updateBudgetItem: (id, updates) => set(state => ({ budgetItems: state.budgetItems.map(item => item.id === id ? { ...item, ...updates } : item) })),
            removeBudgetItem: (id) => set(state => ({ budgetItems: state.budgetItems.filter(item => item.id !== id) })),
            setBudgetLimit: (limit) => set({ budgetLimit: limit }),

            syncPackBuilderToBudget: () => {
                const { packedItems, budgetItems } = get();
                const itemsToBuy = packedItems.filter(item => !item.owned && item.price > 0);
                const existingIds = budgetItems.filter(b => b.source === 'packbuilder').map(b => b.sourceId);
                const newItems: BudgetItem[] = itemsToBuy.filter(item => !existingIds.includes(item.id)).map(item => ({
                    id: `budget-pack-${item.id}`, label: item.name, amount: item.price, note: `Pack Builder • ${item.brand || item.category}`,
                    paid: false, category: 'materiel', source: 'packbuilder', sourceId: item.id, createdAt: new Date()
                }));
                if (newItems.length > 0) set(state => ({ budgetItems: [...state.budgetItems, ...newItems] }));
            },

            addTask: (task) => set(state => ({ tasks: [...state.tasks, { ...task, id: `task-${Date.now()}` }] })),
            updateTask: (id, updates) => set(state => ({ tasks: state.tasks.map(task => task.id === id ? { ...task, ...updates } : task) })),
            completeTask: (id) => set(state => ({ tasks: state.tasks.map(task => task.id === id ? { ...task, status: 'done' } : task) })),
            removeTask: (id) => set(state => ({ tasks: state.tasks.filter(task => task.id !== id) })),
            updatePreparationScore: (key, value) => set(state => ({ preparationScores: { ...state.preparationScores, [key]: Math.max(0, Math.min(100, value)) } })),
            reset: () => set(initialState),
        }),
        { name: 'yeti-storage-v2', partialize: (state) => ({ currentProjectId: state.currentProjectId, projects: state.projects, selectedTrekSlug: state.selectedTrekSlug, selectedTrekName: state.selectedTrekName, packedItems: state.packedItems, selectedPackId: state.selectedPackId, targetWeight: state.targetWeight, budgetItems: state.budgetItems, budgetLimit: state.budgetLimit, tasks: state.tasks, preparationScores: state.preparationScores }) }
    )
);

export const selectPackedItems = (state: YetiStore) => state.packedItems;
export const selectBudgetItems = (state: YetiStore) => state.budgetItems;
export const selectTasks = (state: YetiStore) => state.tasks;
