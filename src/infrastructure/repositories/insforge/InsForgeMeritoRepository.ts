
import { MeritoRepository } from '@/core/ports/repositories/MeritoRepository';
import { Merito } from '@/core/domain/entities/Merito';
import { insforge } from '@/lib/insforge';

export class InsForgeMeritoRepository implements MeritoRepository {
    async findById(id: string): Promise<Merito | null> {
        const { data, error } = await insforge.database
            .from('meritos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? this.mapToDomain(data) : null;
    }

    async findByHermanoId(hermanoId: string): Promise<Merito[]> {
        const { data, error } = await insforge.database
            .from('meritos')
            .select('*')
            .eq('hermanoId', hermanoId);

        if (error) return [];
        return data.map((d: any) => this.mapToDomain(d));
    }

    async getTotalPuntosByHermanoId(hermanoId: string): Promise<number> {
        const { data, error } = await insforge.database
            .from('meritos')
            .select('puntos')
            .eq('hermanoId', hermanoId);

        if (error || !data) return 0;
        return data.reduce((acc: number, curr: any) => acc + (curr.puntos || 0), 0);
    }

    async create(merito: Merito): Promise<Merito> {
        const persistenceData = this.mapToPersistence(merito);
        const { data, error } = await insforge.database
            .from('meritos')
            .insert([persistenceData])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToDomain(data);
    }

    async update(merito: Merito): Promise<Merito> {
        const persistenceData = this.mapToPersistence(merito);
        const { data, error } = await insforge.database
            .from('meritos')
            .update(persistenceData)
            .eq('id', merito.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToDomain(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await insforge.database
            .from('meritos')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    private mapToDomain(data: any): Merito {
        return new Merito(
            data.id,
            data.hermanoId,
            data.tipo,
            data.descripcion,
            data.puntos,
            new Date(data.fecha),
            data.observaciones,
            data.auditoria
        );
    }

    private mapToPersistence(merito: Merito): any {
        return {
            id: merito.id,
            hermanoId: merito.hermanoId,
            tipo: merito.tipo,
            descripcion: merito.descripcion,
            puntos: merito.puntos,
            fecha: merito.fecha.toISOString(),
            observaciones: merito.observaciones,
            auditoria: merito.auditoria
        };
    }
}
