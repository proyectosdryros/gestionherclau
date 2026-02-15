
import { Pago } from '../../domain/entities/Pago';

export interface PagoRepository {
    findById(id: string): Promise<Pago | null>;
    findByReciboId(reciboId: string): Promise<Pago[]>;
    create(pago: Pago): Promise<Pago>;
}
