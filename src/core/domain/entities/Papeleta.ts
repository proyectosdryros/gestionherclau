
import { Auditoria } from './Recibo'; // Using the interface from Recibo

export type EstadoPapeleta = 'SOLICITADA' | 'REVISADA' | 'ASIGNADA' | 'EMITIDA' | 'ANULADA';

export class Papeleta {
    constructor(
        public readonly id: string,
        public readonly hermanoId: string,
        public readonly anio: number,
        public readonly fechaSolicitud: Date,
        public estado: EstadoPapeleta,
        public readonly auditoria: Auditoria,
        public puestoSolicitadoId: string | null = null,
        public puestoAsignadoId: string | null = null,
        public esAsignacionManual: boolean = false,
        public observaciones?: string | null
    ) { }

    /**
     * Asigna un puesto manualmente (override)
     */
    asignarManual(puestoId: string) {
        this.puestoAsignadoId = puestoId;
        this.esAsignacionManual = true;
        this.estado = 'ASIGNADA';
    }

    /**
     * Asignación automática (por algoritmo)
     */
    asignarAutomatico(puestoId: string) {
        if (!this.esAsignacionManual) {
            this.puestoAsignadoId = puestoId;
            this.estado = 'ASIGNADA';
        }
    }
}
