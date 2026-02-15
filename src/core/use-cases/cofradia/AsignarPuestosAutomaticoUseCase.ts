
import { PapeletaRepository } from '@/core/ports/repositories/PapeletaRepository';
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import { DexiePuestoRepository } from '@/infrastructure/repositories/indexeddb/DexiePuestoRepository';

export class AsignarPuestosAutomaticoUseCase {
    constructor(
        private papeletaRepo: PapeletaRepository,
        private hermanoRepo: HermanoRepository,
        private puestoRepo: DexiePuestoRepository
    ) { }

    async execute(anio: number) {
        // 1. Obtener todas las solicitudes pendientes para el año
        const papeletas = await this.papeletaRepo.findAll({ anio, estado: 'SOLICITADA' });
        if (papeletas.length === 0) return;

        // 2. Obtener datos de los hermanos para calcular prioridad por antigüedad
        const hermanosIds = papeletas.map(p => p.hermanoId);
        const hermanos = await Promise.all(hermanosIds.map(id => this.hermanoRepo.findById(id)));

        // Mapear antigüedad para ordenar
        const papeletasOrdenadas = papeletas.map(p => {
            const hermano = hermanos.find(h => h?.id === p.hermanoId);
            return {
                papeleta: p,
                fechaAlta: hermano?.fechaAlta.getTime() || Infinity
            };
        }).sort((a, b) => a.fechaAlta - b.fechaAlta); // Antigüedad ascendente (menor tiempo = más antiguo)

        // 3. Obtener puestos disponibles
        const puestos = await this.puestoRepo.findAllBySeccion();
        const ocupacion: Record<string, number> = {}; // track de puestos ocupados

        // 4. Asignar
        for (const entry of papeletasOrdenadas) {
            const { papeleta } = entry;

            // Si ya tiene asignación manual, saltar logic de algoritmo para este hermano
            if (papeleta.esAsignacionManual) continue;

            const solicitadoId = papeleta.puestoSolicitadoId;
            const puestoSolicitado = solicitadoId ? puestos.find(p => p.id === solicitadoId) : null;

            if (puestoSolicitado && (ocupacion[solicitadoId!] || 0) < puestoSolicitado.capacidad) {
                papeleta.asignarAutomatico(solicitadoId!);
                ocupacion[solicitadoId!] = (ocupacion[solicitadoId!] || 0) + 1;
            } else {
                // Si no hay el solicitado, buscar el siguiente disponible en su categoría o Cirio por defecto
                const cirioGeneral = puestos.find(p => p.categoria === 'CIRIO' && (ocupacion[p.id] || 0) < p.capacidad);
                if (cirioGeneral) {
                    papeleta.asignarAutomatico(cirioGeneral.id);
                    ocupacion[cirioGeneral.id] = (ocupacion[cirioGeneral.id] || 0) + 1;
                }
            }

            await this.papeletaRepo.update(papeleta);
        }
    }
}
