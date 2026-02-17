
import { PrecioRepository } from '@/core/ports/repositories/PrecioRepository';
import { ConfiguracionPrecio } from '@/core/domain/entities/ConfiguracionPrecio';
import { insforge } from '@/lib/insforge';

export class InsForgePrecioRepository implements PrecioRepository {
    async findById(id: string): Promise<ConfiguracionPrecio | null> {
        const { data, error } = await insforge.database
            .from('configuracion_precios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapToDomain(data) : null;
    }

    async findAll(filters?: { activo?: boolean; tipo?: string; anio?: number }): Promise<ConfiguracionPrecio[]> {
        let query = insforge.database.from('configuracion_precios').select('*');

        if (filters?.activo !== undefined) {
            query = query.eq('activo', filters.activo);
        }
        if (filters?.tipo) {
            query = query.eq('tipo', filters.tipo);
        }
        if (filters?.anio) {
            query = query.eq('anio', filters.anio);
        }

        // Ordenar por nombre
        query = query.order('nombre', { ascending: true });

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching precios:', error);
            return [];
        }

        return data.map((d: any) => this.mapToDomain(d));
    }

    async create(precio: ConfiguracionPrecio): Promise<ConfiguracionPrecio> {
        const persistenceData = this.mapToPersistence(precio);
        const { data, error } = await insforge.database
            .from('configuracion_precios')
            .insert([persistenceData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating precio: ${error.message}`);
        }

        return this.mapToDomain(data);
    }

    async update(precio: ConfiguracionPrecio): Promise<ConfiguracionPrecio> {
        const persistenceData = this.mapToPersistence(precio);
        const { data, error } = await insforge.database
            .from('configuracion_precios')
            .update(persistenceData)
            .eq('id', precio.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating precio: ${error.message}`);
        }

        return this.mapToDomain(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await insforge.database
            .from('configuracion_precios')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting precio: ${error.message}`);
        }
    }

    private mapToDomain(data: any): ConfiguracionPrecio {
        return new ConfiguracionPrecio(
            data.id,
            data.tipo,
            data.nombre,
            data.importe,
            data.anio,
            data.activo,
            data.auditoria
        );
    }

    private mapToPersistence(precio: ConfiguracionPrecio): any {
        return {
            id: precio.id,
            tipo: precio.tipo,
            nombre: precio.nombre,
            importe: precio.importe,
            anio: precio.anio,
            activo: precio.activo,
            auditoria: precio.auditoria
        };
    }
}
