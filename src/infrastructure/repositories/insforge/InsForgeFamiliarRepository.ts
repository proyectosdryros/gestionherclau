
import { FamiliarRepository } from '@/core/ports/repositories/FamiliarRepository';
import { Familiar } from '@/core/domain/entities/Familiar';
import { insforge } from '@/lib/insforge';

export class InsForgeFamiliarRepository implements FamiliarRepository {
    async findById(id: string): Promise<Familiar | null> {
        const { data, error } = await insforge.database
            .from('familiares')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapToDomain(data) : null;
    }

    async findByHermanoId(hermanoId: string): Promise<Familiar[]> {
        const { data, error } = await insforge.database
            .from('familiares')
            .select('*')
            .eq('hermanoId', hermanoId);

        if (error) return [];
        return data.map((d: any) => this.mapToDomain(d));
    }

    async create(familiar: Familiar): Promise<Familiar> {
        const persistenceData = this.mapToPersistence(familiar);
        const { data, error } = await insforge.database
            .from('familiares')
            .insert([persistenceData])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToDomain(data);
    }

    async update(familiar: Familiar): Promise<Familiar> {
        const persistenceData = this.mapToPersistence(familiar);
        const { data, error } = await insforge.database
            .from('familiares')
            .update(persistenceData)
            .eq('id', familiar.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToDomain(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await insforge.database
            .from('familiares')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    private mapToDomain(data: any): Familiar {
        return new Familiar(
            data.id,
            data.hermanoId,
            data.nombre,
            data.apellido1,
            data.apellido2,
            data.tipo,
            data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
            data.observaciones,
            data.auditoria
        );
    }

    private mapToPersistence(familiar: Familiar): any {
        return {
            id: familiar.id,
            hermanoId: familiar.hermanoId,
            nombre: familiar.nombre,
            apellido1: familiar.apellido1,
            apellido2: familiar.apellido2,
            tipo: familiar.tipo,
            fechaNacimiento: familiar.fechaNacimiento?.toISOString() || null,
            observaciones: familiar.observaciones,
            auditoria: familiar.auditoria
        };
    }
}
