"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Backpack, Box, Flag, Compass, Activity, Check, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import HorizontalTimeline from "./HorizontalTimeline";
import { useTimelineStore } from "@/lib/store/useTimelineStore";
import { useYetiStore } from "@/lib/store/useYetiStore";

const TimelineMissionBlock = () => {
  const router = useRouter();
  const { phases } = useTimelineStore();
  const { getDaysUntilDeparture, departureDate } = useYetiStore();
  
  const daysUntil = getDaysUntilDeparture() || 58;

  const allTasks = phases.flatMap(p => p.tasks).sort((a, b) => {
    const getJ = (s: string) => parseInt(s.replace('J-', '')) || 0;
    return getJ(b.dueDate) - getJ(a.dueDate);
  });

  const urgentTasks = allTasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
       const getJ = (s: string) => parseInt(s.replace('J-', '')) || 0;
       return getJ(a.dueDate) - getJ(b.dueDate);
    })
    .slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      {/* NEW COUNTDOWN SECTION */}
      <div className="mb-10">
         <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Départ</span>
         <div className="flex items-baseline justify-between">
            <h2 className="text-[80px] font-black leading-none tracking-tighter text-white">
               <span className="text-orange-500">J</span>-{daysUntil}
            </h2>
            <span className="text-xs font-bold text-zinc-600">21 mars 2026</span>
         </div>
      </div>

      {/* PROGRESSION (DOTS) */}
      <HorizontalTimeline currentJ={daysUntil} maxJ={60} />

      {/* TÂCHES PRIORITAIRES (NEW STYLE) */}
      <div className="mt-4 mb-8">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-4 ml-2">Tâches prioritaires</span>
        <div className="space-y-2">
          {urgentTasks.map((task) => (
            <div 
              key={task.id}
              className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-900/50 transition-all group"
              onClick={() => router.push('/basecamp/timeline')}
            >
                <div className="w-5 h-5 rounded border border-zinc-700 group-hover:border-zinc-500 transition-colors" />
                <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-200 truncate flex-1 tracking-tight">{task.title}</span>
                <span className="text-red-500 font-black text-xs animate-pulse">!</span>
            </div>
          ))}
          {urgentTasks.length === 0 && (
             <div className="text-zinc-700 text-[10px] font-bold italic ml-2">Aucune alerte en cours</div>
          )}
        </div>
      </div>

      {/* SCROLLABLE VERTICAL TIMELINE */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-y-0 left-[20px] w-px bg-zinc-800/80" />
        
        <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-10 pt-4 pb-8">
          {allTasks.map((task) => {
            const isDone = task.status === 'done';
            const isInProgress = task.status === 'in-progress';
            
            return (
              <div key={task.id} className="relative pl-14 group cursor-pointer" onClick={() => router.push('/basecamp/timeline')}>
                {/* Dot */}
                <div className={cn(
                  "absolute left-[15px] top-1.5 w-2.5 h-2.5 rounded-full border transition-all duration-500 z-10",
                  isDone ? "bg-zinc-800 border-zinc-700" : 
                  isInProgress ? "bg-orange-500 border-white shadow-[0_0_15px_rgba(249,115,22,0.8)] scale-125" :
                  "bg-zinc-900 border-zinc-800 group-hover:border-zinc-600"
                )} />

                {/* Content */}
                <div className={cn(
                  "transition-all duration-300",
                  isInProgress ? "bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 shadow-xl -mt-4 mb-4" : ""
                )}>
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isDone ? "text-zinc-700" : isInProgress ? "text-orange-500" : "text-zinc-600"
                    )}>
                      15 JAN
                    </span>
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        "text-base font-black tracking-tight",
                        isDone ? "text-zinc-600 line-through" : "text-zinc-300 group-hover:text-white"
                      )}>
                        {task.title}
                      </h4>
                      {isInProgress && (
                        <span className="bg-orange-500 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase">
                          En cours
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineMissionBlock;
