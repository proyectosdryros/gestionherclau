
import React from 'react';
import { Navbar } from '@/presentation/components/ui/Navbar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container max-w-7xl mx-auto py-6 px-4">
                {children}
            </main>
        </div>
    );
}
