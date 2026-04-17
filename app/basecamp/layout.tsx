// app/basecamp/layout.tsx
'use client';

import { BasecampSidebar } from '@/components/layout/BasecampSidebar';

export default function BasecampLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] transition-colors duration-300">
            <BasecampSidebar />
            {/* Main content - sidebar is 260px wide */}
            <main className="min-h-screen pl-[260px] transition-all duration-300">
                <div className="relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
