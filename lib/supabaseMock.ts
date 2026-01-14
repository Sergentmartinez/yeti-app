// lib/supabaseMock.ts
// Mock Supabase pour persistence locale via localStorage
// À remplacer par le vrai client Supabase en production

import { PackedItem } from "@/lib/store/useYetiStore";

// === TYPES ===

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: 'explorer' | 'trekker' | 'guide' | 'pioneer';
    avatar?: string;
    createdAt: Date;
    stats: {
        treksCompleted: number;
        totalDistance: number;
        totalElevation: number;
        configsShared: number;
    };
}

export interface SavedProject {
    id: string;
    userId: string;
    trekSlug: string;
    trekName: string;
    departureDate: string | null;
    status: 'draft' | 'active' | 'completed';
    score: number;
    createdAt: string;
    updatedAt: string;
    pack: PackedItem[];
    selectedPackId: string;
    notes?: string;
}

export interface SavedGearItem {
    id: string;
    userId: string;
    name: string;
    brand: string;
    weight: number;
    volume: number;
    price: number;
    category: string;
    emoji: string;
    owned: boolean;
    purchaseDate?: string;
    notes?: string;
}

// === STORAGE KEYS ===

const STORAGE_KEYS = {
    USER_PROFILE: 'yeti_user_profile',
    PROJECTS: 'yeti_projects',
    GEAR_INVENTORY: 'yeti_gear_inventory',
    SETTINGS: 'yeti_settings',
    SESSION: 'yeti_session',
};

// === HELPERS ===

function getStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage: ${key}`, error);
        return defaultValue;
    }
}

function setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage: ${key}`, error);
    }
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// === API MOCK ===

export const supabaseMock: any = {

    // === AUTH ===

    auth: {
        /**
         * Récupère le profil utilisateur actuel (ou crée un profil par défaut)
         */
        getUser: (): UserProfile => {
            const defaultUser: UserProfile = {
                id: 'user-default',
                username: 'Explorer',
                email: 'explorer@yeti.app',
                role: 'explorer',
                createdAt: new Date(),
                stats: {
                    treksCompleted: 0,
                    totalDistance: 0,
                    totalElevation: 0,
                    configsShared: 0,
                }
            };

            return getStorage(STORAGE_KEYS.USER_PROFILE, defaultUser);
        },

        /**
         * Met à jour le profil utilisateur
         */
        updateUser: (updates: Partial<UserProfile>): UserProfile => {
            const current = supabaseMock.auth.getUser();
            const updated = { ...current, ...updates };
            setStorage(STORAGE_KEYS.USER_PROFILE, updated);
            return updated;
        },

        /**
         * Simule une connexion (mock)
         */
        signIn: (email: string): { user: UserProfile; session: string } => {
            const user = supabaseMock.auth.getUser();
            user.email = email;
            setStorage(STORAGE_KEYS.USER_PROFILE, user);

            const session = generateId();
            setStorage(STORAGE_KEYS.SESSION, session);

            return { user, session };
        },

        /**
         * Simule une déconnexion
         */
        signOut: (): void => {
            localStorage.removeItem(STORAGE_KEYS.SESSION);
        },

        /**
         * Vérifie si l'utilisateur est connecté
         */
        isSignedIn: (): boolean => {
            return !!getStorage<string | null>(STORAGE_KEYS.SESSION, null);
        }
    },

    // === PROJETS ===

    projects: {
        /**
         * Récupère tous les projets de l'utilisateur
         */
        getAll: (): SavedProject[] => {
            return getStorage(STORAGE_KEYS.PROJECTS, []);
        },

        /**
         * Récupère un projet par son ID
         */
        getById: (projectId: string): SavedProject | null => {
            const projects = supabaseMock.projects.getAll();
            return projects.find((p: SavedProject) => p.id === projectId) || null;
        },

        /**
         * Crée un nouveau projet
         */
        create: (data: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>): SavedProject => {
            const projects = supabaseMock.projects.getAll();

            const newProject: SavedProject = {
                ...data,
                id: generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            projects.push(newProject);
            setStorage(STORAGE_KEYS.PROJECTS, projects);

            return newProject;
        },

        /**
         * Met à jour un projet existant
         */
        update: (projectId: string, updates: Partial<SavedProject>): SavedProject | null => {
            const projects = supabaseMock.projects.getAll();
            const index = projects.findIndex((p: SavedProject) => p.id === projectId);

            if (index === -1) return null;

            projects[index] = {
                ...projects[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            setStorage(STORAGE_KEYS.PROJECTS, projects);
            return projects[index];
        },

        /**
         * Supprime un projet
         */
        delete: (projectId: string): boolean => {
            const projects = supabaseMock.projects.getAll();
            const filtered = projects.filter((p: SavedProject) => p.id !== projectId);

            if (filtered.length === projects.length) return false;

            setStorage(STORAGE_KEYS.PROJECTS, filtered);
            return true;
        },

        /**
         * Récupère le projet actif (le plus récent avec status 'active')
         */
        getActive: (): SavedProject | null => {
            const projects = supabaseMock.projects.getAll();
            const active = projects
                .filter((p: SavedProject) => p.status === 'active')
                .sort((a: SavedProject, b: SavedProject) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            return active[0] || null;
        }
    },

    // === INVENTAIRE ÉQUIPEMENT ===

    gear: {
        /**
         * Récupère tout l'inventaire
         */
        getAll: (): SavedGearItem[] => {
            return getStorage(STORAGE_KEYS.GEAR_INVENTORY, []);
        },

        /**
         * Récupère uniquement les items possédés
         */
        getOwned: (): SavedGearItem[] => {
            return supabaseMock.gear.getAll().filter((item: SavedGearItem) => item.owned);
        },

        /**
         * Ajoute un item à l'inventaire
         */
        add: (item: Omit<SavedGearItem, 'id' | 'userId'>): SavedGearItem => {
            const inventory = supabaseMock.gear.getAll();
            const user = supabaseMock.auth.getUser();

            const newItem: SavedGearItem = {
                ...item,
                id: generateId(),
                userId: user.id,
            };

            inventory.push(newItem);
            setStorage(STORAGE_KEYS.GEAR_INVENTORY, inventory);

            return newItem;
        },

        /**
         * Met à jour un item
         */
        update: (itemId: string, updates: Partial<SavedGearItem>): SavedGearItem | null => {
            const inventory = supabaseMock.gear.getAll();
            const index = inventory.findIndex((i: SavedGearItem) => i.id === itemId);

            if (index === -1) return null;

            inventory[index] = { ...inventory[index], ...updates };
            setStorage(STORAGE_KEYS.GEAR_INVENTORY, inventory);

            return inventory[index];
        },

        /**
         * Supprime un item
         */
        delete: (itemId: string): boolean => {
            const inventory = supabaseMock.gear.getAll();
            const filtered = inventory.filter((i: SavedGearItem) => i.id !== itemId);

            if (filtered.length === inventory.length) return false;

            setStorage(STORAGE_KEYS.GEAR_INVENTORY, filtered);
            return true;
        },

        /**
         * Toggle la possession d'un item
         */
        toggleOwned: (itemId: string): boolean => {
            const inventory = supabaseMock.gear.getAll();
            const index = inventory.findIndex((i: SavedGearItem) => i.id === itemId);

            if (index === -1) return false;

            inventory[index].owned = !inventory[index].owned;
            setStorage(STORAGE_KEYS.GEAR_INVENTORY, inventory);

            return inventory[index].owned;
        }
    },

    // === SETTINGS ===

    settings: {
        /**
         * Récupère les paramètres
         */
        get: () => {
            return getStorage(STORAGE_KEYS.SETTINGS, {
                targetWeight: 8, // kg
                units: 'metric',
                language: 'fr',
                theme: 'dark',
                notifications: true,
            });
        },

        /**
         * Met à jour les paramètres
         */
        update: (updates: Record<string, unknown>) => {
            const current = supabaseMock.settings.get();
            const updated = { ...current, ...updates };
            setStorage(STORAGE_KEYS.SETTINGS, updated);
            return updated;
        }
    },

    // === UTILS ===

    utils: {
        /**
         * Exporte toutes les données utilisateur
         */
        exportData: () => {
            return {
                user: supabaseMock.auth.getUser(),
                projects: supabaseMock.projects.getAll(),
                gear: supabaseMock.gear.getAll(),
                settings: supabaseMock.settings.get(),
                exportedAt: new Date().toISOString(),
            };
        },

        /**
         * Importe des données utilisateur
         */
        importData: (data: ReturnType<typeof supabaseMock.utils.exportData>) => {
            if (data.user) setStorage(STORAGE_KEYS.USER_PROFILE, data.user);
            if (data.projects) setStorage(STORAGE_KEYS.PROJECTS, data.projects);
            if (data.gear) setStorage(STORAGE_KEYS.GEAR_INVENTORY, data.gear);
            if (data.settings) setStorage(STORAGE_KEYS.SETTINGS, data.settings);
        },

        /**
         * Réinitialise toutes les données
         */
        resetAll: () => {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }
};

// === EXPORT DEFAULT ===

export default supabaseMock;
