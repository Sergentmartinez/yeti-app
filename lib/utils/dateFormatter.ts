/**
 * Format intelligent des dates pour l'affichage des tâches
 * - "Hier" (rouge) si date passée
 * - "Aujourd'hui"
 * - "Demain"
 * - "Sam. 31 janvier" pour les dates proches
 * - "Sam. 31 janvier 2027" si année différente
 */

export function formatSmartDate(dateString: string): {
  text: string;
  color: 'red' | 'orange' | 'blue' | 'gray';
  isOverdue: boolean;
} {
  // Parse "J-X", "J+X" ou date ISO
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let targetDate: Date;
  
  // Si format "J-X" ou "J+X"
  const jMatch = dateString.match(/^J([+-]?\d+)$/);
  if (jMatch) {
    const days = parseInt(jMatch[1]);
    targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
  } else {
    // Sinon essayer de parser comme date ISO
    targetDate = new Date(dateString);
    if (isNaN(targetDate.getTime())) {
      // Si parsing échoue, retourner le string tel quel
      return {
        text: dateString,
        color: 'gray',
        isOverdue: false
      };
    }
  }
  
  targetDate.setHours(0, 0, 0, 0);
  
  // Calculer différence en jours
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Hier (rouge - overdue)
  if (diffDays === -1) {
    return {
      text: 'Hier',
      color: 'red',
      isOverdue: true
    };
  }
  
  // Dates passées (rouge - overdue)
  if (diffDays < -1) {
    const dayName = targetDate.toLocaleDateString('fr-FR', { weekday: 'short' });
    const day = targetDate.getDate();
    const month = targetDate.toLocaleDateString('fr-FR', { month: 'long' });
    const year = targetDate.getFullYear();
    
    if (year !== today.getFullYear()) {
      return {
        text: `${dayName} ${day} ${month} ${year}`,
        color: 'red',
        isOverdue: true
      };
    }
    
    return {
      text: `${dayName} ${day} ${month}`,
      color: 'red',
      isOverdue: true
    };
  }
  
  // Aujourd'hui
  if (diffDays === 0) {
    return {
      text: 'Aujourd\'hui',
      color: 'blue',
      isOverdue: false
    };
  }
  
  // Demain
  if (diffDays === 1) {
    return {
      text: 'Demain',
      color: 'orange',
      isOverdue: false
    };
  }
  
  // Cette semaine (2-7 jours)
  if (diffDays >= 2 && diffDays <= 7) {
    const dayName = targetDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    return {
      text: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      color: 'gray',
      isOverdue: false
    };
  }
  
  // Dates futures
  const dayName = targetDate.toLocaleDateString('fr-FR', { weekday: 'short' });
  const day = targetDate.getDate();
  const month = targetDate.toLocaleDateString('fr-FR', { month: 'long' });
  const year = targetDate.getFullYear();
  
  // Si année différente, inclure l'année
  if (year !== today.getFullYear()) {
    return {
      text: `${dayName} ${day} ${month} ${year}`,
      color: 'gray',
      isOverdue: false
    };
  }
  
  return {
    text: `${dayName} ${day} ${month}`,
    color: 'gray',
    isOverdue: false
  };
}
