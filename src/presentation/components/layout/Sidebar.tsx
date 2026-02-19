
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Shield,
    LayoutDashboard,
    Users,
    Wallet,
    Tag,
    ClipboardList,
    Package,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    CalendarDays,
    UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/presentation/hooks/useRole';
import { insforge } from '@/lib/insforge';
import packageInfo from '../../../../package.json';

const navItems = [
    { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    {
        name: 'Secretaría',
        href: '/secretaria/hermanos',
        icon: Users,
        adminOnly: true,
        subItems: [
            { name: 'Hermanos', href: '/secretaria/hermanos' },
            { name: 'Altas/Bajas', href: '/secretaria/movimientos' },
        ]
    },
    {
        name: 'Tesorería',
        href: '/tesoreria',
        icon: Wallet,
        adminOnly: true,
        subItems: [
            { name: 'Recibos', href: '/tesoreria' },
            { name: 'Cuotas', href: '/tesoreria/cuotas' },
            { name: 'Precios', href: '/tesoreria/precios' },
        ]
    },
    {
        name: 'Cofradía',
        href: '/cofradia',
        icon: ClipboardList,
        adminOnly: true,
        subItems: [
            { name: 'Dashboard', href: '/cofradia' },
            { name: 'Gestión Papeletas', href: '/cofradia/papeletas' },
        ]
    },
    { name: 'Priostía', href: '/priostia', icon: Package, adminOnly: true },
    { name: 'Mi Perfil', href: '/perfil', icon: UserCircle, hermanoOnly: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isSuperadmin, role, user } = useRole();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const handleLogout = async () => {
        try {
            await insforge.auth.signOut();
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const isActive = (href: string) => {
        if (href === '/dashboard' || href === '/configuracion') return pathname === href;
        return pathname.startsWith(href);
    };

    const NavContent = () => (
        <div className="flex flex-col h-full bg-slate-950 text-slate-300">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary rounded-xl p-2 shadow-lg shadow-primary/20">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="font-black text-white leading-none tracking-tighter">HERMANDAD</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Portal Gestión</span>
                    </div>
                )}
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto scrollbar-hide">
                {navItems
                    .filter(item => {
                        if (item.adminOnly) return isSuperadmin || role === 'JUNTA';
                        if (item.hermanoOnly) return role === 'HERMANO';
                        return true;
                    })
                    .map((item) => (
                        <div key={item.name} className="flex flex-col gap-1">
                            <Link
                                href={item.href}
                                onClick={() => {
                                    if (!isCollapsed) setExpandedItem(expandedItem === item.name ? null : item.name);
                                    setIsMobileOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive(item.href)
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "hover:bg-slate-900 hover:text-white"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                                    isActive(item.href) ? "text-white" : "text-slate-500 group-hover:text-primary"
                                )} />
                                {!isCollapsed && <span className="text-sm font-bold tracking-tight grow">{item.name}</span>}
                            </Link>

                            {/* Sub-items rendering */}
                            {!isCollapsed && item.subItems && (isActive(item.href) || expandedItem === item.name) && (
                                <div className="ml-11 flex flex-col gap-1 mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                                    {item.subItems.map((sub) => (
                                        <Link
                                            key={sub.name}
                                            href={sub.href}
                                            className={cn(
                                                "text-xs font-bold py-2 px-3 rounded-lg transition-colors",
                                                pathname === sub.href
                                                    ? "text-primary bg-primary/5"
                                                    : "text-slate-500 hover:text-white hover:bg-slate-900/50"
                                            )}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                {/* Separator */}
                <div className="h-px bg-slate-900 my-4 mx-3" />

                {/* Admin/Config Section */}
                {(isSuperadmin || role === 'JUNTA') && (
                    <div className="flex flex-col gap-1">
                        <Link
                            href="/configuracion"
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                                isActive('/configuracion')
                                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                                    : "hover:bg-slate-900 hover:text-white"
                            )}
                        >
                            <Settings className={cn(
                                "w-5 h-5 flex-shrink-0",
                                isActive('/configuracion') ? "text-white" : "text-amber-500/50 group-hover:text-amber-500"
                            )} />
                            {!isCollapsed && <span className="text-sm font-bold tracking-tight">Configuración</span>}
                        </Link>

                        {/* Sub-items for Configuration */}
                        {!isCollapsed && isActive('/configuracion') && (
                            <div className="ml-11 flex flex-col gap-1 mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                                <Link
                                    href="/configuracion?tab=temporadas"
                                    className={cn(
                                        "text-xs font-bold py-2 px-3 rounded-lg transition-colors text-slate-500 hover:text-white hover:bg-slate-900/50"
                                    )}
                                >
                                    Temporadas
                                </Link>
                                <Link
                                    href="/configuracion?tab=roles"
                                    className={cn(
                                        "text-xs font-bold py-2 px-3 rounded-lg transition-colors text-slate-500 hover:text-white hover:bg-slate-900/50"
                                    )}
                                >
                                    Roles y Permisos
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-slate-900">
                <div className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 transition-all",
                    isCollapsed ? "justify-center px-2" : "px-4"
                )}>
                    <UserCircle className="w-8 h-8 text-primary flex-shrink-0" />
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white truncate">{user?.email?.split('@')[0] || 'Usuario'}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{role}</p>
                                <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest leading-none">v{packageInfo.version}</p>
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center gap-3 mt-4 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-bold",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">Cerrar Sesión</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 border-r border-slate-900",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <NavContent />

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 w-6 h-6 bg-slate-950 border border-slate-900 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-slate-950 border-b border-slate-900 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
                <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-black text-white text-sm tracking-tighter">ERPH</span>
                </div>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-64 bg-slate-950 shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="absolute right-4 top-4">
                            <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <NavContent />
                    </div>
                </div>
            )}

            {/* Content Spacer for Fixed Sidebar */}
            <div className={cn(
                "hidden lg:block transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )} />
            <div className="lg:hidden h-16" />
        </>
    );
}
