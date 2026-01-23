// app/basecamp/layout.tsx
'use client';

import { BasecampSidebar } from '@/components/layout/BasecampSidebar';

export default function BasecampLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg-base transition-colors duration-300">
            <BasecampSidebar />
            {/* Main content - utilise pl-64 par défaut, s'ajuste via CSS variable si besoin */}
            <main className="min-h-screen pl-64 transition-all duration-300">
                <div className="relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
