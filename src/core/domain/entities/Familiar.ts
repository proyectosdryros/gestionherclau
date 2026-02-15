/**
 * Familiar Entity
 * Representa un familiar asociado a un hermano
 */

export type TipoFamiliar =
    | 'CONYUGE'
    | 'HIJO'
    | 'PADRE'
    | 'MADRE'
    | 'HERMANO'
    | 'OTRO';

export interface AuditoriaFields {
    created_at: Date;
    updated_at: Date;
    version: number;
}

export class Familiar {
    constructor(
        public readonly id: string,
        public readonly hermanoId: string,
        public readonly nombre: string,
        public readonly apellido1: string,
        public readonly apellido2: string | null,
        public readonly tipo: TipoFamiliar,
        public readonly fechaNacimiento: Date | null,
        public readonly observaciones: string | null,
        public readonly auditoria: AuditoriaFields
    ) { }

    getNombreCompleto(): string {
        return this.apellido2
            ? `${this.nombre} ${this.apellido1} ${this.apellido2}`
            : `${this.nombre} ${this.apellido1}`;
    }

    getEdad(): number | null {
        if (!this.fechaNacimiento) return null;

        const today = new Date();
        const birthDate = new Date(this.fechaNacimiento);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    equals(other: Familiar): boolean {
        return this.id === other.id;
    }
}
