
import { insforge } from '@/lib/insforge';
import { Recibo, EstadoRecibo, TipoRecibo } from '@/core/domain/entities/Recibo';

export class InsForgeReciboRepository {
    private mapToEntity(data: any): Recibo {
        return new Recibo(
            data.id,
            data.hermanoId,
            data.concepto,
            Number(data.importe),
            data.estado as EstadoRecibo,
            data.tipo as TipoRecibo,
            new Date(data.fechaEmision),
            {
                created_at: new Date(data.created_at || data.updated_at),
                updated_at: new Date(data.updated_at),
                version: 1
            },
            data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined,
            data.observaciones
        );
    }

    async findAll(): Promise<Recibo[]> {
        const { data, error } = await insforge.database
            .from('recibos')
            .select('*');

        if (error) throw new Error(error.message);
        return (data || []).map(this.mapToEntity);
    }

    async create(reciboData: Omit<Recibo, 'id' | 'auditoria' | 'cobrar' | 'anular' | 'update'>): Promise<void> {
        // Prepare data for DB
        const dbData = {
            hermanoId: reciboData.hermanoId,
            concepto: reciboData.concepto,
            importe: reciboData.importe,
            estado: reciboData.estado,
            tipo: reciboData.tipo,
            fechaEmision: reciboData.fechaEmision,
            fechaVencimiento: reciboData.fechaVencimiento,
            observaciones: reciboData.observaciones,
            auditoria: {
                created_at: new Date(),
                updated_at: new Date(),
                version: 1
            }
        };

        const { error } = await insforge.database
            .from('recibos')
            .insert(dbData);

        if (error) throw new Error(error.message);
    }

    async update(recibo: Recibo): Promise<void> {
        const dbData = {
            concepto: recibo.concepto,
            importe: recibo.importe,
            estado: recibo.estado,
            tipo: recibo.tipo,
            fechaEmision: recibo.fechaEmision,
            fechaVencimiento: recibo.fechaVencimiento,
            observaciones: recibo.observaciones,
            updated_at: new Date()
        };

        const { error } = await insforge.database
            .from('recibos')
            .update(dbData)
            .eq('id', recibo.id);

        if (error) throw new Error(error.message);
    }

    async delete(id: string): Promise<void> {
        const { error } = await insforge.database
            .from('recibos')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }
}
