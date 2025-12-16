import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "spirit" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-lg",
    secondary: "bg-stone-900 text-white hover:bg-stone-800 shadow-lg",
    ghost: "bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20",
    spirit: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg",
    outline: "bg-transparent border-2 border-stone-300 text-stone-700 hover:border-orange-500 hover:text-orange-600",
  };
  const sizes = { sm: "px-4 py-2 text-xs", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" };
  return (
    <button className={cn("font-semibold tracking-wide transition-all duration-200 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50", variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
