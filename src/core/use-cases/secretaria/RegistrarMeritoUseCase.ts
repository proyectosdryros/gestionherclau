import { v7 as uuidv7 } from 'uuid';
import { MeritoRepository } from '@/core/ports/repositories/MeritoRepository';
import { Merito } from '@/core/domain/entities/Merito';
import { MeritoCreateDTO } from '@/lib/validations/hermano.schemas';

export class RegistrarMeritoUseCase {
    constructor(private readonly meritoRepository: MeritoRepository) { }

    async execute(data: MeritoCreateDTO & { hermanoId: string }): Promise<Merito> {
        const meritoId = uuidv7();
        const now = new Date();

        const nuevoMerito = new Merito(
            meritoId,
            data.hermanoId,
            data.tipo,
            data.descripcion,
            data.puntos,
            new Date(data.fecha),
            data.observaciones ?? null,
            {
                created_at: now,
                updated_at: now,
                version: 1
            }
        );

        return await this.meritoRepository.create(nuevoMerito);
    }
}
