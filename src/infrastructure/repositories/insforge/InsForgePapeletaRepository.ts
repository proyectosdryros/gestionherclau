
import { insforge } from '@/lib/insforge';
import { Papeleta } from '@/core/domain/entities/Papeleta';

export class InsForgePapeletaRepository {
    async findAll(anio?: number): Promise<Papeleta[]> {
        let query = insforge.database
            .from('papeletas') // Note: Database has papeletas_cortejo, but existing code uses papeletas. I'll stick to what the code uses if it works.
            .select('*');

        if (anio) {
            query = query.eq('anio', anio);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as Papeleta[];
    }

    async create(papeleta: Omit<Papeleta, 'id' | 'auditoria' | 'asignarManual' | 'asignarAutomatico'>): Promise<void> {
        const { error } = await insforge.database
            .from('papeletas')
            .insert({
                ...papeleta,
                auditoria: {
                    created_at: new Date(),
                    updated_at: new Date(),
                    version: 1
                }
            });

        if (error) throw new Error(error.message);
    }

    async update(papeleta: Papeleta): Promise<void> {
        const { error } = await insforge.database
            .from('papeletas')
            .update(papeleta)
            .eq('id', papeleta.id);

        if (error) throw new Error(error.message);
    }

    async delete(id: string): Promise<void> {
        console.log('[PapeletaRepository] Intentando borrar papeleta ID:', id);
        const { error } = await insforge.database
            .from('papeletas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[PapeletaRepository] Error al borrar:', error);
            throw new Error(`Error DB: ${error.message}`);
        }
        console.log('[PapeletaRepository] Borrado exitoso para ID:', id);
    }
}
