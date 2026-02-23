
import { useState, useEffect, useCallback } from 'react';
import { Recibo } from '@/core/domain/entities/Recibo';
import { InsForgeReciboRepository } from '@/infrastructure/repositories/insforge/InsForgeReciboRepository';
import { MetodoPago } from '@/core/domain/entities/Pago';

import { useConfiguracion } from '@/presentation/hooks/useConfiguracion';

// Use Cloud Repository directly for now to ensure consistency
const reciboRepo = new InsForgeReciboRepository();

export function useRecibos() {
    const { activeAnio } = useConfiguracion();
    const [recibos, setRecibos] = useState<Recibo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await reciboRepo.findAll(activeAnio);
            setRecibos(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error al cargar recibos'));
        } finally {
            setLoading(false);
        }
    }, [activeAnio]);

    useEffect(() => {
        refresh();
        if (typeof window !== 'undefined' && window.BroadcastChannel) {
            const channel = new BroadcastChannel('sync_recibos_channel');
            channel.onmessage = (event) => {
                if (event.data === 'RELOAD') refresh();
            };
            return () => channel.close();
        }
    }, [refresh]);

    const notifySync = () => {
        if (typeof window !== 'undefined' && window.BroadcastChannel) {
            const channel = new BroadcastChannel('sync_recibos_channel');
            channel.postMessage('RELOAD');
            channel.close();
        }
    };

    const crearRecibo = async (recibo: Omit<Recibo, 'id' | 'auditoria' | 'cobrar' | 'anular' | 'update'>) => {
        try {
            setLoading(true);
            await reciboRepo.create(recibo);
            await refresh();
            notifySync();
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registrarCobro = async (reciboId: string, metodo: MetodoPago) => {
        try {
            const recibo = recibos.find(r => r.id === reciboId);
            if (!recibo) throw new Error("Recibo no encontrado");

            // Recibo is a class instance, use its method
            recibo.cobrar();
            // We update the entity via the repository
            await reciboRepo.update(recibo);

            await refresh();
            notifySync();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const eliminarRecibo = async (reciboId: string) => {
        try {
            setLoading(true);
            await reciboRepo.delete(reciboId);
            await refresh();
            notifySync();
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        recibos,
        loading,
        error,
        refresh,
        registrarCobro,
        crearRecibo,
        eliminarRecibo
    };
}
