/**
 * Use Case: Reorganizar Números de Hermano
 * Asigna números correlativos (1, 2, 3...) a todos los hermanos ACTIVOS
 * basándose en su antigüedad o número actual.
 */

import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';

export class ReorganizarHermanosUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(): Promise<void> {
        console.log('Iniciando reorganización completa de números de hermano...');

        // 1. Obtener todos los hermanos sin filtros de estado
        const todos = await this.hermanoRepository.findAll();

        // 2. Definir el orden natural: 
        // Primero los ACTIVOS por su número actual (limpiando offsets temporales)
        // Luego los demás estados.
        const ordenados = todos.sort((a, b) => {
            // Limpiamos los offsets de 800.000 o 900.000 si existen
            const numA = a.numeroHermano % 100000;
            const numB = b.numeroHermano % 100000;

            // Prioridad 1: Estado (ACTIVO primero)
            if (a.estado === 'ACTIVO' && b.estado !== 'ACTIVO') return -1;
            if (a.estado !== 'ACTIVO' && b.estado === 'ACTIVO') return 1;

            // Prioridad 2: Número de hermano (antigüedad)
            if (numA !== numB) return numA - numB;

            // Prioridad 3: Fecha de alta por si acaso
            return a.fechaAlta.getTime() - b.fechaAlta.getTime();
        });

        console.log(`Reorganizando ${ordenados.length} hermanos...`);

        // FASE 1: Mover a todos a un rango neutro muy alto para evitar choques de duplicados
        // Usamos un rango de 900.000
        for (const hermano of ordenados) {
            const hTemp = hermano.update({ numeroHermano: 900000 + (hermano.numeroHermano % 100000) });
            await this.hermanoRepository.update(hTemp);
        }

        // FASE 2: Asignar números finales correlativos
        // Solo numeramos del 1 en adelante a los ACTIVOS. 
        // Las BAJAS se quedan en el rango 900.000 para que no interfieran.
        let contadorActivos = 1;
        let contadorBajas = 900001;

        for (const hermano of ordenados) {
            const hActual = await this.hermanoRepository.findById(hermano.id);
            if (!hActual) continue;

            const nuevoNumero = hActual.estado === 'ACTIVO'
                ? contadorActivos++
                : contadorBajas++;

            const final = hActual.update({ numeroHermano: nuevoNumero });
            await this.hermanoRepository.update(final);
        }

        console.log('Reorganización completada con éxito.');
    }
}
