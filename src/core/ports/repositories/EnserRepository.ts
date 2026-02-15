
import { Enser, CategoriaEnser, EstadoEnser } from '../../domain/entities/Enser';

export interface EnserRepository {
    findById(id: string): Promise<Enser | null>;
    findAll(filters?: {
        categoria?: CategoriaEnser;
        estado?: EstadoEnser;
    }): Promise<Enser[]>;
    create(enser: Enser): Promise<Enser>;
    update(enser: Enser): Promise<Enser>;
    delete(id: string): Promise<void>;
}
