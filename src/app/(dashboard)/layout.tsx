
import React from 'react';
import { Sidebar } from '@/presentation/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 w-full overflow-hidden">
                <div className="container max-w-[1400px] mx-auto py-8 px-4 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
