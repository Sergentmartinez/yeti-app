export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR");
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty >= 4.5) return "text-red-600";
  if (difficulty >= 4) return "text-red-500";
  if (difficulty >= 3) return "text-orange-500";
  if (difficulty >= 2) return "text-yellow-500";
  return "text-green-500";
}
