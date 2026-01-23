"use client";

import { useState } from "react";
import { PackHeader } from "@/components/pack-builder/PackHeader";
import { WeightSummaryCard } from "@/components/pack-builder/WeightSummaryCard";
import { PackItemList } from "@/components/pack-builder/PackItemList";
import { LibraryPicker } from "@/components/pack-builder/LibraryPicker";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Placeholder Card component (to be replaced or reused)
const Card = ({ children, className, title, noPadding }: { children: React.ReactNode; className?: string; title?: string; noPadding?: boolean }) => (
  <motion.div 
    className={cn(
      "rounded-2xl border border-white/10 bg-[#1c1c1e] overflow-hidden flex flex-col relative",
      !noPadding && "p-5",
      className
    )}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {title && (
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">{title}</span>
      </div>
    )}
    {children}
  </motion.div>
);

export default function PackBuilderPage() {
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <div className="min-h-screen text-white font-sans bg-black p-6 pb-32">
        <PackHeader onOpenLibrary={() => setLibraryOpen(true)} />

        <div className="grid grid-cols-12 gap-5">
            {/* LEFT COLUMN: STATS */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
                <Card className="min-h-[350px]">
                    <WeightSummaryCard />
                </Card>

                <Card title="Alertes & Conseils" className="min-h-[150px] border-l-4 border-l-blue-500/50">
                     <div className="text-sm text-zinc-400">
                        <span className="text-blue-400 font-bold block mb-1">Poids maîtrisé</span>
                        Votre sac est optimisé pour le GR20. Pensez à vérifier votre trousse de secours.
                     </div>
                </Card>
            </div>

            {/* RIGHT COLUMN: GEAR LIST */}
            <div className="col-span-12 lg:col-span-8">
                <Card title="Contenu du sac" className="min-h-[600px] h-full" noPadding>
                    <div className="p-1">
                        <PackItemList />
                    </div>
                </Card>
            </div>
        </div>

        <LibraryPicker isOpen={libraryOpen} onClose={() => setLibraryOpen(false)} />
    </div>
  );
}
