/**
 * Use Case: Eliminar Hermano
 * Realiza una baja (soft delete) del hermano y renumera a todos los demás hermanos de forma segura.
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
        console.log(`Iniciando baja del hermano ${id} (nº ${numeroEliminado})`);

        try {
            // 2. Ejecutar la baja
            // Movemos al hermano a un rango "muerto" y le cambiamos el estado.
            const hermanoBaja = hermanoADeliminar.update({
                estado: 'BAJA_VOLUNTARIA',
                numeroHermano: 990000 + numeroEliminado
            });
            await this.hermanoRepository.update(hermanoBaja);
            console.log(`Hermano ${id} movido a rango muerto (99xxxx)`);

            // 3. Obtener todos los hermanos para renumerar
            const todosLosHermanos = await this.hermanoRepository.findAll();

            // 4. Identificar quiénes tienen un número mayor al eliminado
            // Filtramos los que están en el rango normal (menores de 800.000)
            const aRenumerar = todosLosHermanos
                .filter(h => h.numeroHermano > numeroEliminado && h.numeroHermano < 800000)
                .sort((a, b) => a.numeroHermano - b.numeroHermano);

            console.log(`Hermanos a renumerar encontrados: ${aRenumerar.length}`);

            if (aRenumerar.length > 0) {
                // FASE A: Mover a rango temporal para evitar cualquier conflicto de duplicados
                console.log('Fase A: Moviendo a rango temporal...');
                for (const hermano of aRenumerar) {
                    const temp = hermano.update({
                        numeroHermano: 800000 + hermano.numeroHermano
                    });
                    await this.hermanoRepository.update(temp);
                }

                // FASE B: Mover a su posición definitiva (n - 1)
                console.log('Fase B: Moviendo a posición definitiva...');
                for (const hermano of aRenumerar) {
                    // Volvemos a buscar el hermano en el repo porque su estado ha cambiado (o usamos el ID)
                    const hTemp = await this.hermanoRepository.findById(hermano.id);
                    if (hTemp) {
                        const final = hTemp.update({
                            numeroHermano: (hTemp.numeroHermano - 800000) - 1
                        });
                        await this.hermanoRepository.update(final);
                    }
                }
            }

            console.log('Proceso de baja y renumeración completado con éxito');

        } catch (error: any) {
            console.error('Error crítico en EliminarHermanoUseCase:', error);
            throw new Error(`Error en el proceso de baja: ${error.message || 'Error desconocido en la base de datos'}`);
        }
    }
}
