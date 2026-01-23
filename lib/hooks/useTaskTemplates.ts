// lib/hooks/useTaskTemplates.ts
import { Task, TaskStatus, Priority } from '@/lib/types/timeline';

// Template pour le GR20
export const GR20_TEMPLATE: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'subtasks'>[] = [
  // PLANIFICATION (J-60 → J-45)
  {
    phaseId: 'plan',
    title: 'Réserver les refuges',
    description: 'Réserver tous les refuges via le site du Parc Naturel Régional de Corse',
    dueDate: 'J-60',
    status: 'todo' as TaskStatus,
    priority: 'critical' as Priority,
    tags: ['admin', 'hébergement'],
    estimatedTime: 120
  },
  {
    phaseId: 'plan',
    title: 'Acheter billets avion/ferry',
    description: 'Vol Paris-Ajaccio ou Ferry Marseille-Bastia',
    dueDate: 'J-60',
    status: 'todo' as TaskStatus,
    priority: 'critical' as Priority,
    tags: ['admin', 'transport'],
    estimatedTime: 60
  },
  {
    phaseId: 'plan',
    title: 'Valider l\'itinéraire',
    description: 'Nord-Sud ou Sud-Nord ? Variantes alpines ?',
    dueDate: 'J-55',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['itinéraire'],
    estimatedTime: 90
  },
  {
    phaseId: 'plan',
    title: 'Télécharger les traces GPX',
    description: 'Récupérer les traces officielles + variantes',
    dueDate: 'J-50',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['navigation'],
    estimatedTime: 30
  },
  {
    phaseId: 'plan',
    title: 'Souscrire assurance rapatriement',
    description: 'Vérifier la couverture montagne + hélico',
    dueDate: 'J-45',
    status: 'todo' as TaskStatus,
    priority: 'critical' as Priority,
    tags: ['admin', 'sécurité'],
    estimatedTime: 45
  },

  // ÉQUIPEMENT (J-45 → J-21)
  {
    phaseId: 'gear',
    title: 'Tester les chaussures sur 20km',
    description: 'Marche test avec dénivelé pour vérifier l\'amorti',
    dueDate: 'J-45',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['gear', 'test'],
    estimatedTime: 300
  },
  {
    phaseId: 'gear',
    title: 'Vérifier état tente/abri',
    description: 'Tester l\'étanchéité, vérifier sardines et arceaux',
    dueDate: 'J-40',
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    tags: ['gear', 'bivouac'],
    estimatedTime: 60
  },
  {
    phaseId: 'gear',
    title: 'Tester réchaud + cartouche gaz',
    description: 'Vérifier temps d\'ébullition 1L',
    dueDate: 'J-35',
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    tags: ['gear', 'cuisine'],
    estimatedTime: 30
  },
  {
    phaseId: 'gear',
    title: 'Recharger batteries lampe frontale',
    description: 'Tester autonomie mode haute intensité',
    dueDate: 'J-30',
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    tags: ['gear', 'électronique'],
    estimatedTime: 15
  },
  {
    phaseId: 'gear',
    title: 'Imperméabiliser chaussures',
    description: 'Appliquer spray déperlant 48h avant départ',
    dueDate: 'J-25',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['gear', 'entretien'],
    estimatedTime: 30
  },
  {
    phaseId: 'gear',
    title: 'Créer kit réparation',
    description: 'Duct tape, rustines, fil+aiguille, colle néoprène',
    dueDate: 'J-21',
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    tags: ['gear', 'réparation'],
    estimatedTime: 45
  },

  // RAVITAILLEMENT (J-21 → J-7)
  {
    phaseId: 'food',
    title: 'Commander lyophilisés',
    description: '16 repas + 2 de secours',
    dueDate: 'J-21',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['food', 'commande'],
    estimatedTime: 60
  },
  {
    phaseId: 'food',
    title: 'Préparer sachets petit-déj',
    description: 'Portions individuelles flocons d\'avoine + fruits secs',
    dueDate: 'J-14',
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    tags: ['food', 'préparation'],
    estimatedTime: 90
  },
  {
    phaseId: 'food',
    title: 'Constituer stocks barres énergétiques',
    description: '30 barres + gels énergétiques',
    dueDate: 'J-10',
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    tags: ['food', 'snacks'],
    estimatedTime: 30
  },
  {
    phaseId: 'food',
    title: 'Acheter pastilles purification eau',
    description: 'Micropur ou équivalent (50 pastilles)',
    dueDate: 'J-10',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['food', 'eau'],
    estimatedTime: 20
  },
  {
    phaseId: 'food',
    title: 'Compléter pharmacie',
    description: 'Anti-inflammatoires, pansements, Compeed, désinfectant',
    dueDate: 'J-7',
    status: 'todo' as TaskStatus,
    priority: 'critical' as Priority,
    tags: ['santé', 'pharmacie'],
    estimatedTime: 60
  },

  // DERNIER SPRINT (J-7 → J-0)
  {
    phaseId: 'start',
    title: 'Faire sac à blanc',
    description: 'Test final pour optimiser le poids',
    dueDate: 'J-7',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['sac', 'test'],
    estimatedTime: 60
  },
  {
    phaseId: 'start',
    title: 'Charger toutes les batteries',
    description: 'Téléphone, lampe frontale, batterie externe',
    dueDate: 'J-3',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['électronique'],
    estimatedTime: 15
  },
  {
    phaseId: 'start',
    title: 'Télécharger cartes offline',
    description: 'Maps.me ou équivalent avec zone GR20',
    dueDate: 'J-3',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['navigation', 'électronique'],
    estimatedTime: 30
  },
  {
    phaseId: 'start',
    title: 'Imprimer roadbook de secours',
    description: 'Version papier de l\'itinéraire + numéros urgence',
    dueDate: 'J-2',
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    tags: ['navigation', 'sécurité'],
    estimatedTime: 20
  },
  {
    phaseId: 'start',
    title: 'Prévenir proches + laisser itinéraire',
    description: 'Transmettre dates + refuges + numéro PGHM Corse',
    dueDate: 'J-1',
    status: 'todo' as TaskStatus,
    priority: 'critical' as Priority,
    tags: ['sécurité', 'communication'],
    estimatedTime: 30
  },
  {
    phaseId: 'start',
    title: 'Vérifier météo 5 jours',
    description: 'Ajuster équipement selon prévisions',
    dueDate: 'J-1',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['météo', 'planification'],
    estimatedTime: 15
  }
];

// Templates TMB et Camino (à compléter)
export const TMB_TEMPLATE: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'subtasks'>[] = [
  {
    phaseId: 'plan',
    title: 'Réserver refuges Tour du Mont-Blanc',
    description: '',
    dueDate: 'J-60',
    status: 'todo' as TaskStatus,
    priority: 'critical' as Priority,
    tags: ['admin', 'hébergement']
  }
  // ... autres tâches TMB
];

export const CAMINO_TEMPLATE: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'subtasks'>[] = [
  {
    phaseId: 'plan',
    title: 'Commander crédentiale du pèlerin',
    description: '',
    dueDate: 'J-60',
    status: 'todo' as TaskStatus,
    priority: 'high' as Priority,
    tags: ['admin', 'camino']
  }
  // ... autres tâches Camino
];

/**
 * Hook pour accéder aux templates
 */
export function useTaskTemplates() {
  const getTemplate = (name: string) => {
    switch (name) {
      case 'GR20':
        return GR20_TEMPLATE;
      case 'TMB':
        return TMB_TEMPLATE;
      case 'Camino':
        return CAMINO_TEMPLATE;
      default:
        return [];
    }
  };

  return { getTemplate, GR20_TEMPLATE, TMB_TEMPLATE, CAMINO_TEMPLATE };
}
