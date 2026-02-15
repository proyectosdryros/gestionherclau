/**
 * Repository Port (Interface) - Mérito
 */

import { Merito } from '@/core/domain/entities/Merito';

export interface MeritoRepository {
    findById(id: string): Promise<Merito | null>;

    findByHermanoId(hermanoId: string): Promise<Merito[]>;

    /**
     * Calcula puntos totales de méritos para un hermano
     */
    getTotalPuntosByHermanoId(hermanoId: string): Promise<number>;

    create(merito: Merito): Promise<Merito>;

    update(merito: Merito): Promise<Merito>;

    delete(id: string): Promise<void>;
}
