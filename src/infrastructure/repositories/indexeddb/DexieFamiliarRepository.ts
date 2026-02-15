
import { FamiliarRepository } from '@/core/ports/repositories/FamiliarRepository';
import { Familiar } from '@/core/domain/entities/Familiar';
import { db } from './db';
import type { FamiliarDTO } from '@/lib/validations/hermano.schemas';
import { v7 as uuidv7 } from 'uuid';

function dtoToEntity(dto: FamiliarDTO): Familiar {
    return new Familiar(
        dto.id,
        dto.hermanoId,
        dto.nombre,
        dto.apellido1,
        dto.apellido2,
        dto.tipo,
        dto.fechaNacimiento,
        dto.observaciones,
        dto.auditoria
    );
}

function entityToDto(entity: Familiar): FamiliarDTO {
    return {
        id: entity.id,
        hermanoId: entity.hermanoId,
        nombre: entity.nombre,
        apellido1: entity.apellido1,
        apellido2: entity.apellido2,
        tipo: entity.tipo,
        fechaNacimiento: entity.fechaNacimiento,
        observaciones: entity.observaciones,
        auditoria: entity.auditoria,
    };
}

export class DexieFamiliarRepository implements FamiliarRepository {
    async findById(id: string): Promise<Familiar | null> {
        const dto = await db.familiares.get(id);
        return dto ? dtoToEntity(dto) : null;
    }

    async findByHermanoId(hermanoId: string): Promise<Familiar[]> {
        const dtos = await db.familiares.where('hermanoId').equals(hermanoId).toArray();
        return dtos.map(dtoToEntity);
    }

    async create(familiar: Familiar): Promise<Familiar> {
        const dto = entityToDto(familiar);

        if (!dto.id) {
            dto.id = uuidv7();
        }

        await db.transaction('rw', [db.familiares, db.syncQueue], async () => {
            await db.familiares.add(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'familiar',
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

    async update(familiar: Familiar): Promise<Familiar> {
        const dto = entityToDto(familiar);
        await db.familiares.put(dto);
        return familiar;
    }

    async delete(id: string): Promise<void> {
        await db.transaction('rw', [db.familiares, db.syncQueue], async () => {
            await db.familiares.delete(id);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'familiar',
                entityId: id,
                operation: 'DELETE',
                payload: '', // Empty for delete
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
