
import { Puesto } from '@/core/domain/entities/Puesto';
import { db } from '../indexeddb/db';
import type { PuestoDTO } from '@/lib/validations/cofradia.schemas';

function dtoToEntity(dto: PuestoDTO): Puesto {
    return new Puesto(
        dto.id,
        dto.nombre,
        dto.categoria,
        dto.capacidad,
        dto.ordenInSection,
        dto.seccion
    );
}

function entityToDto(entity: Puesto): PuestoDTO {
    return {
        id: entity.id,
        nombre: entity.nombre,
        categoria: entity.categoria,
        capacidad: entity.capacidad,
        ordenInSection: entity.ordenInSection,
        seccion: entity.seccion,
    };
}

export class DexiePuestoRepository {
    async findById(id: string): Promise<Puesto | null> {
        const dto = await db.puestos.get(id);
        return dto ? dtoToEntity(dto) : null;
    }

    async findAllBySeccion(seccion?: string): Promise<Puesto[]> {
        let collection = db.puestos.toCollection();
        if (seccion) {
            collection = db.puestos.where('seccion').equals(seccion);
        }
        const dtos = await collection.sortBy('ordenInSection');
        return dtos.map(dtoToEntity);
    }

    async bulkCreate(puestos: Puesto[]): Promise<void> {
        const dtos = puestos.map(entityToDto);
        await db.puestos.bulkAdd(dtos);
    }
}
