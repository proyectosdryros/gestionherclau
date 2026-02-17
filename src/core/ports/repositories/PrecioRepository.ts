
import { ConfiguracionPrecio } from '@/core/domain/entities/ConfiguracionPrecio';

export interface PrecioRepository {
    findById(id: string): Promise<ConfiguracionPrecio | null>;
    findAll(filters?: { activo?: boolean; tipo?: string; anio?: number }): Promise<ConfiguracionPrecio[]>;
    create(precio: ConfiguracionPrecio): Promise<ConfiguracionPrecio>;
    update(precio: ConfiguracionPrecio): Promise<ConfiguracionPrecio>;
    delete(id: string): Promise<void>;
}
