
import { MeritoRepository } from '@/core/ports/repositories/MeritoRepository';
import { Merito } from '@/core/domain/entities/Merito';
import { db } from './db';
import type { MeritoDTO } from '@/lib/validations/hermano.schemas';

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
        await db.meritos.add(dto);
        return merito;
    }

    async update(merito: Merito): Promise<Merito> {
        const dto = entityToDto(merito);
        await db.meritos.put(dto);
        return merito;
    }

    async delete(id: string): Promise<void> {
        await db.meritos.delete(id);
    }
}
