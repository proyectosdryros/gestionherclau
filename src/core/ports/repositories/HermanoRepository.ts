/**
 * Repository Port (Interface) - Hermano
 * Define el contrato que deben cumplir los repositorios
 */

import { Hermano } from '@/core/domain/entities/Hermano';
import { DNI } from '@/core/domain/value-objects/DNI';

export interface HermanoRepository {
    /**
     * Obtiene un hermano por ID
     */
    findById(id: string): Promise<Hermano | null>;

    /**
     * Obtiene un hermano por DNI
     */
    findByDni(dni: DNI): Promise<Hermano | null>;

    /**
     * Obtiene un hermano por número
     */
    findByNumero(numero: number): Promise<Hermano | null>;

    /**
     * Obtiene un hermano vinculado a un User ID de Auth
     */
    findByUserId(userId: string): Promise<Hermano | null>;

    /**
     * Busca hermanos con filtros opcionales
     */
    findAll(filters?: {
        estado?: string;
        cuotasAlDia?: boolean;
        search?: string; // Busca en nombre, apellidos, DNI
    }): Promise<Hermano[]>;

    /**
     * Obtiene hermanos elegibles para participar (activos + cuotas al día)
     */
    findElegibles(): Promise<Hermano[]>;

    /**
     * Crea un nuevo hermano
     */
    create(hermano: Hermano): Promise<Hermano>;

    /**
     * Actualiza un hermano existente
     */
    update(hermano: Hermano): Promise<Hermano>;

    /**
     * Elimina un hermano (soft delete - cambiar estado a BAJA_VOLUNTARIA)
     */
    delete(id: string): Promise<void>;

    /**
     * Obtiene el siguiente número de hermano disponible
     */
    getNextNumeroHermano(): Promise<number>;

    /**
     * Cuenta total de hermanos
     */
    count(filters?: { estado?: string }): Promise<number>;
}
