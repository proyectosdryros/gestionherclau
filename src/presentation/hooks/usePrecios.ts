'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConfiguracionPrecio } from '@/core/domain/entities/ConfiguracionPrecio';
import { InsForgePrecioRepository } from '@/infrastructure/repositories/insforge/InsForgePrecioRepository';
import { ObtenerPreciosUseCase } from '@/core/use-cases/tesoreria/PreciosUseCases';

const repository = new InsForgePrecioRepository();
const obtenerUseCase = new ObtenerPreciosUseCase(repository);

export function usePrecios(filters?: { activo?: boolean; tipo?: string; anio?: number }) {
    const [precios, setPrecios] = useState<ConfiguracionPrecio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await obtenerUseCase.execute(filters);
            setPrecios(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error al cargar precios'));
        } finally {
            setLoading(false);
        }
    }, [filters?.activo, filters?.tipo, filters?.anio]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        precios,
        loading,
        error,
        refresh
    };
}
