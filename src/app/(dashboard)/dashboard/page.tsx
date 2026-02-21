
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
    Clock,
    CalendarDays,
    UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRole } from '@/presentation/hooks/useRole';
import { useMiPerfil } from '@/presentation/hooks/useMiPerfil';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { useRecibos } from '@/presentation/hooks/useRecibos';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useEnseres } from '@/presentation/hooks/useEnseres';
import { useSync } from '@/presentation/hooks/useSync';
import { db } from '@/infrastructure/repositories/indexeddb/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConfiguracion } from '@/presentation/hooks/useConfiguracion';

export default function DashboardSummaryPage() {
    const { role, isHermano, user } = useRole();
    const { miPerfil } = useMiPerfil();
    const { temporadaActiva } = useConfiguracion();
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

    // Vista simplificada para Hermanos
    if (isHermano) {
        return (
            <>
                <title>Inicio | Gestión de Hermandad</title>
                <meta name="description" content="Bienvenido al panel de control de tu hermandad. Consulta la temporada activa y accede a tus gestiones." />

                <div className="space-y-8 max-w-4xl mx-auto">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <UserCircle className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
                                    Paz y Bien, {miPerfil?.nombre || user?.email?.split('@')[0]}
                                </h1>
                                <p className="text-slate-500 font-medium tracking-tight mt-1">
                                    Bienvenido a tu área personal del sistema.
                                </p>
                            </div>
                        </div>

                        {temporadaActiva && (
                            <Badge className="w-fit h-8 px-3 rounded-lg bg-slate-100 text-slate-600 border-slate-200 text-sm font-bold flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                Temporada {temporadaActiva.nombre} activa
                            </Badge>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="hover:shadow-lg transition-all border-slate-200 group overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCircle className="w-5 h-5 text-primary" />
                                    Mis Datos de Hermano
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 mb-6">
                                    Consulta tu número de hermano, antigüedad, estado de cuotas y más.
                                </p>
                                <Button asChild className="w-full justify-between rounded-xl group" id="btn-perfil-acceder">
                                    <Link href="/perfil">
                                        Entrar a Mi Perfil <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-dashed border-slate-200 bg-slate-50/50">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Gestión de Papeletas Online
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Estamos trabajando para que pronto puedas solicitar tu papeleta desde aquí.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        );
    }

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
            title: `Nuevo hermano: ${h.getNombreCompleto()}`,
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
        .filter(act => act.date)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
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
        <>
            <title>Panel de Control | Gestión de Hermandad</title>
            <meta name="description" content="Dashboard administrativo con estadísticas en tiempo real y accesos directos a los módulos de gestión." />

            <div className="space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">Panel de Control</h1>
                        <p className="text-sm md:text-base text-slate-500 font-medium tracking-tight">
                            Datos sincronizados en tiempo real con la base de datos.
                        </p>
                    </div>
                    {temporadaActiva && (
                        <Badge className="w-full lg:w-auto h-12 lg:h-10 px-4 rounded-xl bg-primary/10 text-primary border-primary/20 text-lg font-black tracking-tighter shadow-sm flex items-center justify-center lg:justify-start gap-2">
                            <CalendarDays className="w-5 h-5" />
                            {temporadaActiva.nombre} ({temporadaActiva.anio})
                        </Badge>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {modules.map((module) => (
                        <Card key={module.title} className="hover:shadow-lg transition-all border-slate-200" id={`dash-module-${module.title.toLowerCase()}`}>
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
                                <Button asChild variant="ghost" className="w-full justify-between" id={`btn-dash-entrar-${module.title.toLowerCase()}`}>
                                    <Link href={module.href}>
                                        Entrar <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-slate-200" id="dash-recent-activity">
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
                                                <p className="font-medium text-slate-700">{act.title}</p>
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

                    <Card className="border-slate-200 bg-slate-50/50" id="dash-system-status">
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
                                    <span className={`font-mono font-bold ${pendingSyncCount > 0 ? 'text-amber-500' : 'text-primary'}`}>
                                        {pendingSyncCount} cambios {pendingSyncCount > 0 ? 'pendientes' : ''}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
