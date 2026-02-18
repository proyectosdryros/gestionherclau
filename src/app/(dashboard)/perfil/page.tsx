
'use client';

import React from 'react';
import { useMiPerfil } from '@/presentation/hooks/useMiPerfil';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import {
    User,
    Calendar,
    Hash,
    Mail,
    Phone,
    CreditCard,
    ShieldCheck,
    Loader2,
    CalendarDays,
    Users as UsersIcon,
    Award,
    Info
} from 'lucide-react';
import Head from 'next/head';

export default function PerfilPage() {
    const { miPerfil, familiares, meritos, puntosTotales, loading, error } = useMiPerfil();

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !miPerfil) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <Hash className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Perfil no vinculado</h1>
                <p className="text-slate-500 text-center max-w-md">
                    No hemos podido encontrar un perfil de hermano vinculado a tu usuario.
                    Por favor, contacta con secretaría.
                </p>
            </div>
        );
    }

    return (
        <>
            <title>Mi Perfil | Gestión de Hermandad</title>
            <meta name="description" content="Consulta tus datos de hermano, antigüedad, familiares vinculados y méritos." />

            <div className="space-y-8 max-w-5xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Mi Perfil</h1>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Consulta y verifica tu información personal en la Hermandad.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column: Personal Data */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 overflow-hidden" id="profile-personal-data">
                            <CardHeader className="border-b bg-slate-50/50 py-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="w-5 h-5 text-primary" />
                                        Datos Personales
                                    </CardTitle>
                                    <Badge className={miPerfil.cuotasAlDia ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                                        {miPerfil.cuotasAlDia ? "Cuotas al día" : "Cuotas pendientes"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</p>
                                        <p className="text-lg font-bold text-slate-900">{miPerfil.getNombreCompleto()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI / Documento</p>
                                        <p className="text-lg font-bold text-slate-900">{miPerfil.dni?.toString() || 'No registrado'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de Hermano</p>
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-primary" />
                                            <span className="text-2xl font-black text-slate-900 leading-none">{miPerfil.numeroHermano}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Alta</p>
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-slate-400" />
                                            <span className="text-lg font-bold text-slate-900">{miPerfil.fechaAlta.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700">{miPerfil.email?.toString() || 'Sin email'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</p>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700">{miPerfil.telefono || 'Sin teléfono'}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Relatives Section */}
                        <Card className="border-slate-200" id="profile-relatives">
                            <CardHeader className="py-4 border-b bg-slate-50/50">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <UsersIcon className="w-5 h-5 text-indigo-500" />
                                    Familiares Vinculados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {familiares.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {familiares.map(f => (
                                            <div key={f.id} className="py-3 flex justify-between items-center group">
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                        {f.nombre} {f.apellido1} {f.apellido2}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium capitalize">{f.tipo}</p>
                                                </div>
                                                {f.fechaNacimiento && (
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nacimiento</p>
                                                        <p className="text-sm font-bold text-slate-700">{f.fechaNacimiento.toLocaleDateString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <p className="text-sm text-slate-400 italic">No tienes familiares directos registrados.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Seniority & Merits */}
                    <div className="space-y-6">
                        {/* Seniority Highlight */}
                        <Card className="border-primary/20 bg-primary/[0.02] relative overflow-hidden" id="profile-seniority">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-primary" />
                                    Antigüedad
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center py-4">
                                <div className="text-6xl font-black tracking-tighter text-slate-900">{miPerfil.getAntiguedad().years}</div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Años</p>
                            </CardContent>
                        </Card>

                        {/* Merits Card */}
                        <Card className="border-slate-200" id="profile-merits">
                            <CardHeader className="py-4 border-b bg-slate-50/50">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Award className="w-5 h-5 text-amber-500" />
                                        Méritos
                                    </CardTitle>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-black text-slate-900 leading-none">{puntosTotales}</span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Puntos</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {meritos.length > 0 ? (
                                    <div className="space-y-4">
                                        {meritos.slice(0, 5).map(m => (
                                            <div key={m.id} className="flex gap-3">
                                                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-bold text-slate-800 leading-tight">{m.descripcion}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 font-medium">{m.fecha.toLocaleDateString()}</span>
                                                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-amber-100 text-amber-600 font-black">+{m.puntos} pts</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {meritos.length > 5 && (
                                            <p className="text-[10px] text-center text-slate-400 font-medium pt-2 italic">
                                                +{meritos.length - 5} méritos adicionales registrados
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <p className="text-sm text-slate-400 italic">No hay méritos registrados aún.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Legal Note */}
                        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Info className="w-12 h-12" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nota Legal</p>
                            <p className="text-xs leading-relaxed text-slate-300">
                                Tus datos están protegidos por la RGPD. Para cualquier modificación, contacta con secretaría.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
