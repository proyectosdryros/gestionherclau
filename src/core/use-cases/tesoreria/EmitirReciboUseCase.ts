
import { Recibo, EstadoRecibo, TipoRecibo } from '@/core/domain/entities/Recibo';
import { ReciboRepository } from '@/core/ports/repositories/ReciboRepository';
import { v7 as uuidv7 } from 'uuid';

export interface EmitirReciboInput {
    hermanoId: string;
    concepto: string;
    importe: number;
    tipo: TipoRecibo;
    observaciones?: string | null;
}

export class EmitirReciboUseCase {
    constructor(private repository: ReciboRepository) { }

    async execute(input: EmitirReciboInput): Promise<Recibo> {
        const nuevoRecibo = new Recibo(
            uuidv7(),
            input.hermanoId,
            input.concepto,
            input.importe,
            'PENDIENTE',
            input.tipo,
            new Date(),
            {
                created_at: new Date(),
                updated_at: new Date(),
                version: 1,
            },
            undefined, // fechaVencimiento
            input.observaciones
        );

        return await this.repository.create(nuevoRecibo);
    }
}
