
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { SyncButton } from '@/presentation/components/ui/SyncButton';
import { Shield, Users, Wallet, ClipboardList, Package, LayoutDashboard, LogOut, Tag } from 'lucide-react';

export function Navbar() {
    const router = useRouter();
    const navLinks = [
        { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
        { href: '/secretaria/hermanos', label: 'Secretaría', icon: Users },
        { href: '/tesoreria', label: 'Tesorería', icon: Wallet },
        { href: '/tesoreria/precios', label: 'Precios', icon: Tag },
        { href: '/cofradia', label: 'Cofradía', icon: ClipboardList },
        { href: '/priostia', label: 'Priostía', icon: Package },
    ];

    const handleLogout = async () => {
        try {
            await insforge.auth.signOut();
            router.push('/login');
            router.refresh(); // Force refresh to clear server components cache
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

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
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

