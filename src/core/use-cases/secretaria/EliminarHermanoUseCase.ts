/**
 * Use Case: Eliminar Hermano
 * Realiza una baja (soft delete) del hermano y activa la reorganización global de números.
 */

import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import { ReorganizarHermanosUseCase } from './ReorganizarHermanosUseCase';

export class EliminarHermanoUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(id: string): Promise<void> {
        // 1. Obtener el hermano que se va a dar de baja
        const hermanoADeliminar = await this.hermanoRepository.findById(id);
        if (!hermanoADeliminar) {
            throw new Error(`Hermano con ID ${id} no encontrado`);
        }

        // 2. Ejecutar la baja (cambio a BAJA_VOLUNTARIA y número muerto)
        const hermanoBaja = hermanoADeliminar.update({
            estado: 'BAJA_VOLUNTARIA',
            numeroHermano: 990000 + (hermanoADeliminar.numeroHermano % 100000)
        });
        await this.hermanoRepository.update(hermanoBaja);

        // 3. Reorganizar todos los números para que sean correlativos 1, 2, 3...
        const reorganizar = new ReorganizarHermanosUseCase(this.hermanoRepository);
        await reorganizar.execute();
    }
}
