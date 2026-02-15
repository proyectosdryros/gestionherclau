/**
 * Mérito Entity
 * Representa un mérito asociado a un hermano (para puntuación en asignación)
 */

export type TipoMerito =
    | 'CARGO_JUNTA'
    | 'DONATIVO_EXTRAORDINARIO'
    | 'VOLUNTARIADO'
    | 'ANTIGUEDAD_ESPECIAL'
    | 'OTRO';

export interface AuditoriaFields {
    created_at: Date;
    updated_at: Date;
    version: number;
}

export class Merito {
    constructor(
        public readonly id: string,
        public readonly hermanoId: string,
        public readonly tipo: TipoMerito,
        public readonly descripcion: string,
        public readonly puntos: number,
        public readonly fecha: Date,
        public readonly observaciones: string | null,
        public readonly auditoria: AuditoriaFields
    ) {
        if (puntos < 0) {
            throw new Error('Los puntos de un mérito no pueden ser negativos');
        }
    }

    equals(other: Merito): boolean {
        return this.id === other.id;
    }

    /**
     * Obtiene una descripción legible del mérito
     */
    getDescripcionCompleta(): string {
        const año = this.fecha.getFullYear();
        return `${this.descripcion} (${año}) - ${this.puntos} pts`;
    }
}
