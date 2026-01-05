// Fichier : lib/data.ts
// RÔLE : Gestionnaire de données globales + Pont vers le module Treks

import { Trek, User } from "@/types";

// 1. IMPORTATION DU SYSTÈME MODULAIRE (Le "Futur")
// On importe les fonctions depuis votre dossier 'treks' bien rangé
import { getAllTreks as fetchTreks, getTrekBySlug as fetchTrekSlug } from "@/lib/treks";

// --- A. PONT POUR LES TREKS (Bridge) ---
// Ces fonctions permettent aux anciennes pages de continuer à fonctionner
// en redirigeant les demandes vers le nouveau système propre.

export const TREKS = fetchTreks(); // Pour compatibilité

export function getAllTreks(): Trek[] {
  return fetchTreks();
}

export function getOneTrek(slug: string): Trek | undefined {
  return fetchTrekSlug(slug);
}

export function getTrekBySlug(slug: string): Trek | undefined {
  return fetchTrekSlug(slug);
}


// --- B. DONNÉES UTILISATEUR (MOCK) ---
// Ces données restent ici pour l'instant (Profil, Header...)

export const MOCK_USER: User = {
  id: 'user-001',
  username: 'Thomas',
  // La propriété 'name' a été retirée pour corriger l'erreur TypeScript
  email: 'thomas@yeti.app',
  role: 'user',
  level: 3, 
  experience: 'intermediate',
  stats: {
    height: 180,
    weight: 75,
    torsoLength: 52,
    apparelSize: 'L',
    gender: 'male'
  },
};


// --- C. DONNÉES EXPERTS ---
// Gestion des guides et experts YETI

export type Expert = {
  id: string;
  name: string;
  title: string;
  bio: string;
  followers: number;
  certifiedPacks: number;
  treksCompleted: string[];
  photoUrl?: string;
};

const EXPERTS_DATA: Expert[] = [
  {
    id: 'expert-001',
    name: 'Pierre Dupont',
    title: 'Guide de Haute Montagne',
    bio: 'Guide certifié UIAGM avec plus de 20 ans d\'expérience sur les sentiers alpins. Spécialiste du GR20 et du Tour du Mont-Blanc.',
    followers: 12500,
    certifiedPacks: 8,
    treksCompleted: ['gr20-corse', 'tour-mont-blanc'],
    photoUrl: '/images/experts/pierre.jpg'
  },
  {
    id: 'expert-002',
    name: 'Marie Lefevre',
    title: 'Pèlerine & Auteure',
    bio: 'Passionnée des chemins de Compostelle, Marie a parcouru plus de 5000 km sur les différentes routes jacquaires.',
    followers: 8900,
    certifiedPacks: 5,
    treksCompleted: ['camino'],
    photoUrl: '/images/experts/marie.jpg'
  },
];

export function getExpertById(id: string): Expert | undefined {
  return EXPERTS_DATA.find(e => e.id === id);
}

export function getAllExperts(): Expert[] {
  return EXPERTS_DATA;
}