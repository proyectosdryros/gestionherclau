
import { InsForgePapeletaRepository } from '@/infrastructure/repositories/insforge/InsForgePapeletaRepository';
import { InsForgeReciboRepository } from '@/infrastructure/repositories/insforge/InsForgeReciboRepository';
import { InsForgePrecioRepository } from '@/infrastructure/repositories/insforge/InsForgePrecioRepository';
import { ConfiguracionPrecio } from '@/core/domain/entities/ConfiguracionPrecio';

export class VenderPapeletaUseCase {
    private papeletaRepo = new InsForgePapeletaRepository();
    private reciboRepo = new InsForgeReciboRepository();
    private precioRepo = new InsForgePrecioRepository();

    async execute(request: {
        hermanoId: string;
        precioId: string;
        anio: number;
        tramoId?: string | null;
        observaciones?: string;
    }): Promise<void> {
        // 0. Validar duplicados
        const todas = await this.papeletaRepo.findAll(request.anio);
        const existe = todas.find(p => p.hermanoId === request.hermanoId && p.anio === request.anio);
        if (existe) {
            throw new Error(`Este hermano ya tiene una papeleta registrada para el año ${request.anio}`);
        }

        // 1. Obtener precio
        const precio = await this.precioRepo.findById(request.precioId);
        if (!precio) throw new Error('El precio seleccionado no existe');

        const now = new Date();

        // 2. Crear Recibo
        await this.reciboRepo.create({
            hermanoId: request.hermanoId,
            concepto: `Papeleta de Sitio ${request.anio} - ${precio.nombre}`,
            importe: precio.importe,
            fechaEmision: now,
            fechaVencimiento: undefined,
            estado: 'PENDIENTE',
            tipo: 'PAPELETA_SITIO',
            observaciones: request.observaciones
        });

        // 3. Crear Papeleta
        await this.papeletaRepo.create({
            hermanoId: request.hermanoId,
            anio: request.anio,
            fechaSolicitud: now,
            estado: 'SOLICITADA',
            puestoSolicitadoId: request.precioId, // Guardamos el ID del precio para control de tipos
            puestoAsignadoId: null,
            esAsignacionManual: false,
            tramoId: request.tramoId || null,
            observaciones: request.observaciones || precio.nombre
        });
    }
}
