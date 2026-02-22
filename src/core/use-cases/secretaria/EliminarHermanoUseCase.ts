/**
 * Use Case: Eliminar Hermano
 * Realiza una baja (soft delete) del hermano
 */

import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';

export class EliminarHermanoUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(id: string): Promise<void> {
        await this.hermanoRepository.delete(id);
    }
}
