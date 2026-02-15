
import { Recibo, EstadoRecibo } from '../../domain/entities/Recibo';

export interface ReciboRepository {
    findById(id: string): Promise<Recibo | null>;
    findByHermanoId(hermanoId: string): Promise<Recibo[]>;
    findAll(filters?: {
        estado?: EstadoRecibo;
        hermanoId?: string;
        desde?: Date;
        hasta?: Date;
    }): Promise<Recibo[]>;
    create(recibo: Recibo): Promise<Recibo>;
    update(recibo: Recibo): Promise<Recibo>;
    delete(id: string): Promise<void>; // Propuesta: soft delete por defecto
}
