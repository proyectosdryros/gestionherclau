import { FamiliarRepository } from '@/core/ports/repositories/FamiliarRepository';

export class EliminarFamiliarUseCase {
    constructor(private readonly familiarRepository: FamiliarRepository) { }

    async execute(id: string): Promise<void> {
        await this.familiarRepository.delete(id);
    }
}
