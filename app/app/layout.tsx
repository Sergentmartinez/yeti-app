"use client";

import { BasecampSidebar } from '@/components/layout/BasecampSidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <BasecampSidebar />
      <main className="flex-1 ml-64 relative z-50">
        {children}
      </main>
    </div>
  );
}
