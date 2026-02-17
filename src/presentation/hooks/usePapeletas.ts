
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Papeleta } from '@/core/domain/entities/Papeleta';
import { InsForgePapeletaRepository } from '@/infrastructure/repositories/insforge/InsForgePapeletaRepository';

const repo = new InsForgePapeletaRepository();

export function usePapeletas() {
    const [papeletas, setPapeletas] = useState<Papeleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await repo.findAll();
            setPapeletas(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error al cargar papeletas'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const crearPapeleta = async (papeleta: Omit<Papeleta, 'id' | 'auditoria' | 'asignarManual' | 'asignarAutomatico'>) => {
        try {
            setLoading(true);
            await repo.create(papeleta);
            await refresh();
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const eliminarPapeleta = async (id: string) => {
        try {
            setLoading(true);
            await repo.delete(id);
            await refresh();
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        papeletas,
        loading,
        error,
        refresh,
        crearPapeleta,
        eliminarPapeleta
    };
}
