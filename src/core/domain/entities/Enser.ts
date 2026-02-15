
import { Auditoria } from './Recibo';

export type EstadoEnser = 'NUEVO' | 'BUENO' | 'REGULAR' | 'MALO' | 'RESTAURACION' | 'PERDIDO';
export type CategoriaEnser = 'ORFEBRERIA' | 'TEXTIL' | 'TALLA' | 'JOYERIA' | 'CERERIA' | 'HERRAMIENTA' | 'MOBILIARIO' | 'OTRO';

export class Enser {
    constructor(
        public readonly id: string,
        public readonly nombre: string,
        public readonly categoria: CategoriaEnser,
        public estado: EstadoEnser,
        public readonly ubicacion: string,
        public readonly auditoria: Auditoria,
        public descripcion?: string | null,
        public valorEstimado?: number | null,
        public fechaAdquisicion?: Date | null
    ) { }

    cambiarEstado(nuevoEstado: EstadoEnser) {
        this.estado = nuevoEstado;
    }
}
