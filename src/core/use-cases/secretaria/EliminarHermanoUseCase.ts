/**
 * Use Case: Eliminar Hermano
 * Realiza una baja (soft delete) del hermano y renumera a todos los demás hermanos con número superior
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
        // Movemos al hermano a un rango "muerto" y le cambiamos el estado.
        // Esto libera su número actual de forma inmediata.
        const hermanoBaja = hermanoADeliminar.update({
            estado: 'BAJA_VOLUNTARIA',
            numeroHermano: 990000 + numeroEliminado // Usamos un rango seguro
        });
        await this.hermanoRepository.update(hermanoBaja);

        // 3. Obtener ABSOLUTAMENTE TODOS los hermanos (sin filtrar por estado)
        // para asegurar que no dejamos huecos ni creamos conflictos con bajas temporales, etc.
        const todosLosHermanos = await this.hermanoRepository.findAll();

        // 4. Identificar quiénes tienen un número mayor al eliminado
        // Ordenamos estrictamente por número ASCENDENTE para evitar conflictos de clave única (unique constraint)
        const aRenumerar = todosLosHermanos
            .filter(h => h.numeroHermano > numeroEliminado && h.numeroHermano < 990000)
            .sort((a, b) => a.numeroHermano - b.numeroHermano);

        // 5. Actualizar uno a uno en cascada
        for (const hermano of aRenumerar) {
            const hermanoActualizado = hermano.update({
                numeroHermano: hermano.numeroHermano - 1
            });
            await this.hermanoRepository.update(hermanoActualizado);
        }
    }
}
