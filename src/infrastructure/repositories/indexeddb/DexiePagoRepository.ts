
import { Pago } from '@/core/domain/entities/Pago';
import { PagoRepository } from '@/core/ports/repositories/PagoRepository';
import { db } from '../indexeddb/db';
import type { PagoDTO } from '@/lib/validations/tesoreria.schemas';
import { v7 as uuidv7 } from 'uuid';

function dtoToEntity(dto: PagoDTO): Pago {
    return new Pago(
        dto.id,
        dto.reciboId,
        dto.importe,
        dto.fechaPago,
        dto.metodoPago,
        dto.auditoria,
        dto.referenciaExterna,
        dto.observaciones
    );
}

function entityToDto(entity: Pago): PagoDTO {
    return {
        id: entity.id,
        reciboId: entity.reciboId,
        importe: entity.importe,
        fechaPago: entity.fechaPago,
        metodoPago: entity.metodoPago,
        referenciaExterna: entity.referenciaExterna,
        observaciones: entity.observaciones,
        auditoria: entity.auditoria,
    };
}

export class DexiePagoRepository implements PagoRepository {
    async findById(id: string): Promise<Pago | null> {
        const dto = await db.pagos.get(id);
        return dto ? dtoToEntity(dto) : null;
    }

    async findByReciboId(reciboId: string): Promise<Pago[]> {
        const dtos = await db.pagos.where('reciboId').equals(reciboId).toArray();
        return dtos.map(dtoToEntity);
    }

    async create(pago: Pago): Promise<Pago> {
        const dto = entityToDto(pago);

        await db.transaction('rw', [db.pagos, db.syncQueue], async () => {
            await db.pagos.add(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'recibo', // En InsForge usaremos una tabla unificada o específica, pero aquí marcamos como parte del flujo de recibos
                entityId: dto.id,
                operation: 'CREATE',
                payload: JSON.stringify(dto),
                localTimestamp: Date.now(),
                serverTimestamp: null,
                attempts: 0,
                priority: 'normal',
                status: 'pending',
                nextRetryAt: null,
            });
        });

        return dtoToEntity(dto);
    }
}
