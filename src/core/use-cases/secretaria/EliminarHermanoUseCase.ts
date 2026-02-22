/**
 * Use Case: Eliminar Hermano
 * Realiza una baja (soft delete) del hermano y renumera a los demás
 */

import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';

export class EliminarHermanoUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(id: string): Promise<void> {
        // 1. Obtener el hermano que se va a dar de baja
        const hermanoADeliminar = await this.hermanoRepository.findById(id);
        if (!hermanoADeliminar) {
            throw new Error(`Hermano con ID ${id} no encontrado`);
        }

        const numeroEliminado = hermanoADeliminar.numeroHermano;

        // 2. Ejecutar la baja
        // IMPORTANTE: Para evitar conflictos de unicidad en numeroHermano, 
        // primero movemos al hermano que se va a dar de baja a un número muy alto
        // y le cambiamos el estado.
        const hermanoBaja = hermanoADeliminar.update({
            estado: 'BAJA_VOLUNTARIA',
            numeroHermano: 900000 + numeroEliminado // Fuera del rango normal
        });
        await this.hermanoRepository.update(hermanoBaja);

        // 3. Obtener todos los hermanos ACTIVOS para renumerar
        const todosLosHermanos = await this.hermanoRepository.findAll({ estado: 'ACTIVO' });

        // 4. Identificar quiénes necesitan un número nuevo (los que tenían un número mayor al eliminado)
        // Ordenamos por número actual de forma ACENDENTE para ir llenando los huecos de abajo hacia arriba
        // Esto evita conflictos de "número ya ocupado" durante el proceso.
        const aRenumerar = todosLosHermanos
            .filter(h => h.numeroHermano > numeroEliminado)
            .sort((a, b) => a.numeroHermano - b.numeroHermano);

        // 5. Actualizar uno a uno
        for (const hermano of aRenumerar) {
            const hermanoActualizado = hermano.update({
                numeroHermano: hermano.numeroHermano - 1
            });
            await this.hermanoRepository.update(hermanoActualizado);
        }
    }
}
