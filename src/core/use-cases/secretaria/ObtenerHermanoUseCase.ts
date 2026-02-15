/**
 * Use Case: Obtener Hermano por ID
 * Obtiene los detalles completos de un hermano
 */

import { Hermano } from '@/core/domain/entities/Hermano';
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import { Familiar } from '@/core/domain/entities/Familiar';
import { Merito } from '@/core/domain/entities/Merito';
import { FamiliarRepository } from '@/core/ports/repositories/FamiliarRepository';
import { MeritoRepository } from '@/core/ports/repositories/MeritoRepository';

export interface ObtenerHermanoOutput {
    hermano: Hermano;
    familiares: Familiar[];
    meritos: Merito[];
    puntosTotales: number;
}

export class ObtenerHermanoUseCase {
    constructor(
        private readonly hermanoRepository: HermanoRepository,
        private readonly familiarRepository: FamiliarRepository,
        private readonly meritoRepository: MeritoRepository
    ) { }

    async execute(hermanoId: string): Promise<ObtenerHermanoOutput> {
        // 1. Obtener hermano
        const hermano = await this.hermanoRepository.findById(hermanoId);

        if (!hermano) {
            throw new Error(`Hermano con ID ${hermanoId} no encontrado`);
        }

        // 2. Obtener datos relacionados en paralelo
        const [familiares, meritos, puntosTotales] = await Promise.all([
            this.familiarRepository.findByHermanoId(hermanoId),
            this.meritoRepository.findByHermanoId(hermanoId),
            this.meritoRepository.getTotalPuntosByHermanoId(hermanoId),
        ]);

        return {
            hermano,
            familiares,
            meritos,
            puntosTotales,
        };
    }
}
