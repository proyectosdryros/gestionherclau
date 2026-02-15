
export type MetodoPago = 'EFECTIVO' | 'CARGO_BANCARIO' | 'TRANSFERENCIA' | 'TARJETA_PRESENCIAL' | 'ONLINE_STRIPE';

export class Pago {
    constructor(
        public readonly id: string,
        public readonly reciboId: string,
        public readonly importe: number,
        public readonly fechaPago: Date,
        public readonly metodoPago: MetodoPago,
        public readonly auditoria: {
            created_at: Date;
            updated_at: Date;
            version: number;
        },
        public readonly referenciaExterna?: string | null,
        public observaciones?: string | null
    ) { }
}
