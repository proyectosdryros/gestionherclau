
import { Recibo, EstadoRecibo } from '@/core/domain/entities/Recibo';
import { ReciboRepository } from '@/core/ports/repositories/ReciboRepository';
import { db } from '../indexeddb/db';
import type { ReciboDTO } from '@/lib/validations/tesoreria.schemas';
import { v7 as uuidv7 } from 'uuid';

function dtoToEntity(dto: ReciboDTO): Recibo {
    return new Recibo(
        dto.id,
        dto.hermanoId,
        dto.concepto,
        dto.importe,
        dto.estado,
        dto.tipo,
        dto.fechaEmision,
        dto.auditoria,
        dto.fechaVencimiento || undefined,
        dto.observaciones
    );
}

function entityToDto(entity: Recibo): ReciboDTO {
    return {
        id: entity.id,
        hermanoId: entity.hermanoId,
        concepto: entity.concepto,
        importe: entity.importe,
        estado: entity.estado,
        tipo: entity.tipo,
        fechaEmision: entity.fechaEmision,
        fechaVencimiento: entity.fechaVencimiento,
        observaciones: entity.observaciones,
        auditoria: entity.auditoria,
    };
}

export class DexieReciboRepository implements ReciboRepository {
    async findById(id: string): Promise<Recibo | null> {
        const dto = await db.recibos.get(id);
        return dto ? dtoToEntity(dto) : null;
    }

    async findByHermanoId(hermanoId: string): Promise<Recibo[]> {
        const dtos = await db.recibos.where('hermanoId').equals(hermanoId).toArray();
        return dtos.map(dtoToEntity);
    }

    async findAll(filters?: {
        estado?: EstadoRecibo;
        hermanoId?: string;
        desde?: Date;
        hasta?: Date;
    }): Promise<Recibo[]> {
        let collection = db.recibos.toCollection();

        if (filters?.estado) {
            collection = db.recibos.where('estado').equals(filters.estado);
        } else if (filters?.hermanoId) {
            collection = db.recibos.where('hermanoId').equals(filters.hermanoId);
        }

        let dtos = await collection.toArray();

        if (filters?.desde) {
            dtos = dtos.filter(d => d.fechaEmision >= filters.desde!);
        }
        if (filters?.hasta) {
            dtos = dtos.filter(d => d.fechaEmision <= filters.hasta!);
        }

        return dtos.map(dtoToEntity);
    }

    async create(recibo: Recibo): Promise<Recibo> {
        const dto = entityToDto(recibo);

        await db.transaction('rw', [db.recibos, db.syncQueue], async () => {
            await db.recibos.add(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'recibo',
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

    async update(recibo: Recibo): Promise<Recibo> {
        const dto = entityToDto(recibo);

        dto.auditoria.updated_at = new Date();
        dto.auditoria.version++;

        await db.transaction('rw', [db.recibos, db.syncQueue], async () => {
            await db.recibos.put(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'recibo',
                entityId: dto.id,
                operation: 'UPDATE',
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

    async delete(id: string): Promise<void> {
        await db.transaction('rw', [db.recibos, db.syncQueue], async () => {
            await db.recibos.delete(id);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'recibo',
                entityId: id,
                operation: 'DELETE',
                payload: '',
                localTimestamp: Date.now(),
                serverTimestamp: null,
                attempts: 0,
                priority: 'normal',
                status: 'pending',
                nextRetryAt: null,
            });
        });
    }
}
