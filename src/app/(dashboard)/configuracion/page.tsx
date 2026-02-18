
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { useRole } from '@/presentation/hooks/useRole';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import {
    CalendarDays,
    UserPlus,
    ShieldCheck,
    History,
    ArrowRightCircle,
    Search,
    UserCircle,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Info,
    Loader2
} from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';
import { cn } from '@/lib/utils';

import { useConfiguracion } from '@/presentation/hooks/useConfiguracion';

export default function ConfiguracionPage() {
    const { isSuperadmin, role: currentRole } = useRole();
    const { hermanos, loading: loadingHermanos } = useHermanos();
    const {
        temporadas,
        temporadaActiva,
        loading: loadingConfig,
        iniciarNuevaTemporada,
        actualizarRolUsuario
    } = useConfiguracion();

    const [activeTab, setActiveTab] = useState<'temporadas' | 'roles'>('temporadas');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const filteredHermanos = hermanos.filter(h =>
        `${h.nombre} ${h.apellido1} ${h.numeroHermano}`.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const handleNewSeason = async () => {
        const nextYear = (temporadaActiva?.anio || new Date().getFullYear()) + 1;
        if (!confirm(`¿Estás seguro de que deseas cerrar la temporada actual e iniciar la ${nextYear}?`)) {
            return;
        }

        try {
            setIsUpdating(true);
            await iniciarNuevaTemporada(nextYear, `Temporada ${nextYear}`);
            alert('Nueva temporada iniciada correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al iniciar la temporada');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateRole = async (hermanoId: string, nuevoRol: string) => {
        try {
            setIsUpdating(true);
            await actualizarRolUsuario(hermanoId, nuevoRol);
            alert('Rol actualizado correctamente. El cambio se reflejará en la próxima sesión del usuario.');
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el rol');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isSuperadmin && currentRole !== 'junta_gobierno') {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
                <h1 className="text-2xl font-bold text-slate-900">Acceso Restringido</h1>
                <p className="text-slate-500">Solo el Super Admin o la Junta de Gobierno pueden acceder a esta sección.</p>
                <Button onClick={() => window.location.href = '/dashboard'}>Volver al Inicio</Button>
            </div>
        );
    }

    if (loadingConfig && temporadas.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Configuración</h1>
                    <p className="text-slate-500 mt-2 font-medium">Gestión global de la hermandad y control de acceso.</p>
                </div>
            </div>

            {/* Tabs Design */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('temporadas')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                        activeTab === 'temporadas' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <CalendarDays className="w-4 h-4" />
                    Temporadas
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                        activeTab === 'roles' ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Roles & Miembros
                </button>
            </div>

            <div className="grid gap-8">
                {activeTab === 'temporadas' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Current Season Card */}
                        <Card className="border-primary/20 bg-primary/[0.02]">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <CalendarDays className="w-4 h-4 text-primary" />
                                        </div>
                                        Temporada Activa
                                    </CardTitle>
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">EN CURSO</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-8">
                                    <div className="text-6xl font-black tracking-tighter text-slate-900">
                                        {temporadaActiva?.anio || new Date().getFullYear()}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Iniciada el</p>
                                        <p className="text-lg font-bold text-slate-700">
                                            {temporadaActiva ? new Date(temporadaActiva.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <Button
                                        className="gap-2 h-12 px-6 rounded-xl bg-slate-900 hover:bg-black"
                                        onClick={handleNewSeason}
                                        disabled={isUpdating || !isSuperadmin}
                                    >
                                        <ArrowRightCircle className="w-4 h-4" /> Iniciar Próxima Temporada
                                    </Button>
                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 italic text-sm">
                                        <Info className="w-4 h-4" />
                                        Solo el Super Admin puede realizar esta acción.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* History */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-4 h-4" /> Historial de Temporadas
                            </h3>
                            <div className="grid gap-3">
                                {temporadas.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-600">
                                                {s.anio}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{s.nombre}</p>
                                                <p className="text-xs text-slate-400 font-medium">Iniciada el {new Date(s.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {s.is_active ? (
                                            <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">Activa</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-slate-200 text-slate-400 bg-slate-50">Cerrada</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'roles' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Search & Assign */}
                        <Card className="border-amber-200/50 bg-amber-50/[0.03]">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <UserPlus className="w-4 h-4 text-amber-600" />
                                    </div>
                                    Asignar Miembro de Junta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="relative group max-w-xl">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    <Input
                                        placeholder="Buscar por nombre o número de hermano..."
                                        className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm ring-amber-500/20 transition-all focus:ring-4"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />

                                    {searchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200">
                                            {loadingHermanos ? (
                                                <p className="p-4 text-center text-slate-500">Buscando...</p>
                                            ) : filteredHermanos.length === 0 ? (
                                                <p className="p-4 text-center text-slate-500 italic">No se encontraron hermanos con ese nombre.</p>
                                            ) : (
                                                filteredHermanos.map(h => (
                                                    <div key={h.id} className="p-4 hover:bg-slate-50 border-b last:border-0 flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                                {h.nombre[0]}{h.apellido1[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{h.nombre} {h.apellido1}</p>
                                                                <p className="text-xs text-slate-500 font-medium tracking-tight">Nº {h.numeroHermano}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded-xl font-bold border-amber-200 h-9"
                                                                disabled={isUpdating || !isSuperadmin}
                                                                onClick={() => handleUpdateRole(h.id, 'JUNTA')}
                                                            >
                                                                Junta
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-bold border-red-100 h-9"
                                                                disabled={isUpdating || !isSuperadmin}
                                                                onClick={() => handleUpdateRole(h.id, 'SUPERADMIN')}
                                                            >
                                                                Super
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Roles List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Usuarios con Privilegios
                            </h3>
                            <div className="grid gap-3">
                                {/* Mock Junta list */}
                                {[
                                    { name: 'Juan Pérez García', role: 'Super Admin', status: 'Activo' },
                                    { name: 'María Rodríguez Lopez', role: 'Junta de Gobierno', status: 'Activo' },
                                    { name: 'Carlos Sánchez Ruiz', role: 'Junta de Gobierno', status: 'Activo' },
                                ].map((u, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                <UserCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{u.name}</p>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{u.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> {u.status}
                                            </Badge>
                                            {isSuperadmin && u.role !== 'Super Admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
