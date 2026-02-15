import { v7 as uuidv7 } from 'uuid';
import { FamiliarRepository } from '@/core/ports/repositories/FamiliarRepository';
import { Familiar } from '@/core/domain/entities/Familiar';
import { FamiliarCreateDTO, FamiliarSchema } from '@/lib/validations/hermano.schemas';

export class RegistrarFamiliarUseCase {
    constructor(private readonly familiarRepository: FamiliarRepository) { }

    async execute(data: FamiliarCreateDTO & { hermanoId: string }): Promise<Familiar> {
        // Validar datos de entrada
        // Nota: hermanoId viene del contexto (URL) o del formulario
        const familiarId = uuidv7();
        const now = new Date();

        const newFamiliar = new Familiar(
            familiarId,
            data.hermanoId,
            data.nombre,
            data.apellido1,
            data.apellido2 ?? null,
            data.tipo,
            data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
            data.observaciones ?? null,
            {
                created_at: now,
                updated_at: now,
                version: 1
            }
        );

        // Persistir
        return await this.familiarRepository.create(newFamiliar);
    }
}
