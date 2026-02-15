import { MeritoRepository } from '@/core/ports/repositories/MeritoRepository';

export class EliminarMeritoUseCase {
    constructor(private readonly meritoRepository: MeritoRepository) { }

    async execute(id: string): Promise<void> {
        await this.meritoRepository.delete(id);
    }
}
