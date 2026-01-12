// app/basecamp/layout.tsx
import { BasecampSidebar } from '@/components/layout/BasecampSidebar';

export default function BasecampLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-bg-base transition-colors duration-300">
            <BasecampSidebar />
            <main className="flex-1 ml-64 relative z-10 min-h-screen"> 
                {children}
            </main>
        </div>
    );
}