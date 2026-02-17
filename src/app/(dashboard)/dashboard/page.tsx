
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
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { useRecibos } from '@/presentation/hooks/useRecibos';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useEnseres } from '@/presentation/hooks/useEnseres';
import { useSync } from '@/presentation/hooks/useSync';
import { db } from '@/infrastructure/repositories/indexeddb/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardSummaryPage() {
    const { hermanos, loading: loadingHermanos } = useHermanos();
    const { recibos, loading: loadingRecibos } = useRecibos();
    const { papeletas, loading: loadingPapeletas } = usePapeletas();
    const { enseres, loading: loadingEnseres } = useEnseres();
    const { isSyncing } = useSync();

    // Cola de sincronización en tiempo real
    const pendingSyncCount = useLiveQuery(
        () => db.syncQueue.where('status').equals('pending').count(),
        []
    ) ?? 0;

    // Cálculos de Tesorería
    const totalRecibos = recibos.length;
    const recibosCobrados = recibos.filter(r => r.estado === 'COBRADO').length;
    const porcentajeCobro = totalRecibos > 0
        ? Math.round((recibosCobrados / totalRecibos) * 100)
        : 0;

    // Combinar actividades recientes
    const recentActivities = [
        ...hermanos.map(h => ({
            id: h.id,
            title: `Nuevo hermano: ${h.nombre} ${h.apellido1}`,
            date: new Date(h.auditoria.created_at),
            module: 'Secretaría',
            color: 'bg-blue-500'
        })),
        ...papeletas.map(p => ({
            id: p.id,
            title: `Papeleta solicitada`,
            date: new Date(p.auditoria.created_at),
            module: 'Cofradía',
            color: 'bg-purple-500'
        })),
        ...recibos.filter(r => r.estado === 'COBRADO').map(r => ({
            id: r.id,
            title: `Cobro: ${r.concepto}`,
            date: new Date(r.auditoria.updated_at),
            module: 'Tesorería',
            color: 'bg-emerald-500'
        }))
    ]
        .filter(act => act.date) // Solo actividades con fecha
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const modules = [
        {
            title: 'Secretaría',
            description: 'Gestión de hermanos, familiares y méritos.',
            icon: Users,
            href: '/secretaria/hermanos',
            stats: loadingHermanos ? '...' : `${hermanos.length.toLocaleString()} Hermanos`,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Tesorería',
            description: 'Control de cuotas, recibos y cobros manuales.',
            icon: Wallet,
            href: '/tesoreria',
            stats: loadingRecibos ? '...' : `${porcentajeCobro}% Cobrado`,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Cofradía',
            description: 'Planificación del cortejo y papeletas de sitio.',
            icon: ClipboardList,
            href: '/cofradia',
            stats: loadingPapeletas ? '...' : `${papeletas.length.toLocaleString()} Papeletas`,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            title: 'Priostía',
            description: 'Inventario de enseres y patrimonio histórico.',
            icon: Package,
            href: '/priostia',
            stats: loadingEnseres ? '...' : `${enseres.length.toLocaleString()} Enseres`,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
                <p className="text-muted-foreground underline-offset-4">
                    Datos sincronizados en tiempo real con la base de datos de la Hermandad.
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
                            {recentActivities.length > 0 ? (
                                recentActivities.map((act) => (
                                    <div key={act.id} className="flex items-center gap-4 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${act.color}`} />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-200">{act.title}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {formatDistanceToNow(act.date, { addSuffix: true, locale: es })}
                                            </p>
                                        </div>
                                        <Badge variant="outline">{act.module}</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente.</p>
                            )}
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
                                <Badge variant={isSyncing ? 'warning' : 'success'}>
                                    {isSyncing ? 'Sincronizando...' : 'Activa'}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Base de Datos Local</span>
                                <Badge variant="success">Versión 4 OK</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Cola de Pendientes</span>
                                <span className={`font-mono ${pendingSyncCount > 0 ? 'text-amber-500' : 'text-primary'}`}>
                                    {pendingSyncCount} cambios {pendingSyncCount > 0 ? 'pendientes' : ''}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
