
import { Papeleta, EstadoPapeleta } from '@/core/domain/entities/Papeleta';
import { PapeletaRepository } from '@/core/ports/repositories/PapeletaRepository';
import { db } from '../indexeddb/db';
import type { PapeletaDTO } from '@/lib/validations/cofradia.schemas';
import { v7 as uuidv7 } from 'uuid';

function dtoToEntity(dto: PapeletaDTO): Papeleta {
    return new Papeleta(
        dto.id,
        dto.hermanoId,
        dto.anio,
        dto.fechaSolicitud,
        dto.estado,
        dto.auditoria,
        dto.puestoSolicitadoId,
        dto.puestoAsignadoId,
        dto.esAsignacionManual,
        dto.observaciones
    );
}

function entityToDto(entity: Papeleta): PapeletaDTO {
    return {
        id: entity.id,
        hermanoId: entity.hermanoId,
        anio: entity.anio,
        puestoSolicitadoId: entity.puestoSolicitadoId,
        puestoAsignadoId: entity.puestoAsignadoId,
        esAsignacionManual: entity.esAsignacionManual,
        estado: entity.estado,
        fechaSolicitud: entity.fechaSolicitud,
        auditoria: entity.auditoria,
        observaciones: entity.observaciones,
    };
}

export class DexiePapeletaRepository implements PapeletaRepository {
    async findById(id: string): Promise<Papeleta | null> {
        const dto = await db.papeletas.get(id);
        return dto ? dtoToEntity(dto) : null;
    }

    async findByHermanoId(hermanoId: string, anio: number): Promise<Papeleta | null> {
        const dto = await db.papeletas
            .where('[hermanoId+anio]')
            .equals([hermanoId, anio])
            .first();
        return dto ? dtoToEntity(dto) : null;
    }

    async findAll(filters?: { anio?: number; estado?: EstadoPapeleta; seccion?: string }): Promise<Papeleta[]> {
        let collection = db.papeletas.toCollection();

        if (filters?.anio) {
            collection = db.papeletas.where('anio').equals(filters.anio);
        } else if (filters?.estado) {
            collection = db.papeletas.where('estado').equals(filters.estado);
        }

        const dtos = await collection.toArray();
        // Nota: El filtro por sección requeriría un join o filtrar en memoria si no está en la tabla base
        return dtos.map(dtoToEntity);
    }

    async create(papeleta: Papeleta): Promise<Papeleta> {
        const dto = entityToDto(papeleta);

        await db.transaction('rw', [db.papeletas, db.syncQueue], async () => {
            await db.papeletas.add(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'papeleta',
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

    async update(papeleta: Papeleta): Promise<Papeleta> {
        const dto = entityToDto(papeleta);

        dto.auditoria.updated_at = new Date();
        dto.auditoria.version++;

        await db.transaction('rw', [db.papeletas, db.syncQueue], async () => {
            await db.papeletas.put(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'papeleta',
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
        await db.transaction('rw', [db.papeletas, db.syncQueue], async () => {
            await db.papeletas.delete(id);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'papeleta',
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
