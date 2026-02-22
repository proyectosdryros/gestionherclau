/**
 * Use Case: Registrar Hermano
 * Crea un nuevo hermano en el sistema
 */

import { Hermano } from '@/core/domain/entities/Hermano';
import { DNI } from '@/core/domain/value-objects/DNI';
import { Email } from '@/core/domain/value-objects/Email';
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import { v7 as uuidv7 } from 'uuid';

export interface RegistrarHermanoInput {
    nombre: string;
    apodo?: string | null;
    direccion?: string | null;
    apellido1: string;
    apellido2?: string | null;
    dni?: string | null;
    email?: string | null;
    telefono?: string | null;
    fechaNacimiento?: Date | null;
    fechaAlta: Date;
    consentimientoDatos: boolean;
    consentimientoImagenes: boolean;
    consentimientoComunicaciones: boolean;
}

export class RegistrarHermanoUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(input: RegistrarHermanoInput): Promise<Hermano> {
        // 1. Validar que el DNI no esté duplicado (si se proporciona)
        let dniVO: DNI | null = null;
        if (input.dni) {
            dniVO = DNI.create(input.dni);
            const existente = await this.hermanoRepository.findByDni(dniVO);
            if (existente) {
                throw new Error(`Ya existe un hermano con el DNI ${input.dni}`);
            }
        }

        // 2. Validar email si se proporciona
        const emailVO = input.email ? Email.create(input.email) : null;

        // 3. Obtener siguiente número de hermano
        const numeroHermano = await this.hermanoRepository.getNextNumeroHermano();

        // 4. Crear entidad
        const hermano = new Hermano(
            uuidv7(), // UUID con timestamp
            numeroHermano,
            input.nombre.trim(),
            input.apellido1.trim(),
            input.apellido2?.trim() ?? null,
            dniVO,
            emailVO,
            input.telefono ?? null,
            input.fechaNacimiento ?? null,
            input.fechaAlta,
            'ACTIVO', // Por defecto activo
            false, // Cuotas al día - se actualiza al registrar pagos
            {
                datos: input.consentimientoDatos,
                imagenes: input.consentimientoImagenes,
                comunicaciones: input.consentimientoComunicaciones,
            },
            {
                created_at: new Date(),
                updated_at: new Date(),
                version: 1,
            },
            input.apodo?.trim() ?? null,
            input.direccion?.trim() ?? null
        );

        // 5. Persistir
        return await this.hermanoRepository.create(hermano);
    }
}
