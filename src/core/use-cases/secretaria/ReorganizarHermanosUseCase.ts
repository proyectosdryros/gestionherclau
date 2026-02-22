/**
 * Use Case: Reorganizar Números de Hermano
 * Asigna números correlativos (1, 2, 3...) a todos los hermanos ACTIVOS
 * basándose en su antigüedad o número actual de forma masiva y rápida.
 */

import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';

export class ReorganizarHermanosUseCase {
    constructor(private readonly hermanoRepository: HermanoRepository) { }

    async execute(): Promise<void> {
        console.log('Iniciando reorganización masiva de números de hermano...');

        // 1. Obtener todos los hermanos
        const todos = await this.hermanoRepository.findAll();

        // 2. Definir el orden natural
        const ordenados = todos.sort((a, b) => {
            const numA = a.numeroHermano % 100000;
            const numB = b.numeroHermano % 100000;

            if (a.estado === 'ACTIVO' && b.estado !== 'ACTIVO') return -1;
            if (a.estado !== 'ACTIVO' && b.estado === 'ACTIVO') return 1;
            if (numA !== numB) return numA - numB;
            return a.fechaAlta.getTime() - b.fechaAlta.getTime();
        });

        // FASE 1: Preparar los cambios en memoria
        let contadorActivos = 1;
        let contadorBajas = 900001;

        const actualizaciones = ordenados.map(hermano => {
            const nuevoNumero = hermano.estado === 'ACTIVO'
                ? contadorActivos++
                : contadorBajas++;

            return hermano.update({ numeroHermano: nuevoNumero });
        });

        // FASE 2: Aplicar los cambios de forma masiva (UPSERT)
        // Esto reduce cientos de llamadas a solo UNA.
        if (actualizaciones.length > 0) {
            console.log(`Aplicando ${actualizaciones.length} actualizaciones en bloque...`);
            await this.hermanoRepository.updateMany(actualizaciones);
        }

        console.log('Reorganización masiva completada con éxito.');
    }
}
