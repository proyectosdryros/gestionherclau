/**
 * Use Case: Actualizar Hermano
 * Actualiza los datos de un hermano existente
 */

import { Hermano } from '@/core/domain/entities/Hermano';
import { DNI } from '@/core/domain/value-objects/DNI';
import { Email } from '@/core/domain/value-objects/Email';
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import type { EstadoHermano } from '@/core/domain/entities/Hermano';

export interface ActualizarHermanoInput {
    id: string;
    nombre?: string;
    apodo?: string | null;
    apellido1?: string;
    apellido2?: string | null;
    dni?: string | null;
    email?: string | null;
    telefono?: string | null;
    fechaNacimiento?: Date | null;
    estado?: EstadoHermano;
    cuotasAlDia?: boolean;
    consentimientos?: {
        datos?: boolean;
        imagenes?: boolean;
        comunicaciones?: boolean;
    };
}

export class ActualizarHermanoUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(input: ActualizarHermanoInput): Promise<Hermano> {
        // 1. Obtener hermano existente
        const hermano = await this.hermanoRepository.findById(input.id);

        if (!hermano) {
            throw new Error(`Hermano con ID ${input.id} no encontrado`);
        }

        // 2. Validar email si se actualiza
        const emailVO = input.email !== undefined
            ? input.email ? Email.create(input.email) : null
            : hermano.email;

        // 3. Validar DNI si se actualiza
        let dniVO = hermano.dni;
        if (input.dni !== undefined) {
            dniVO = input.dni ? DNI.create(input.dni) : null;
            // Solo validar duplicados si está cambiando el DNI por uno NO nulo
            if (dniVO && (!hermano.dni || !dniVO.equals(hermano.dni))) {
                const existente = await this.hermanoRepository.findByDni(dniVO);
                if (existente) {
                    throw new Error(`Ya existe un hermano con el DNI ${input.dni}`);
                }
            }
        }

        // 4. Preparar actualizaciones
        const updates: any = {};

        if (input.nombre !== undefined) updates.nombre = input.nombre.trim();
        if (input.apodo !== undefined) updates.apodo = input.apodo?.trim() ?? null;
        if (input.apellido1 !== undefined) updates.apellido1 = input.apellido1.trim();
        if (input.apellido2 !== undefined) updates.apellido2 = input.apellido2?.trim() ?? null;
        if (input.dni !== undefined) updates.dni = dniVO;
        if (input.email !== undefined) updates.email = emailVO;
        if (input.telefono !== undefined) updates.telefono = input.telefono;
        if (input.fechaNacimiento !== undefined) updates.fechaNacimiento = input.fechaNacimiento;
        if (input.estado !== undefined) updates.estado = input.estado;
        if (input.cuotasAlDia !== undefined) updates.cuotasAlDia = input.cuotasAlDia;

        // Actualizar consentimientos
        if (input.consentimientos) {
            updates.consentimientos = {
                datos: input.consentimientos.datos ?? hermano.consentimientos.datos,
                imagenes: input.consentimientos.imagenes ?? hermano.consentimientos.imagenes,
                comunicaciones: input.consentimientos.comunicaciones ?? hermano.consentimientos.comunicaciones,
            };
        }

        // 4. Aplicar actualización (inmutabilidad)
        const hermanoActualizado = hermano.update(updates);

        // 5. Persistir
        return await this.hermanoRepository.update(hermanoActualizado);
    }
}
