
'use client';

import React from 'react';
import Link from 'next/link';
import { SyncButton } from '@/presentation/components/ui/SyncButton';
import { Shield, Users, Wallet, ClipboardList, Package, LayoutDashboard } from 'lucide-react';

export function Navbar() {
    const navLinks = [
        { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
        { href: '/secretaria/hermanos', label: 'Secretaría', icon: Users },
        { href: '/tesoreria', label: 'Tesorería', icon: Wallet },
        { href: '/cofradia', label: 'Cofradía', icon: ClipboardList },
        { href: '/priostia', label: 'Priostía', icon: Package },
    ];

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="font-bold hidden md:inline-block text-xl tracking-tight">
                            ERP Hermandades
                        </span>
                    </Link>

                    <div className="hidden lg:flex gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <SyncButton />
                </div>
            </div>
        </nav>
    );
}

