
import { ConfiguracionPrecio, AuditoriaFields } from '@/core/domain/entities/ConfiguracionPrecio';
import { PrecioRepository } from '@/core/ports/repositories/PrecioRepository';
import { v7 as uuidv7 } from 'uuid';

export interface PrecioDTO {
    id?: string;
    tipo: string;
    nombre: string;
    importe: number;
    anio?: number | null;
    activo?: boolean;
}

export class ObtenerPreciosUseCase {
    constructor(private readonly repository: PrecioRepository) { }

    async execute(filters?: { activo?: boolean; tipo?: string; anio?: number }): Promise<ConfiguracionPrecio[]> {
        return this.repository.findAll(filters);
    }
}

export class CrearPrecioUseCase {
    constructor(private readonly repository: PrecioRepository) { }

    async execute(dto: PrecioDTO): Promise<ConfiguracionPrecio> {
        const auditoria: AuditoriaFields = {
            created_at: new Date(),
            updated_at: new Date(),
            version: 1
        };

        const precio = new ConfiguracionPrecio(
            dto.id || uuidv7(),
            dto.tipo,
            dto.nombre,
            dto.importe,
            dto.anio || null,
            dto.activo ?? true,
            auditoria
        );

        return this.repository.create(precio);
    }
}

export class ActualizarPrecioUseCase {
    constructor(private readonly repository: PrecioRepository) { }

    async execute(id: string, dto: Partial<PrecioDTO>): Promise<ConfiguracionPrecio> {
        const current = await this.repository.findById(id);
        if (!current) throw new Error('Precio no encontrado');

        const auditoria: AuditoriaFields = {
            ...current.auditoria,
            updated_at: new Date(),
            version: current.auditoria.version + 1
        };

        const updated = new ConfiguracionPrecio(
            current.id,
            dto.tipo ?? current.tipo,
            dto.nombre ?? current.nombre,
            dto.importe ?? current.importe,
            dto.anio !== undefined ? dto.anio : current.anio,
            dto.activo !== undefined ? dto.activo : current.activo,
            auditoria
        );

        return this.repository.update(updated);
    }
}

export class EliminarPrecioUseCase {
    constructor(private readonly repository: PrecioRepository) { }

    async execute(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}
