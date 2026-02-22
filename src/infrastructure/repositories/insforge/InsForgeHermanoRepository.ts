
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import { Hermano, EstadoHermano } from '@/core/domain/entities/Hermano';
import { DNI } from '@/core/domain/value-objects/DNI';
import { Email } from '@/core/domain/value-objects/Email';
import { insforge } from '@/lib/insforge';

export class InsForgeHermanoRepository implements HermanoRepository {
    async findById(id: string): Promise<Hermano | null> {
        const { data, error } = await insforge.database
            .from('hermanos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching hermano by ID:', error);
            return null;
        }

        return data ? this.mapToDomain(data) : null;
    }

    async findByUserId(userId: string): Promise<Hermano | null> {
        const { data, error } = await insforge.database
            .from('hermanos')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching hermano by User ID:', error);
            return null;
        }

        return data ? this.mapToDomain(data) : null;
    }

    async findByDni(dni: DNI): Promise<Hermano | null> {
        const { data, error } = await insforge.database
            .from('hermanos')
            .select('*')
            .eq('dni', dni.toString())
            .single();

        if (error) return null;
        return data ? this.mapToDomain(data) : null;
    }

    async findByNumero(numero: number): Promise<Hermano | null> {
        const { data, error } = await insforge.database
            .from('hermanos')
            .select('*')
            .eq('numeroHermano', numero)
            .single();

        if (error) return null;
        return data ? this.mapToDomain(data) : null;
    }

    async findAll(filters?: { estado?: string; cuotasAlDia?: boolean; search?: string }): Promise<Hermano[]> {
        let query = insforge.database.from('hermanos').select('*');

        if (filters?.estado) {
            query = query.eq('estado', filters.estado);
        }

        if (filters?.cuotasAlDia !== undefined) {
            query = query.eq('cuotasAlDia', filters.cuotasAlDia);
        }

        if (filters?.search) {
            // Using PostgREST or syntax for searching multiple fields
            query = query.or(`nombre.ilike.%${filters.search}%,apellido1.ilike.%${filters.search}%,dni.ilike.%${filters.search}%,apodo.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching hermanos:', error);
            return [];
        }

        return data.map((d: any) => this.mapToDomain(d));
    }

    async findElegibles(): Promise<Hermano[]> {
        const { data, error } = await insforge.database
            .from('hermanos')
            .select('*')
            .eq('estado', 'ACTIVO')
            .eq('cuotasAlDia', true);

        if (error) return [];
        return data.map((d: any) => this.mapToDomain(d));
    }

    async create(hermano: Hermano): Promise<Hermano> {
        const persistenceData = this.mapToPersistence(hermano);
        const { data, error } = await insforge.database
            .from('hermanos')
            .insert([persistenceData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating hermano: ${error.message}`);
        }

        return this.mapToDomain(data);
    }

    async update(hermano: Hermano): Promise<Hermano> {
        const persistenceData = this.mapToPersistence(hermano);
        const { data, error } = await insforge.database
            .from('hermanos')
            .update(persistenceData)
            .eq('id', hermano.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating hermano: ${error.message}`);
        }

        return this.mapToDomain(data);
    }

    async updateMany(hermanos: Hermano[]): Promise<void> {
        if (hermanos.length === 0) return;
        const persistenceData = hermanos.map(h => this.mapToPersistence(h));
        const { error } = await insforge.database
            .from('hermanos')
            .upsert(persistenceData);

        if (error) {
            throw new Error(`Error updating multiple hermanos: ${error.message}`);
        }
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
        const { data, error } = await insforge.database
            .from('hermanos')
            .select('numeroHermano')
            .lt('numeroHermano', 800000) // Ignorar rangos muertos
            .order('numeroHermano', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return 1;
        return (data.numeroHermano || 0) + 1;
    }

    async count(filters?: { estado?: string }): Promise<number> {
        let query = insforge.database.from('hermanos').select('*', { count: 'exact', head: true });

        if (filters?.estado) {
            query = query.eq('estado', filters.estado);
        }

        const { count, error } = await query;

        if (error) return 0;
        return count || 0;
    }

    // Mappers
    private mapToDomain(data: any): Hermano {
        return new Hermano(
            data.id,
            data.numeroHermano,
            data.nombre,
            data.apellido1,
            data.apellido2,
            data.dni ? DNI.create(data.dni) : null,
            data.email ? Email.create(data.email) : null,
            data.telefono,
            data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
            new Date(data.fechaAlta),
            data.estado as EstadoHermano,
            data.cuotasAlDia,
            data.consentimientos || {
                datos: false,
                imagenes: false,
                comunicaciones: false
            },
            {
                created_at: new Date(data.auditoria.created_at),
                updated_at: new Date(data.auditoria.updated_at),
                version: data.auditoria.version
            },
            data.apodo,
            data.direccion,
            data.user_id
        );
    }

    private mapToPersistence(hermano: Hermano): any {
        return {
            id: hermano.id,
            numeroHermano: hermano.numeroHermano,
            nombre: hermano.nombre,
            apodo: hermano.apodo,
            direccion: hermano.direccion,
            user_id: hermano.userId,
            apellido1: hermano.apellido1,
            apellido2: hermano.apellido2,
            dni: hermano.dni?.toString() ?? null,
            email: hermano.email?.toString() ?? null,
            telefono: hermano.telefono,
            fechaNacimiento: hermano.fechaNacimiento?.toISOString() ?? null,
            fechaAlta: hermano.fechaAlta.toISOString(),
            estado: hermano.estado,
            cuotasAlDia: hermano.cuotasAlDia,
            consentimientos: hermano.consentimientos,
            auditoria: {
                ...hermano.auditoria,
                created_at: hermano.auditoria.created_at.toISOString(),
                updated_at: hermano.auditoria.updated_at.toISOString()
            }
        };
    }
}
