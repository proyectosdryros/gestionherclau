/**
 * Hermano Entity
 * Representa un hermano/a de la cofradía
 */

import { DNI } from '../value-objects/DNI';
import { Email } from '../value-objects/Email';
import { Antiguedad } from '../value-objects/Antiguedad';

export type EstadoHermano =
    | 'ACTIVO'
    | 'BAJA_TEMPORAL'
    | 'BAJA_VOLUNTARIA'
    | 'FALLECIDO';

export interface ConsentimientosRGPD {
    datos: boolean;
    imagenes: boolean;
    comunicaciones: boolean;
}

export interface AuditoriaFields {
    created_at: Date;
    updated_at: Date;
    version: number; // Optimistic locking
}

export class Hermano {
    constructor(
        public readonly id: string,
        public readonly numeroHermano: number,
        public readonly nombre: string,
        public readonly apellido1: string,
        public readonly apellido2: string | null,
        public readonly dni: DNI | null,
        public readonly email: Email | null,
        public readonly telefono: string | null,
        public readonly fechaNacimiento: Date | null,
        public readonly fechaAlta: Date,
        public readonly estado: EstadoHermano,
        public readonly cuotasAlDia: boolean,
        public readonly consentimientos: ConsentimientosRGPD,
        public readonly auditoria: AuditoriaFields,
        public readonly apodo: string | null = null,
        public readonly rol: string | null = 'HERMANO',
        public readonly userId: string | null = null
    ) { }

    getNombreCompleto(): string {
        return this.apellido2
            ? `${this.nombre} ${this.apellido1} ${this.apellido2}`
            : `${this.nombre} ${this.apellido1}`;
    }

    getAntiguedad(): Antiguedad {
        return Antiguedad.create(this.fechaAlta);
    }

    isActivo(): boolean {
        return this.estado === 'ACTIVO';
    }

    puedeParticipar(): boolean {
        return this.isActivo() && this.cuotasAlDia;
    }

    /**
     * Crea una copia del hermano con campos actualizados
     */
    update(updates: Partial<Omit<Hermano, 'id' | 'numeroHermano' | 'auditoria'>>): Hermano {
        return new Hermano(
            this.id,
            this.numeroHermano,
            updates.nombre ?? this.nombre,
            updates.apellido1 ?? this.apellido1,
            updates.apellido2 !== undefined ? updates.apellido2 : this.apellido2,
            updates.dni !== undefined ? updates.dni : this.dni,
            updates.email !== undefined ? updates.email : this.email,
            updates.telefono !== undefined ? updates.telefono : this.telefono,
            updates.fechaNacimiento !== undefined ? updates.fechaNacimiento : this.fechaNacimiento,
            updates.fechaAlta ?? this.fechaAlta,
            updates.estado ?? this.estado,
            updates.cuotasAlDia ?? this.cuotasAlDia,
            updates.consentimientos ?? this.consentimientos,
            {
                ...this.auditoria,
                updated_at: new Date(),
                version: this.auditoria.version + 1,
            },
            updates.apodo !== undefined ? updates.apodo : this.apodo,
            updates.rol !== undefined ? updates.rol : this.rol,
            updates.userId !== undefined ? updates.userId : this.userId
        );
    }

    equals(other: Hermano): boolean {
        return this.id === other.id;
    }
}
