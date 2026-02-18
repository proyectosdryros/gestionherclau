/**
 * Use Case: Obtener Mi Perfil
 * Obtiene los detalles del hermano vinculado al User ID actual
 */

import { Hermano } from '@/core/domain/entities/Hermano';
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import { Familiar } from '@/core/domain/entities/Familiar';
import { Merito } from '@/core/domain/entities/Merito';
import { FamiliarRepository } from '@/core/ports/repositories/FamiliarRepository';
import { MeritoRepository } from '@/core/ports/repositories/MeritoRepository';

export interface ObtenerMiPerfilOutput {
    hermano: Hermano;
    familiares: Familiar[];
    meritos: Merito[];
    puntosTotales: number;
}

export class ObtenerMiPerfilUseCase {
    constructor(
        private readonly hermanoRepository: HermanoRepository,
        private readonly familiarRepository: FamiliarRepository,
        private readonly meritoRepository: MeritoRepository
    ) { }

    async execute(userId: string): Promise<ObtenerMiPerfilOutput> {
        // 1. Obtener hermano vinculado al User ID
        const hermano = await this.hermanoRepository.findByUserId(userId);

        if (!hermano) {
            throw new Error(`Perfil de hermano no encontrado para el usuario ${userId}`);
        }

        const hermanoId = hermano.id;

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
