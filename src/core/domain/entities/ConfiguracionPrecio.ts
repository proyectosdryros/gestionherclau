
export interface AuditoriaFields {
    created_at: Date;
    updated_at: Date;
    version: number;
}

export type TipoPrecio = 'CUOTA' | 'PAPELETA_SITIO' | 'PAPELETA_SIMBOLICA' | 'DONATIVO' | 'CRUZ_GUIA' | 'NAZARENO' | 'VARA' | 'BOCINA' | 'INSIGNIA' | 'FAROL' | 'COSTALERO' | 'OTRO';

export class ConfiguracionPrecio {
    constructor(
        public readonly id: string,
        public readonly tipo: string, // Flexible para permitir nuevos tipos desde UI si se desea
        public readonly nombre: string,
        public readonly importe: number,
        public readonly anio: number | null,
        public readonly activo: boolean,
        public readonly auditoria: AuditoriaFields
    ) {
        if (importe < 0) {
            throw new Error('El importe no puede ser negativo');
        }
    }

    equals(other: ConfiguracionPrecio): boolean {
        return this.id === other.id;
    }

    getDescripcionCompleta(): string {
        return `${this.nombre} (${this.importe.toFixed(2)}€)`;
    }
}
