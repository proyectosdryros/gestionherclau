
import { MeritoRepository } from '@/core/ports/repositories/MeritoRepository';
import { Merito } from '@/core/domain/entities/Merito';
import { db } from './db';
import type { MeritoDTO } from '@/lib/validations/hermano.schemas';
import { v7 as uuidv7 } from 'uuid';

function dtoToEntity(dto: MeritoDTO): Merito {
    return new Merito(
        dto.id,
        dto.hermanoId,
        dto.tipo,
        dto.descripcion,
        dto.puntos,
        dto.fecha,
        dto.observaciones,
        dto.auditoria
    );
}

function entityToDto(entity: Merito): MeritoDTO {
    return {
        id: entity.id,
        hermanoId: entity.hermanoId,
        tipo: entity.tipo,
        descripcion: entity.descripcion,
        puntos: entity.puntos,
        fecha: entity.fecha,
        observaciones: entity.observaciones,
        auditoria: entity.auditoria,
    };
}

export class DexieMeritoRepository implements MeritoRepository {
    async findById(id: string): Promise<Merito | null> {
        const dto = await db.meritos.get(id);
        return dto ? dtoToEntity(dto) : null;
    }

    async findByHermanoId(hermanoId: string): Promise<Merito[]> {
        const dtos = await db.meritos.where('hermanoId').equals(hermanoId).toArray();
        return dtos.map(dtoToEntity);
    }

    async getTotalPuntosByHermanoId(hermanoId: string): Promise<number> {
        const dtos = await db.meritos.where('hermanoId').equals(hermanoId).toArray();
        return dtos.reduce((acc, curr) => acc + curr.puntos, 0);
    }

    async create(merito: Merito): Promise<Merito> {
        const dto = entityToDto(merito);

        if (!dto.id) {
            dto.id = uuidv7();
        }

        await db.transaction('rw', [db.meritos, db.syncQueue], async () => {
            await db.meritos.add(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'merito',
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

    async update(merito: Merito): Promise<Merito> {
        const dto = entityToDto(merito);
        await db.meritos.put(dto);
        return merito;
    }

    async delete(id: string): Promise<void> {
        await db.transaction('rw', [db.meritos, db.syncQueue], async () => {
            await db.meritos.delete(id);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'merito',
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
