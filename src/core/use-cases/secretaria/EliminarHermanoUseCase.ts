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

        // 2. Ejecutar la baja (soft delete -> BAJA_VOLUNTARIA)
        await this.hermanoRepository.delete(id);

        // 3. Obtener todos los hermanos ACTIVOS para renumerar
        // Filtramos por ACTIVO para que la numeración solo aplique a los que están en alta
        const todosLosHermanos = await this.hermanoRepository.findAll({ estado: 'ACTIVO' });

        // 4. Identificar quiénes necesitan un número nuevo (los que tenían un número mayor al eliminado)
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
