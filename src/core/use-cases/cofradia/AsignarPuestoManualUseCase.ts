
import { PapeletaRepository } from '@/core/ports/repositories/PapeletaRepository';

export interface AsignarPuestoManualInput {
    papeletaId: string;
    puestoId: string;
}

export class AsignarPuestoManualUseCase {
    constructor(private repository: PapeletaRepository) { }

    async execute(input: AsignarPuestoManualInput) {
        const papeleta = await this.repository.findById(input.papeletaId);
        if (!papeleta) throw new Error('Papeleta no encontrada');

        papeleta.asignarManual(input.puestoId);
        return await this.repository.update(papeleta);
    }
}
