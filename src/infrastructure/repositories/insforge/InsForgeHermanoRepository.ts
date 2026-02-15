
import { HermanoRepository } from '@/core/ports/repositories/HermanoRepository';
import { Hermano, EstadoHermano, TipoVia, Provincia } from '@/core/domain/entities/Hermano';
import { DNI } from '@/core/domain/value-objects/DNI';
import { Email } from '@/core/domain/value-objects/Email';
import { insforge } from '@/lib/insforge';

export class InsForgeHermanoRepository implements HermanoRepository {
    async findById(id: string): Promise<Hermano | null> {
        const { data, error } = await insforge
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

    async findByDni(dni: DNI): Promise<Hermano | null> {
        const { data, error } = await insforge
            .from('hermanos')
            .select('*')
            .eq('dni', dni.toString())
            .single();

        if (error) {
            // PostgREST returns error on no rows, check logic if needed
            return null;
        }

        return data ? this.mapToDomain(data) : null;
    }

    async findByNumero(numero: number): Promise<Hermano | null> {
        const { data, error } = await insforge
            .from('hermanos')
            .select('*')
            .eq('numero_hermano', numero)
            .single();

        if (error) return null;
        return data ? this.mapToDomain(data) : null;
    }

    async findAll(filters?: { estado?: string; cuotasAlDia?: boolean; search?: string }): Promise<Hermano[]> {
        let query = insforge.from('hermanos').select('*');

        if (filters?.estado) {
            query = query.eq('estado', filters.estado);
        }

        if (filters?.cuotasAlDia !== undefined) {
            query = query.eq('cuotas_al_dia', filters.cuotasAlDia);
        }

        if (filters?.search) {
            query = query.or(`nombre.ilike.%${filters.search}%,apellido1.ilike.%${filters.search}%,dni.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching hermanos:', error);
            return [];
        }

        return data.map(this.mapToDomain);
    }

    async findElegibles(): Promise<Hermano[]> {
        const { data, error } = await insforge
            .from('hermanos')
            .select('*')
            .eq('estado', 'ACTIVO')
            .eq('cuotas_al_dia', true);

        if (error) return [];
        return data.map(this.mapToDomain);
    }

    async create(hermano: Hermano): Promise<Hermano> {
        const persistenceData = this.mapToPersistence(hermano);
        const { data, error } = await insforge
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
        const { data, error } = await insforge
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

    async delete(id: string): Promise<void> {
        // Soft delete logic to set state to BAJA_VOLUNTARIA or similar, 
        // or hard delete depending on requirement. Repository says soft delete.
        const { error } = await insforge
            .from('hermanos')
            .update({ estado: 'BAJA_VOLUNTARIA' })
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting hermano: ${error.message}`);
        }
    }

    async getNextNumeroHermano(): Promise<number> {
        // This logic needs to be robust, possibly a stored procedure or separate table to track sequences
        // For now using simple max + 1
        const { data, error } = await insforge
            .from('hermanos')
            .select('numero_hermano')
            .order('numero_hermano', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return 1;
        return (data.numero_hermano || 0) + 1;
    }

    async count(filters?: { estado?: string }): Promise<number> {
        let query = insforge.from('hermanos').select('*', { count: 'exact', head: true });

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
            data.numero_hermano,
            data.nombre,
            data.apellido1,
            data.apellido2,
            new DNI(data.dni),
            data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : undefined,
            data.direccion ? {
                tipoVia: data.direccion.tipoVia as TipoVia,
                nombreVia: data.direccion.nombreVia,
                numero: data.direccion.numero,
                piso: data.direccion.piso,
                puerta: data.direccion.puerta,
                codigoPostal: data.direccion.codigoPostal,
                municipio: data.direccion.municipio,
                provincia: data.direccion.provincia as Provincia
            } : undefined,
            data.telefono,
            data.email ? new Email(data.email) : undefined,
            new Date(data.fecha_alta),
            data.estado as EstadoHermano,
            data.cuenta_bancaria,
            data.cuotas_al_dia,
            data.consentimientos || {
                datos: false,
                imagenes: false,
                comunicaciones: false
            },
            data.forma_pago,
            {
                created_at: new Date(data.created_at),
                updated_at: new Date(data.updated_at),
                version: data.version
            }
        );
    }

    private mapToPersistence(hermano: Hermano): any {
        return {
            id: hermano.id,
            numero_hermano: hermano.numeroHermano,
            nombre: hermano.getNombre(),
            apellido1: hermano.getApellido1(),
            apellido2: hermano.getApellido2(),
            dni: hermano.dni.toString(),
            fecha_nacimiento: hermano.fechaNacimiento?.toISOString(),
            direccion: hermano.direccion, // Assuming JSONB or similar structure in DB
            telefono: hermano.telefono,
            email: hermano.email?.toString(),
            fecha_alta: hermano.fechaAlta.toISOString(),
            estado: hermano.estado,
            cuenta_bancaria: hermano.cuentaBancaria,
            cuotas_al_dia: hermano.cuotasAlDia,
            consentimientos: hermano.consentimientos,
            forma_pago: hermano.formaPago,
            version: hermano.auditoria.version,
            // created_at/updated_at handled by DB defaults/triggers usually, or pass them if needed
        };
    }
}
