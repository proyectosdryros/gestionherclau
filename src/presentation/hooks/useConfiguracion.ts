
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Temporada } from '@/core/domain/entities/Temporada';
import { InsForgeConfiguracionRepository } from '@/infrastructure/repositories/insforge/InsForgeConfiguracionRepository';

const repository = new InsForgeConfiguracionRepository();

export function useConfiguracion() {
    const [temporadas, setTemporadas] = useState<Temporada[]>([]);
    const [temporadaActiva, setTemporadaActiva] = useState<Temporada | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [list, active] = await Promise.all([
                repository.getTemporadas(),
                repository.getTemporadaActiva()
            ]);
            setTemporadas(list);
            setTemporadaActiva(active);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error al cargar configuración'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const iniciarNuevaTemporada = async (anio: number, nombre: string) => {
        try {
            setLoading(true);
            await repository.iniciarTemporada(anio, nombre);
            await loadData();
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const actualizarRolUsuario = async (usuarioId: string, nuevoRol: string) => {
        try {
            setLoading(true);
            await repository.actualizarRol(usuarioId, nuevoRol);
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        temporadas,
        temporadaActiva,
        loading,
        error,
        iniciarNuevaTemporada,
        actualizarRolUsuario,
        refresh: loadData
    };
}
