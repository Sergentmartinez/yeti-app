"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, LucideIcon } from "lucide-react";

interface PhaseCardProps {
  title: string;
  icon: LucideIcon;
  status: "completed" | "in-progress" | "upcoming";
  onClick?: () => void;
}

const PhaseCard = ({ title, icon: Icon, status, onClick }: PhaseCardProps) => {
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";

  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-1 cursor-pointer group"
    >
      <div className={cn(
        "w-full h-16 rounded-xl flex items-center justify-center transition-all border",
        isCompleted ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
        isInProgress ? "bg-zinc-900 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : 
        "bg-zinc-900/40 border-white/5 text-zinc-600"
      )}>
        {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
      </div>
      
      <span className={cn(
        "text-[10px] font-black uppercase tracking-[0.2em]",
        isCompleted ? "text-emerald-500" : 
        isInProgress ? "text-cyan-400" : 
        "text-zinc-600"
      )}>
        {title === "Planification" ? "PLANIF" : 
         title === "Ravitaillement" ? "RAVITALL." : 
         title.toUpperCase()}
      </span>
    </div>
  );
};

export default PhaseCard;
