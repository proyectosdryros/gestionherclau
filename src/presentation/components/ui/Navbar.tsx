
'use client';

import React from 'react';
import Link from 'next/link';
import { SyncButton } from '@/presentation/components/ui/SyncButton';
import { Shield } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="font-bold hidden sm:inline-block">
                            Gestor Hermandades
                        </span>
                    </Link>

                    <div className="flex gap-4 text-sm font-medium">
                        <Link href="/secretaria/hermanos" className="hover:text-primary transition-colors">
                            Secretaría
                        </Link>
                        <Link href="/tesoreria" className="text-muted-foreground hover:text-primary transition-colors">
                            Tesorería
                        </Link>
                        <Link href="/cofradia" className="text-muted-foreground hover:text-primary transition-colors">
                            Cofradía
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <SyncButton />
                </div>
            </div>
        </nav>
    );
}
