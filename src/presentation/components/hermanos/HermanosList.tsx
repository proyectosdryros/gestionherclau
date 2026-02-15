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
            <div className="flex gap-4 bg-card p-4 rounded-lg border">
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellidos o DNI..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md bg-background"
                />
                <select
                    value={estadoFilter ?? ''}
                    onChange={(e) => setEstadoFilter(e.target.value as EstadoHermano || undefined)}
                    className="px-3 py-2 border rounded-md bg-background"
                >
                    <option value="">Todos los estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="BAJA_TEMPORAL">Baja temporal</option>
                    <option value="BAJA_VOLUNTARIA">Baja voluntaria</option>
                    <option value="FALLECIDO">Fallecido</option>
                </select>
            </div>

            {/* Tabla */}
            <div className="bg-card rounded-lg border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">Nº</th>
                            <th className="text-left px-4 py-3 font-semibold">Nombre Completo</th>
                            <th className="text-left px-4 py-3 font-semibold">DNI</th>
                            <th className="text-left px-4 py-3 font-semibold">Antigüedad</th>
                            <th className="text-left px-4 py-3 font-semibold">Estado</th>
                            <th className="text-left px-4 py-3 font-semibold">Cuotas</th>
                            <th className="text-right px-4 py-3 font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hermanos.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                    No se encontraron hermanos
                                </td>
                            </tr>
                        ) : (
                            hermanos.map((hermano) => {
                                const antiguedad = hermano.getAntiguedad();
                                return (
                                    <tr
                                        key={hermano.id}
                                        className="border-t hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">{hermano.numeroHermano}</td>
                                        <td className="px-4 py-3">{hermano.getNombreCompleto()}</td>
                                        <td className="px-4 py-3 font-mono text-sm">{hermano.dni?.getValue() || 'SIN DNI'}</td>
                                        <td className="px-4 py-3 text-sm">{antiguedad.toString()}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${hermano.estado === 'ACTIVO'
                                                    ? 'bg-green-100 text-green-800'
                                                    : hermano.estado === 'BAJA_TEMPORAL'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {hermano.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {hermano.cuotasAlDia ? (
                                                <span className="text-green-600">✓ Al día</span>
                                            ) : (
                                                <span className="text-red-600">✗ Pendiente</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/secretaria/hermanos/${hermano.id}`}
                                                className="text-primary hover:underline text-sm"
                                            >
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
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
