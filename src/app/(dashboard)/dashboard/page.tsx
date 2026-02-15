
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import {
    Users,
    Wallet,
    ClipboardList,
    Package,
    ArrowRight,
    ShieldCheck,
    Clock
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardSummaryPage() {
    const modules = [
        {
            title: 'Secretaría',
            description: 'Gestión de hermanos, familiares y méritos.',
            icon: Users,
            href: '/secretaria/hermanos',
            stats: '1,240 Hermanos',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Tesorería',
            description: 'Control de cuotas, recibos y cobros manuales.',
            icon: Wallet,
            href: '/tesoreria',
            stats: '86% Cobrado',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Cofradía',
            description: 'Planificación del cortejo y papeletas de sitio.',
            icon: ClipboardList,
            href: '/cofradia',
            stats: '150 Papeletas',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            title: 'Priostía',
            description: 'Inventario de enseres y patrimonio histórico.',
            icon: Package,
            href: '/priostia',
            stats: '482 Enseres',
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
                <p className="text-muted-foreground underline-offset-4">
                    Bienvenido al Gestor de Hermandades. Seleccione un módulo para comenzar.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {modules.map((module) => (
                    <Card key={module.title} className="hover:shadow-lg transition-all border-slate-800/50 bg-slate-900/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {module.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${module.bg}`}>
                                <module.icon className={`h-4 w-4 ${module.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-1">{module.stats}</div>
                            <p className="text-xs text-muted-foreground mb-4">
                                {module.description}
                            </p>
                            <Button asChild variant="ghost" className="w-full justify-between hover:bg-slate-800">
                                <Link href={module.href}>
                                    Entrar <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-800/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            Actividad Reciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-200">Nuevo hermano registrado</p>
                                        <p className="text-xs text-muted-foreground">Hace 10 minutos</p>
                                    </div>
                                    <Badge variant="outline">Secretaría</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Estado del Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Sincronización Cloud</span>
                                <Badge variant="success">Activa</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Base de Datos Local</span>
                                <Badge variant="success">Versión 4 OK</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Cola de Pendientes</span>
                                <span className="font-mono text-primary">0 cambios</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
