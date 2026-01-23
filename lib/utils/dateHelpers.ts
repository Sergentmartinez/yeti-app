// lib/utils/dateHelpers.ts
import { differenceInDays, format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Calcule le nombre de jours avant le départ (J-X)
 */
export function getDaysUntilDeparture(departureDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(departureDate, today);
}

/**
 * Convertit une date J-X en date absolue
 */
export function jDateToAbsolute(jDate: string, departureDate: Date): Date {
  const match = jDate.match(/J-(\d+)/);
  if (!match) return departureDate;
  
  const daysBeforeDeparture = parseInt(match[1], 10);
  return subDays(departureDate, daysBeforeDeparture);
}

/**
 * Convertit une date absolue en format J-X
 */
export function absoluteToJDate(date: Date, departureDate: Date): string {
  const daysUntil = differenceInDays(departureDate, date);
  if (daysUntil < 0) return 'J+' + Math.abs(daysUntil);
  return 'J-' + daysUntil;
}

/**
 * Formatte une date de manière lisible
 */
export function formatDate(date: Date): string {
  return format(date, 'dd MMMM yyyy', { locale: fr });
}

/**
 * Formatte une date courte
 */
export function formatDateShort(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

/**
 * Vérifie si une tâche est en retard
 */
export function isTaskOverdue(taskDueDate: string, currentJ: number, status: string): boolean {
  if (status === 'done' || status === 'archived') return false;
  
  const match = taskDueDate.match(/J-(\d+)/);
  if (!match) return false;
  
  const taskJ = parseInt(match[1], 10);
  return taskJ > currentJ; // J-45 est en retard si on est à J-30
}

/**
 * Retourne la classe CSS pour un indicateur J-X
 */
export function getJDateColorClass(jDate: string): string {
  const match = jDate.match(/J-(\d+)/);
  if (!match) return 'text-slate-400';
  
  const days = parseInt(match[1], 10);
  
  if (days <= 7) return 'text-red-400 font-bold';
  if (days <= 14) return 'text-orange-400 font-semibold';
  if (days <= 30) return 'text-yellow-400';
  return 'text-slate-400';
}
