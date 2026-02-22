/**
 * Dexie Hermano Repository Implementation
 * Implementa HermanoRepository usando IndexedDB via Dexie
 */

import { Hermano } from '@/core/domain/entities/Hermano';
import { DNI } from '@/core/domain/value-objects/DNI';
import { Email } from '@/core/domain/value-objects/Email';
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import { db } from './db';
import type { HermanoDTO } from '@/lib/validations/hermano.schemas';
import { v7 as uuidv7 } from 'uuid';

/**
 * Mapper: DTO -> Entity
 */
function dtoToEntity(dto: HermanoDTO): Hermano {
    return new Hermano(
        dto.id,
        dto.numeroHermano,
        dto.nombre,
        dto.apellido1,
        dto.apellido2,
        dto.dni ? DNI.create(dto.dni) : null,
        dto.email ? Email.create(dto.email) : null,
        dto.telefono ?? null,
        dto.fechaNacimiento,
        dto.fechaAlta,
        dto.estado,
        dto.cuotasAlDia,
        dto.consentimientos,
        dto.auditoria,
        dto.apodo ?? null,
        dto.direccion ?? null,
        dto.rol ?? 'HERMANO',
        dto.userId ?? null
    );
}

/**
 * Mapper: Entity -> DTO
 */
function entityToDto(entity: Hermano): HermanoDTO {
    return {
        id: entity.id,
        numeroHermano: entity.numeroHermano,
        nombre: entity.nombre,
        apodo: entity.apodo,
        direccion: entity.direccion,
        apellido1: entity.apellido1,
        apellido2: entity.apellido2,
        dni: entity.dni?.getValue() ?? null,
        email: entity.email?.getValue() ?? null,
        telefono: entity.telefono,
        fechaNacimiento: entity.fechaNacimiento,
        fechaAlta: entity.fechaAlta,
        estado: entity.estado,
        cuotasAlDia: entity.cuotasAlDia,
        consentimientos: entity.consentimientos,
        auditoria: entity.auditoria,
        userId: entity.userId
    };
}

export class DexieHermanoRepository implements HermanoRepository {
    async findById(id: string): Promise<Hermano | null> {
        const dto = await db.hermanos.get(id);
        return dto ? dtoToEntity(dto) : null;
    }

    async findByDni(dni: DNI): Promise<Hermano | null> {
        const dto = await db.hermanos.where('dni').equals(dni.getValue()).first();
        return dto ? dtoToEntity(dto) : null;
    }

    async findByNumero(numero: number): Promise<Hermano | null> {
        const dto = await db.hermanos.where('numeroHermano').equals(numero).first();
        return dto ? dtoToEntity(dto) : null;
    }

    async findByUserId(userId: string): Promise<Hermano | null> {
        const dto = await db.hermanos.where('userId').equals(userId).first();
        return dto ? dtoToEntity(dto) : null;
    }

    async findAll(filters?: {
        estado?: string;
        cuotasAlDia?: boolean;
        search?: string;
    }): Promise<Hermano[]> {
        let query = db.hermanos.toCollection();

        // Filtro por estado
        if (filters?.estado) {
            query = db.hermanos.where('estado').equals(filters.estado);
        }

        // Filtro por cuotas al día (índice compuesto)
        if (filters?.estado && filters?.cuotasAlDia !== undefined) {
            query = db.hermanos
                .where('[estado+cuotasAlDia]')
                .equals([filters.estado, filters.cuotasAlDia] as any);
        }

        let results = await query.toArray();

        // Búsqueda en texto (nombre, apodo, apellidos, DNI)
        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            results = results.filter((dto) => {
                const fullName = `${dto.nombre} ${dto.apodo ?? ''} ${dto.apellido1} ${dto.apellido2 ?? ''}`.toLowerCase();
                const dni = dto.dni?.toLowerCase() ?? '';
                return fullName.includes(searchLower) || dni.includes(searchLower);
            });
        }

        return results.map(dtoToEntity);
    }

    async findElegibles(): Promise<Hermano[]> {
        const dtos = await db.hermanos
            .where('[estado+cuotasAlDia]')
            .equals(['ACTIVO', true] as any)
            .toArray();

        return dtos.map(dtoToEntity);
    }

    async create(hermano: Hermano): Promise<Hermano> {
        const dto = entityToDto(hermano);

        // Si no tiene ID, generar UUIDv7 con timestamp
        if (!dto.id) {
            dto.id = uuidv7();
        }

        // Si no tiene número, auto-generar
        if (!dto.numeroHermano) {
            dto.numeroHermano = await this.getNextNumeroHermano();
        }

        // Establecer auditoría
        const now = new Date();
        dto.auditoria = {
            created_at: now,
            updated_at: now,
            version: 1,
        };

        await db.transaction('rw', [db.hermanos, db.syncQueue], async () => {
            await db.hermanos.add(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'hermano',
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

    async update(hermano: Hermano): Promise<Hermano> {
        const dto = entityToDto(hermano);

        // Actualizar auditoría
        dto.auditoria.updated_at = new Date();
        dto.auditoria.version++;

        await db.transaction('rw', [db.hermanos, db.syncQueue], async () => {
            await db.hermanos.put(dto);
            await db.syncQueue.add({
                id: uuidv7(),
                entityType: 'hermano',
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

    async updateMany(hermanos: Hermano[]): Promise<void> {
        if (hermanos.length === 0) return;
        const dtos = hermanos.map(entityToDto);
        const now = new Date();

        dtos.forEach(dto => {
            dto.auditoria.updated_at = now;
            dto.auditoria.version++;
        });

        await db.transaction('rw', [db.hermanos, db.syncQueue], async () => {
            await db.hermanos.bulkPut(dtos);
            // Sync queue para cada uno (se podría optimizar más pero para compatibilidad...)
            for (const dto of dtos) {
                await db.syncQueue.add({
                    id: uuidv7(),
                    entityType: 'hermano',
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
            }
        });
    }

    async delete(id: string): Promise<void> {
        // Soft delete - cambiar estado a BAJA_VOLUNTARIA
        const hermano = await this.findById(id);
        if (!hermano) {
            throw new Error(`Hermano con ID ${id} no encontrado`);
        }

        const updated = hermano.update({ estado: 'BAJA_VOLUNTARIA' });
        await this.update(updated);
    }

    async getNextNumeroHermano(): Promise<number> {
        const maxNumero = await db.hermanos
            .orderBy('numeroHermano')
            .reverse()
            .first();

        return maxNumero ? maxNumero.numeroHermano + 1 : 1;
    }

    async count(filters?: { estado?: string }): Promise<number> {
        if (filters?.estado) {
            return await db.hermanos.where('estado').equals(filters.estado).count();
        }
        return await db.hermanos.count();
    }
}
