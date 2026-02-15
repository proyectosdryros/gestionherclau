
import { Enser, CategoriaEnser, EstadoEnser } from '@/core/domain/entities/Enser';
import { EnserRepository } from '@/core/ports/repositories/EnserRepository';
import { db } from '../indexeddb/db';
import type { EnserDTO } from '@/lib/validations/priostia.schemas';
import { v7 as uuidv7 } from 'uuid';

function dtoToEntity(dto: EnserDTO): Enser {
    return new Enser(
        dto.id,
        dto.nombre,
        dto.categoria,
        dto.estado,
        dto.ubicacion,
        dto.auditoria,
        dto.descripcion,
        dto.valorEstimado,
        dto.fechaAdquisicion || undefined
    );
}

function entityToDto(entity: Enser): EnserDTO {
    return {
        id: entity.id,
        nombre: entity.nombre,
        categoria: entity.categoria,
        estado: entity.estado,
        ubicacion: entity.ubicacion,
        descripcion: entity.descripcion,
        valorEstimado: entity.valorEstimado,
        fechaAdquisicion: entity.fechaAdquisicion,
        auditoria: entity.auditoria,
    };
}

export class DexieEnserRepository implements EnserRepository {
    async findById(id: string): Promise<Enser | null> {
        const dto = await db.enseres.get(id);
        return dto ? dtoToEntity(dto) : null;
    }

    async findAll(filters?: { categoria?: CategoriaEnser; estado?: EstadoEnser }): Promise<Enser[]> {
        let collection = db.enseres.toCollection();

        if (filters?.categoria) {
            collection = db.enseres.where('categoria').equals(filters.categoria);
        } else if (filters?.estado) {
            collection = db.enseres.where('estado').equals(filters.estado);
        }

        const dtos = await collection.toArray();
        return dtos.map(dtoToEntity);
    }

    async create(enser: Enser): Promise<Enser> {
        const dto = entityToDto(enser);
        await db.transaction('rw', [db.enseres, db.syncQueue], async () => {
            await db.enseres.add(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'enser',
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

    async update(enser: Enser): Promise<Enser> {
        const dto = entityToDto(enser);
        dto.auditoria.updated_at = new Date();
        dto.auditoria.version++;

        await db.transaction('rw', [db.enseres, db.syncQueue], async () => {
            await db.enseres.put(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'enser',
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
        await db.transaction('rw', [db.enseres, db.syncQueue], async () => {
            await db.enseres.delete(id);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'enser',
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
