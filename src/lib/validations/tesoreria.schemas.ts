/**
 * Zod Schemas - Tesorería
 */

import { z } from 'zod';
import { AuditoriaSchema } from './hermano.schemas';

/**
 * Estado Recibo Schema
 */
export const EstadoReciboSchema = z.enum([
    'PENDIENTE',
    'COBRADO',
    'ANULADO',
    'DEVUELTO',
]);

/**
 * Tipo Recibo Schema
 */
export const TipoReciboSchema = z.enum([
    'CUOTA_ORDINARIA',
    'CUOTA_EXTRAORDINARIA',
    'PAPELETA_SITIO',
    'DONATIVO',
    'VENTA_ENSERES',
    'OTRO',
]);

/**
 * Método Pago Schema
 */
export const MetodoPagoSchema = z.enum([
    'EFECTIVO',
    'CARGO_BANCARIO',
    'TRANSFERENCIA',
    'TARJETA_PRESENCIAL',
    'ONLINE_STRIPE',
]);

/**
 * Recibo Schema
 */
export const ReciboSchema = z.object({
    id: z.string().uuid(),
    hermanoId: z.string().uuid(),
    concepto: z.string().min(5).max(100),
    importe: z.number().positive(),
    estado: EstadoReciboSchema,
    tipo: TipoReciboSchema,
    fechaEmision: z.date(),
    fechaVencimiento: z.date().optional(),
    observaciones: z.string().max(500).optional().nullable(),
    auditoria: AuditoriaSchema,
});

/**
 * Pago Schema
 */
export const PagoSchema = z.object({
    id: z.string().uuid(),
    reciboId: z.string().uuid(),
    importe: z.number().positive(),
    fechaPago: z.date(),
    metodoPago: MetodoPagoSchema,
    referenciaExterna: z.string().optional().nullable(), // Para ID de Stripe o Ref. Bancaria
    observaciones: z.string().max(500).optional().nullable(),
    auditoria: AuditoriaSchema,
});

/**
 * DTOs
 */
export type ReciboDTO = z.infer<typeof ReciboSchema>;
export type ReciboCreateDTO = Omit<ReciboDTO, 'id' | 'auditoria'>;
export type PagoDTO = z.infer<typeof PagoSchema>;
export type PagoCreateDTO = Omit<PagoDTO, 'id' | 'auditoria'>;
