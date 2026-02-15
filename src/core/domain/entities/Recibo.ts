
export interface Auditoria {
    created_at: Date;
    updated_at: Date;
    version: number;
}

export type EstadoRecibo = 'PENDIENTE' | 'COBRADO' | 'ANULADO' | 'DEVUELTO';
export type TipoRecibo = 'CUOTA_ORDINARIA' | 'CUOTA_EXTRAORDINARIA' | 'PAPELETA_SITIO' | 'DONATIVO' | 'VENTA_ENSERES' | 'OTRO';

export class Recibo {
    constructor(
        public readonly id: string,
        public readonly hermanoId: string,
        public readonly concepto: string,
        public readonly importe: number,
        public estado: EstadoRecibo,
        public readonly tipo: TipoRecibo,
        public readonly fechaEmision: Date,
        public readonly auditoria: {
            created_at: Date;
            updated_at: Date;
            version: number;
        },
        public readonly fechaVencimiento?: Date,
        public observaciones?: string | null
    ) { }

    /**
     * Marca el recibo como cobrado
     */
    cobrar() {
        if (this.estado === 'ANULADO') throw new Error('No se puede cobrar un recibo anulado');
        this.estado = 'COBRADO';
    }

    /**
     * Anula el recibo
     */
    anular() {
        if (this.estado === 'COBRADO') throw new Error('No se puede anular un recibo ya cobrado');
        this.estado = 'ANULADO';
    }

    /**
     * Crea una instancia de Recibo con datos actualizados (Inmutabilidad)
     */
    update(data: Partial<Omit<Recibo, 'id' | 'hermanoId' | 'auditoria'>>): Recibo {
        return new Recibo(
            this.id,
            this.hermanoId,
            data.concepto ?? this.concepto,
            data.importe ?? this.importe,
            data.estado ?? this.estado,
            data.tipo ?? this.tipo,
            this.fechaEmision,
            {
                ...this.auditoria,
                updated_at: new Date(),
                version: this.auditoria.version + 1
            },
            data.fechaVencimiento ?? this.fechaVencimiento,
            data.observaciones !== undefined ? data.observaciones : this.observaciones
        );
    }
}
