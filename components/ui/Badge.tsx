import { cn } from "@/lib/utils";

interface BadgeProps { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "orange" | "spirit"; size?: "sm" | "md"; className?: string; }

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = { 
    default: "bg-stone-100 text-stone-700", 
    success: "bg-green-100 text-green-700", 
    warning: "bg-yellow-100 text-yellow-700", 
    danger: "bg-red-100 text-red-700", 
    orange: "bg-orange-100 text-orange-700", 
    spirit: "bg-blue-100 text-blue-700" 
  };
  const sizes = { sm: "px-2 py-0.5 text-[10px]", md: "px-3 py-1 text-xs" };
  return <span className={cn("inline-flex items-center gap-1 font-semibold uppercase tracking-wider rounded", variants[variant], sizes[size], className)}>{children}</span>;
}
