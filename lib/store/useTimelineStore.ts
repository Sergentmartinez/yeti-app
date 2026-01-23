// ============================================================================
// TIMELINE STORE - Zustand + State Management (Google Tasks Edition)
// ============================================================================

import { create } from 'zustand';
import { Task, Phase, TimelineStats, Priority, TaskStatus, Subtask, TaskList } from '@/lib/types/timeline';

interface Filters {
  priority: 'all' | 'critical' | 'high' | 'medium' | 'low';
  tag: string | null;
}

interface TimelineStore {
  // State
  phases: Phase[];
  lists: TaskList[]; // New: multi-listes Google Tasks
  activeListId: string | null; // New: liste active
  showCompleted: boolean;
  stats: TimelineStats;
  filters: Filters;

  // Actions - Tasks
  addTask: (phaseId: string, task: Partial<Task>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  moveTask: (taskId: string, newPhaseId: string) => void;
  toggleStar: (taskId: string) => void;
  setDeadline: (taskId: string, deadline: Date | undefined) => void;

  // Actions - Drag & Drop
  reorderTaskInPhase: (phaseId: string, oldIndex: number, newIndex: number) => void;
  moveTaskToPhase: (taskId: string, fromPhaseId: string, toPhaseId: string, newIndex: number) => void;

  // Actions - Subtasks
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  // Actions - Lists (New)
  addList: (name: string, icon?: string) => void;
  updateList: (listId: string, updates: Partial<TaskList>) => void;
  deleteList: (listId: string) => void;
  setActiveList: (listId: string | null) => void;

  // Actions - UI
  toggleShowCompleted: () => void;
  recomputeStats: () => void;
  loadFromTemplate: (templateName: string) => void;
  setFilterPriority: (priority: Filters['priority']) => void;
  setFilterTag: (tag: string | null) => void;
  getAllTags: () => string[];

  // Helpers (New)
  getTasksByList: (listId: string) => Task[];
  getActiveListTasks: () => Task[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to reorder array
const arrayMove = <T,>(array: T[], from: number, to: number): T[] => {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
};

// Icons are now identifiers that PhaseIcon component will convert to Lucide icons
const defaultPhases: Phase[] = [
  {
    id: 'planning',
    name: 'Planification',
    icon: 'planning',
    dateRange: 'J-60 → J-45',
    tasks: []
  },
  {
    id: 'equipment',
    name: 'Équipement',
    icon: 'equipment',
    dateRange: 'J-45 → J-21',
    tasks: []
  },
  {
    id: 'supplies',
    name: 'Ravitaillement',
    icon: 'supplies',
    dateRange: 'J-21 → J-7',
    tasks: []
  },
  {
    id: 'final',
    name: 'Dernier Sprint',
    icon: 'final',
    dateRange: 'J-7 → J-0',
    tasks: []
  }
];

const computeStats = (phases: Phase[]): TimelineStats => {
  const allTasks = phases.flatMap(p => p.tasks);
  const completed = allTasks.filter(t => t.status === 'done').length;
  const critical = allTasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;
  
  const overdue = allTasks.filter(t => {
    if (t.status === 'done') return false;
    const match = t.dueDate.match(/J-(\d+)/);
    if (!match) return false;
    const days = parseInt(match[1]);
    return days < 0;
  }).length;

  return {
    totalTasks: allTasks.length,
    completedTasks: completed,
    criticalTasks: critical,
    overdueTasks: overdue,
    progressPercentage: allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0
  };
};

// ============================================================================
// GR20 TEMPLATE
// ============================================================================

const GR20_TEMPLATE_TASKS: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // PLANNING PHASE
  {
    title: 'Réserver refuges GR20',
    description: 'Contacter le Parc Naturel Régional de Corse',
    phaseId: 'planning',
    status: 'todo',
    priority: 'critical',
    dueDate: 'J-60',
    tags: ['logistique', 'urgent'],
    subtasks: [
      { id: 'st1', title: 'Refuge Ortu di u Piobbu', isCompleted: false },
      { id: 'st2', title: 'Refuge de Paliri', isCompleted: false },
      { id: 'st3', title: 'Refuge Petra Piana', isCompleted: false }
    ]
  },
  {
    title: 'Planifier itinéraire détaillé',
    description: 'Étapes, horaires, refuges',
    phaseId: 'planning',
    status: 'todo',
    priority: 'high',
    dueDate: 'J-55',
    tags: ['préparation'],
    subtasks: []
  },
  {
    title: 'Vérifier conditions météo',
    description: 'Fenêtre optimale juin-septembre',
    phaseId: 'planning',
    status: 'todo',
    priority: 'medium',
    dueDate: 'J-50',
    tags: ['météo'],
    subtasks: []
  },
  {
    title: 'Souscrire assurance montagne',
    description: 'CAF ou assurance privée',
    phaseId: 'planning',
    status: 'todo',
    priority: 'high',
    dueDate: 'J-45',
    tags: ['administratif'],
    subtasks: []
  },

  // EQUIPMENT PHASE
  {
    title: 'Acheter tente ultra-légère',
    description: 'MSR Hubba Hubba ou équivalent',
    phaseId: 'equipment',
    status: 'todo',
    priority: 'critical',
    dueDate: 'J-40',
    tags: ['matériel', 'bivouac'],
    subtasks: []
  },
  {
    title: 'Tester système de filtration eau',
    description: 'Sawyer Mini ou Katadyn',
    phaseId: 'equipment',
    status: 'todo',
    priority: 'high',
    dueDate: 'J-35',
    tags: ['eau', 'matériel'],
    subtasks: []
  },
  {
    title: 'Vérifier chaussures de montagne',
    description: 'Rodage 50km minimum',
    phaseId: 'equipment',
    status: 'todo',
    priority: 'critical',
    dueDate: 'J-30',
    tags: ['matériel', 'urgent'],
    subtasks: [
      { id: 'st4', title: 'Marche test 10km', isCompleted: false },
      { id: 'st5', title: 'Marche test 20km', isCompleted: false }
    ]
  },
  {
    title: 'Acheter sac à dos 40-50L',
    description: 'Osprey Exos ou équivalent',
    phaseId: 'equipment',
    status: 'todo',
    priority: 'high',
    dueDate: 'J-35',
    tags: ['matériel'],
    subtasks: []
  },
  {
    title: 'Préparer kit premiers secours',
    description: 'Pansements, antiseptique, anti-inflammatoire',
    phaseId: 'equipment',
    status: 'todo',
    priority: 'high',
    dueDate: 'J-25',
    tags: ['sécurité', 'santé'],
    subtasks: []
  },

  // SUPPLIES PHASE
  {
    title: 'Planifier ravitaillement nourriture',
    description: 'Lyophilisé + barres énergétiques',
    phaseId: 'supplies',
    status: 'todo',
    priority: 'high',
    dueDate: 'J-20',
    tags: ['nourriture'],
    subtasks: [
      { id: 'st6', title: 'Petit-déjeuners (16x)', isCompleted: false },
      { id: 'st7', title: 'Déjeuners (16x)', isCompleted: false },
      { id: 'st8', title: 'Dîners (16x)', isCompleted: false }
    ]
  },
  {
    title: 'Acheter réchaud + cartouches gaz',
    description: 'MSR PocketRocket + 4 cartouches',
    phaseId: 'supplies',
    status: 'todo',
    priority: 'medium',
    dueDate: 'J-18',
    tags: ['cuisine', 'matériel'],
    subtasks: []
  },
  {
    title: 'Préparer électrolytes',
    description: 'Pastilles Nuun ou équivalent',
    phaseId: 'supplies',
    status: 'todo',
    priority: 'medium',
    dueDate: 'J-15',
    tags: ['hydratation'],
    subtasks: []
  },

  // FINAL SPRINT PHASE
  {
    title: 'Test pack complet',
    description: 'Randonnée 2 jours avec équipement final',
    phaseId: 'final',
    status: 'todo',
    priority: 'critical',
    dueDate: 'J-7',
    tags: ['test', 'urgent'],
    subtasks: []
  },
  {
    title: 'Vérifier documents voyage',
    description: 'Carte identité, réservations, assurances',
    phaseId: 'final',
    status: 'todo',
    priority: 'high',
    dueDate: 'J-5',
    tags: ['administratif'],
    subtasks: []
  },
  {
    title: 'Charger batteries',
    description: 'Téléphone, batterie externe, frontale',
    phaseId: 'final',
    status: 'todo',
    priority: 'medium',
    dueDate: 'J-2',
    tags: ['électronique'],
    subtasks: []
  },
  {
    title: 'Briefing final conditions météo',
    description: 'Météo France Corse + refuges',
    phaseId: 'final',
    status: 'todo',
    priority: 'high',
    dueDate: 'J-1',
    tags: ['météo'],
    subtasks: []
  }
];

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  // Initial state
  phases: defaultPhases,
  lists: [],
  activeListId: null,
  showCompleted: true,
  stats: computeStats(defaultPhases),
  filters: {
    priority: 'all',
    tag: null,
  },

  // Add task
  addTask: (phaseId, taskData) => {
    const newTask: Task = {
      id: generateId(),
      title: taskData.title || 'Nouvelle tâche',
      description: taskData.description || '',
      phaseId,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || 'J-30',
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      notes: taskData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      phases: state.phases.map(phase =>
        phase.id === phaseId
          ? { ...phase, tasks: [...phase.tasks, newTask] }
          : phase
      )
    }));

    get().recomputeStats();
  },

  // Update task
  updateTask: (taskId, updates) => {
    set((state) => ({
      phases: state.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      }))
    }));

    get().recomputeStats();
  },

  // Delete task
  deleteTask: (taskId) => {
    set((state) => ({
      phases: state.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.filter(task => task.id !== taskId)
      }))
    }));

    get().recomputeStats();
  },

  // Toggle task completion
  toggleTask: (taskId) => {
    set((state) => ({
      phases: state.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId
            ? { 
                ...task, 
                status: task.status === 'done' ? 'todo' : 'done',
                updatedAt: new Date()
              }
            : task
        )
      }))
    }));

    get().recomputeStats();
  },

  // Move task between phases (simple - goes to end)
  moveTask: (taskId, newPhaseId) => {
    const state = get();
    let taskToMove: Task | null = null;

    const phasesWithoutTask = state.phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.filter(task => {
        if (task.id === taskId) {
          taskToMove = { ...task, phaseId: newPhaseId };
          return false;
        }
        return true;
      })
    }));

    if (taskToMove) {
      set({
        phases: phasesWithoutTask.map(phase =>
          phase.id === newPhaseId
            ? { ...phase, tasks: [...phase.tasks, taskToMove!] }
            : phase
        )
      });

      get().recomputeStats();
    }
  },

  // ============================================================================
  // DRAG & DROP ACTIONS
  // ============================================================================

  // Reorder task within same phase
  reorderTaskInPhase: (phaseId, oldIndex, newIndex) => {
    set((state) => ({
      phases: state.phases.map(phase => {
        if (phase.id !== phaseId) return phase;
        
        const newTasks = arrayMove(phase.tasks, oldIndex, newIndex);
        return { ...phase, tasks: newTasks };
      })
    }));
  },

  // Move task from one phase to another at specific position
  moveTaskToPhase: (taskId, fromPhaseId, toPhaseId, newIndex) => {
    set((state) => {
      let taskToMove: Task | null = null;

      // Remove from source phase
      const phasesWithoutTask = state.phases.map(phase => {
        if (phase.id !== fromPhaseId) return phase;
        
        const taskIndex = phase.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return phase;
        
        taskToMove = { ...phase.tasks[taskIndex], phaseId: toPhaseId };
        return {
          ...phase,
          tasks: phase.tasks.filter(t => t.id !== taskId)
        };
      });

      if (!taskToMove) return state;

      // Add to target phase at specific index
      const finalPhases = phasesWithoutTask.map(phase => {
        if (phase.id !== toPhaseId) return phase;
        
        const newTasks = [...phase.tasks];
        newTasks.splice(newIndex, 0, taskToMove!);
        return { ...phase, tasks: newTasks };
      });

      return { phases: finalPhases };
    });

    get().recomputeStats();
  },

  // Add subtask
  addSubtask: (taskId, title) => {
    const newSubtask: Subtask = {
      id: generateId(),
      title,
      isCompleted: false
    };

    set((state) => ({
      phases: state.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId
            ? { 
                ...task, 
                subtasks: [...task.subtasks, newSubtask],
                updatedAt: new Date()
              }
            : task
        )
      }))
    }));
  },

  // Delete subtask
  deleteSubtask: (taskId, subtaskId) => {
    set((state) => ({
      phases: state.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter(st => st.id !== subtaskId),
                updatedAt: new Date()
              }
            : task
        )
      }))
    }));
  },

  // Toggle subtask
  toggleSubtask: (taskId, subtaskId) => {
    set((state) => ({
      phases: state.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map(st =>
                  st.id === subtaskId
                    ? { ...st, isCompleted: !st.isCompleted }
                    : st
                ),
                updatedAt: new Date()
              }
            : task
        )
      }))
    }));
  },

  // Toggle show completed
  toggleShowCompleted: () => {
    set((state) => ({ showCompleted: !state.showCompleted }));
  },

  // Recompute stats
  recomputeStats: () => {
    const state = get();
    set({ stats: computeStats(state.phases) });
  },

  // Load from template
  loadFromTemplate: (templateName) => {
    if (templateName === 'GR20') {
      const phasesWithTasks = defaultPhases.map(phase => ({
        ...phase,
        tasks: GR20_TEMPLATE_TASKS
          .filter(t => t.phaseId === phase.id)
          .map(t => ({
            ...t,
            id: generateId(),
            subtasks: t.subtasks.map(st => ({
              ...st,
              id: generateId()
            })),
            createdAt: new Date(),
            updatedAt: new Date()
          }))
      }));

      set({ phases: phasesWithTasks });
      get().recomputeStats();
    }
  },

  // Toggle star
  toggleStar: (taskId) => {
    set((state) => ({
      phases: state.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId
            ? { ...task, starred: !task.starred, updatedAt: new Date() }
            : task
        )
      }))
    }));
  },

  // Set deadline
  setDeadline: (taskId, deadline) => {
    set((state) => ({
      phases: state.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId
            ? { ...task, deadline, updatedAt: new Date() }
            : task
        )
      }))
    }));
  },

  // Add list
  addList: (name, icon) => {
    const newList: TaskList = {
      id: generateId(),
      name,
      icon: icon || 'list',
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      lists: [...state.lists, newList]
    }));
  },

  // Update list
  updateList: (listId, updates) => {
    set((state) => ({
      lists: state.lists.map(list =>
        list.id === listId
          ? { ...list, ...updates, updatedAt: new Date() }
          : list
      )
    }));
  },

  // Delete list
  deleteList: (listId) => {
    set((state) => ({
      lists: state.lists.filter(list => list.id !== listId),
      activeListId: state.activeListId === listId ? null : state.activeListId
    }));
  },

  // Set active list
  setActiveList: (listId) => {
    set({ activeListId: listId });
  },

  // Get tasks by list
  getTasksByList: (listId) => {
    const state = get();
    const list = state.lists.find(l => l.id === listId);
    return list ? list.tasks : [];
  },

  // Get active list tasks
  getActiveListTasks: () => {
    const state = get();
    if (!state.activeListId) return [];
    return state.getTasksByList(state.activeListId);
  },

  // Set priority filter
  setFilterPriority: (priority) => {
    set({ filters: { ...get().filters, priority } });
  },

  // Set tag filter
  setFilterTag: (tag) => {
    set({ filters: { ...get().filters, tag } });
  },

  // Get all unique tags from all tasks
  getAllTags: () => {
    const state = get();
    const allTags = new Set<string>();
    state.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        task.tags.forEach(tag => allTags.add(tag));
      });
    });
    return Array.from(allTags).sort();
  }
}));
