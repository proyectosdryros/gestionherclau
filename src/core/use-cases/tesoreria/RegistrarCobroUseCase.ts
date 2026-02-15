
import { Pago, MetodoPago } from '@/core/domain/entities/Pago';
import { PagoRepository } from '@/core/ports/repositories/PagoRepository';
import { ReciboRepository } from '@/core/ports/repositories/ReciboRepository';
import { v7 as uuidv7 } from 'uuid';

export interface RegistrarCobroInput {
    reciboId: string;
    importe: number;
    metodoPago: MetodoPago;
    observaciones?: string | null;
}

export class RegistrarCobroUseCase {
    constructor(
        private reciboRepo: ReciboRepository,
        private pagoRepo: PagoRepository
    ) { }

    async execute(input: RegistrarCobroInput): Promise<Pago> {
        const recibo = await this.reciboRepo.findById(input.reciboId);
        if (!recibo) throw new Error('Recibo no encontrado');
        if (recibo.estado === 'COBRADO') throw new Error('El recibo ya está cobrado');
        if (recibo.estado === 'ANULADO') throw new Error('No se puede cobrar un recibo anulado');

        // 1. Crear el pago
        const nuevoPago = new Pago(
            uuidv7(),
            input.reciboId,
            input.importe,
            new Date(),
            input.metodoPago,
            {
                created_at: new Date(),
                updated_at: new Date(),
                version: 1,
            },
            null, // referenciaExterna
            input.observaciones
        );

        const pagoCreado = await this.pagoRepo.create(nuevoPago);

        // 2. Marcar recibo como cobrado
        recibo.cobrar();
        await this.reciboRepo.update(recibo);

        return pagoCreado;
    }
}
