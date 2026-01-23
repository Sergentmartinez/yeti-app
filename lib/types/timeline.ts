// ============================================================================
// TYPES TIMELINE - YETI (Google Tasks Edition)
// ============================================================================

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  phaseId: string; // Keep for backward compatibility
  listId?: string; // New: pour multi-listes Google Tasks
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // Format: "J-45" ou ISO date
  deadline?: Date; // New: date limite précise
  tags: string[];
  subtasks: Subtask[];
  notes?: string;
  estimatedTime?: number; // minutes (DEPRECATED)
  starred?: boolean; // New: système d'étoiles Google Tasks
  completedAt?: Date; // New: date de complétion
  parentId?: string; // New: pour hiérarchie de sous-tâches
  level?: number; // New: niveau d'indentation (0, 1, 2)
  order?: number; // New: ordre d'affichage dans la liste
  createdAt: Date;
  updatedAt: Date;
}

export interface Phase {
  id: string;
  name: string;
  icon: string;
  dateRange: string; // Ex: "J-60 → J-45"
  tasks: Task[];
}

// New: TaskList pour Google Tasks multi-listes
export interface TaskList {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineStats {
  totalTasks: number;
  completedTasks: number;
  criticalTasks: number;
  overdueTasks: number;
  starredTasks?: number; // New
  progressPercentage: number;
}
