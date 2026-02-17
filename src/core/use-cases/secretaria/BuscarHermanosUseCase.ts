/**
 * Use Case: Buscar Hermanos
 * Busca hermanos con filtros opcionales
 */

import { Hermano } from '@/core/domain/entities/Hermano';
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import type { EstadoHermano } from '@/core/domain/entities/Hermano';

export interface BuscarHermanosInput {
    estado?: EstadoHermano;
    cuotasAlDia?: boolean;
    search?: string;
    soloElegibles?: boolean;
}

export interface BuscarHermanosOutput {
    hermanos: Hermano[];
    total: number;
}

export class BuscarHermanosUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(input: BuscarHermanosInput = {}): Promise<BuscarHermanosOutput> {
        let hermanos: Hermano[];

        if (input.soloElegibles) {
            // Optimización: usar índice compuesto para elegibles
            hermanos = await this.hermanoRepository.findElegibles();

            // Aplicar búsqueda en texto si se especifica
            if (input.search) {
                const searchLower = input.search.toLowerCase();
                hermanos = hermanos.filter((h) => {
                    const fullName = h.getNombreCompleto().toLowerCase();
                    const dni = h.dni?.getValue()?.toLowerCase() || '';
                    return fullName.includes(searchLower) || dni.includes(searchLower);
                });
            }
        } else {
            // Búsqueda general con filtros
            hermanos = await this.hermanoRepository.findAll({
                estado: input.estado,
                cuotasAlDia: input.cuotasAlDia,
                search: input.search,
            });
        }

        return {
            hermanos,
            total: hermanos.length,
        };
    }
}
