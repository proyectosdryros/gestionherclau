/**
 * Custom Hook: useHermanos
 * Abstrae la lógica de negocio para componentes React
 */

'use client';

import { useState, useEffect } from 'react';
import { Hermano } from '@/core/domain/entities/Hermano';
import { DexieHermanoRepository } from '@/infrastructure/repositories/indexeddb/DexieHermanoRepository';
import { BuscarHermanosUseCase } from '@/core/use-cases/secretaria/BuscarHermanosUseCase';
import type { EstadoHermano } from '@/core/domain/entities/Hermano';

const repository = new DexieHermanoRepository();
const buscarHermanosUseCase = new BuscarHermanosUseCase(repository);

export interface UseHermanosFilters {
    estado?: EstadoHermano;
    cuotasAlDia?: boolean;
    search?: string;
    soloElegibles?: boolean;
}

export function useHermanos(filters: UseHermanosFilters = {}) {
    const [hermanos, setHermanos] = useState<Hermano[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadHermanos() {
            try {
                setLoading(true);
                setError(null);

                const result = await buscarHermanosUseCase.execute(filters);

                if (!cancelled) {
                    setHermanos(result.hermanos);
                    setTotal(result.total);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error('Error desconocido'));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadHermanos();

        return () => {
            cancelled = true;
        };
    }, [filters.estado, filters.cuotasAlDia, filters.search, filters.soloElegibles]);

    return {
        hermanos,
        total,
        loading,
        error,
    };
}
