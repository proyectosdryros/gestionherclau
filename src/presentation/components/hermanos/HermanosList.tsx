/**
 * Hermanos List Component (Client Component)
 * Tabla interactiva con búsqueda y filtros
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import type { EstadoHermano } from '@/core/domain/entities/Hermano';

export function HermanosList() {
    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState<EstadoHermano | undefined>();

    const { hermanos, total, loading, error } = useHermanos({
        search,
        estado: estadoFilter,
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                <p className="font-semibold">Error al cargar hermanos</p>
                <p className="text-sm mt-1">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtros */}
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-2xl border border-slate-100 shadow-sm">
                <input
                    type="text"
                    placeholder="Buscar hermano..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                <select
                    value={estadoFilter ?? ''}
                    onChange={(e) => setEstadoFilter(e.target.value as EstadoHermano || undefined)}
                    className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold text-slate-700"
                >
                    <option value="">Cualquier estado</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="BAJA_TEMPORAL">Baja temporal</option>
                    <option value="BAJA_VOLUNTARIA">Baja voluntaria</option>
                    <option value="FALLECIDO">Fallecido</option>
                </select>
            </div>

            {/* Tabla */}
            {/* Mobile Cards (Visible only on mobile) */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {hermanos.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed text-slate-400">
                        No se encontraron hermanos
                    </div>
                ) : (
                    hermanos.map((hermano) => (
                        <Link key={hermano.id} href={`/secretaria/hermanos/${hermano.id}`} className="block">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                                            {hermano.numeroHermano}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight">{hermano.nombre} {hermano.apellido1}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hermano.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${hermano.estado === 'ACTIVO'
                                            ? 'bg-green-100 text-green-700'
                                            : hermano.estado === 'BAJA_TEMPORAL'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        {hermano.estado}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Antigüedad</p>
                                        <p className="text-sm font-bold text-slate-700">{hermano.getAntiguedad().toString()}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Cuotas</p>
                                        <p className={`text-sm font-bold ${hermano.cuotasAlDia ? 'text-green-600' : 'text-red-600'}`}>
                                            {hermano.cuotasAlDia ? '✓ Al día' : '✗ Pendiente'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Desktop Table (Hidden on mobile) */}
            <div className="hidden lg:block bg-card rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nº</th>
                            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nombre Completo</th>
                            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">DNI</th>
                            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Antigüedad</th>
                            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                            <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Cuotas</th>
                            <th className="text-right px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {hermanos.map((hermano) => {
                            const antiguedad = hermano.getAntiguedad();
                            return (
                                <tr
                                    key={hermano.id}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="px-6 py-4 font-bold text-slate-900">{hermano.numeroHermano}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{hermano.getNombreCompleto()}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{hermano.dni?.getValue() || 'SIN DNI'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{antiguedad.toString()}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${hermano.estado === 'ACTIVO'
                                                ? 'bg-green-100 text-green-700'
                                                : hermano.estado === 'BAJA_TEMPORAL'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-slate-100 text-slate-700'
                                                }`}
                                        >
                                            {hermano.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {hermano.cuotasAlDia ? (
                                            <span className="text-green-600 font-bold text-sm">✓ Al día</span>
                                        ) : (
                                            <span className="text-red-500 font-bold text-sm italic underline decoration-red-200">✗ Pendiente</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/secretaria/hermanos/${hermano.id}`}
                                            className="inline-flex h-9 px-4 items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all active:scale-95"
                                        >
                                            Detalles
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer con total */}
            <p className="text-sm text-muted-foreground">
                Total: {total} {total === 1 ? 'hermano' : 'hermanos'}
            </p>
        </div>
    );
}
