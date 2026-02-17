
import { useState, useEffect, useCallback } from 'react';
import { Enser, CategoriaEnser, EstadoEnser } from '@/core/domain/entities/Enser';
import { DexieEnserRepository } from '@/infrastructure/repositories/indexeddb/DexieEnserRepository';

const enserRepo = new DexieEnserRepository();

export function useEnseres(filters?: { categoria?: CategoriaEnser; estado?: EstadoEnser }) {
    const [enseres, setEnseres] = useState<Enser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await enserRepo.findAll(filters);
            setEnseres(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error al cargar enseres'));
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const crearEnser = async (enser: Enser) => {
        try {
            await enserRepo.create(enser);
            await refresh();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const actualizarEnser = async (enser: Enser) => {
        try {
            await enserRepo.update(enser);
            await refresh();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const eliminarEnser = async (id: string) => {
        try {
            await enserRepo.delete(id);
            await refresh();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        enseres,
        loading,
        error,
        refresh,
        crearEnser,
        actualizarEnser,
        eliminarEnser
    };
}
