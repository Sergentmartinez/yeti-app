import { cn } from "@/lib/utils";

interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; padding?: "none" | "sm" | "md" | "lg"; }

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  const paddings = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <div className={cn("bg-white border border-stone-200 rounded-2xl shadow-sm", hover && "hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer", paddings[padding], className)}>
      {children}
    </div>
  );
}
