
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Recibo } from '@/core/domain/entities/Recibo';
import { DexieReciboRepository } from '@/infrastructure/repositories/indexeddb/DexieReciboRepository';
import { DexiePagoRepository } from '@/infrastructure/repositories/indexeddb/DexiePagoRepository';
import { RegistrarCobroUseCase } from '@/core/use-cases/tesoreria/RegistrarCobroUseCase';
import { MetodoPago } from '@/core/domain/entities/Pago';

const reciboRepo = new DexieReciboRepository();
const pagoRepo = new DexiePagoRepository();
const registrarCobroUC = new RegistrarCobroUseCase(reciboRepo, pagoRepo);

export function useRecibos() {
    const [recibos, setRecibos] = useState<Recibo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await reciboRepo.findAll();
            setRecibos(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Error al cargar recibos'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const registrarCobro = async (reciboId: string, metodo: MetodoPago) => {
        try {
            await registrarCobroUC.execute({
                reciboId,
                importe: recibos.find(r => r.id === reciboId)?.importe || 0,
                metodoPago: metodo
            });
            await refresh();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        recibos,
        loading,
        error,
        refresh,
        registrarCobro
    };
}
