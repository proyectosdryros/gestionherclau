
import { Papeleta, EstadoPapeleta } from '../../domain/entities/Papeleta';

export interface PapeletaRepository {
    findById(id: string): Promise<Papeleta | null>;
    findByHermanoId(hermanoId: string, anio: number): Promise<Papeleta | null>;
    findAll(filters?: {
        anio?: number;
        estado?: EstadoPapeleta;
        seccion?: string;
    }): Promise<Papeleta[]>;
    create(papeleta: Papeleta): Promise<Papeleta>;
    update(papeleta: Papeleta): Promise<Papeleta>;
    delete(id: string): Promise<void>;
}
