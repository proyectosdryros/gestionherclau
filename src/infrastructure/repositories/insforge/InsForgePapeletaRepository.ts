
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
        // Construimos el payload explícitamente para evitar que InsForge/PostgREST
        // rechace campos cuyo nombre no coincida con el schema cache
        const payload: Record<string, any> = {
            hermanoId: papeleta.hermanoId,
            anio: papeleta.anio,
            fechaSolicitud: papeleta.fechaSolicitud,
            estado: papeleta.estado,
            puestoSolicitadoId: papeleta.puestoSolicitadoId ?? null,
            puestoAsignadoId: papeleta.puestoAsignadoId ?? null,
            esAsignacionManual: papeleta.esAsignacionManual ?? false,
            observaciones: papeleta.observaciones ?? null,
            auditoria: {
                created_at: new Date(),
                updated_at: new Date(),
                version: 1
            }
        };

        const { error } = await insforge.database
            .from('papeletas')
            .insert(payload);

        if (error) throw new Error(error.message);
    }

    async update(papeleta: Papeleta): Promise<void> {
        const payload: Record<string, any> = {
            hermanoId: papeleta.hermanoId,
            anio: papeleta.anio,
            fechaSolicitud: papeleta.fechaSolicitud,
            estado: papeleta.estado,
            puestoSolicitadoId: papeleta.puestoSolicitadoId ?? null,
            puestoAsignadoId: papeleta.puestoAsignadoId ?? null,
            esAsignacionManual: papeleta.esAsignacionManual ?? false,
            observaciones: papeleta.observaciones ?? null,
        };

        const { error } = await insforge.database
            .from('papeletas')
            .update(payload)
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
