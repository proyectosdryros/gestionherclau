/**
 * Zod Schemas - Priostía
 */

import { z } from 'zod';
import { AuditoriaSchema } from './hermano.schemas';

/**
 * Estado Enser Schema
 */
export const EstadoEnserSchema = z.enum([
    'NUEVO',
    'BUENO',
    'REGULAR',
    'MALO',
    'RESTAURACION',
    'PERDIDO',
]);

/**
 * Categoria Enser Schema
 */
export const CategoriaEnserSchema = z.enum([
    'ORFEBRERIA',
    'TEXTIL',
    'TALLA',
    'JOYERIA',
    'CERERIA',
    'HERRAMIENTA',
    'MOBILIARIO',
    'OTRO',
]);

/**
 * Enser Schema
 */
export const EnserSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(3).max(100),
    descripcion: z.string().max(500).optional().nullable(),
    categoria: CategoriaEnserSchema,
    estado: EstadoEnserSchema,
    ubicacion: z.string().min(2),
    valorEstimado: z.number().nonnegative().optional().nullable(),
    fechaAdquisicion: z.date().optional().nullable(),
    auditoria: AuditoriaSchema,
});

/**
 * Movimiento Enser Schema
 */
export const MovimientoEnserSchema = z.object({
    id: z.string().uuid(),
    enserId: z.string().uuid(),
    tipo: z.enum(['PRESTAMO', 'DEVOLUCION', 'MANTENIMIENTO', 'TRASLADO']),
    fecha: z.date(),
    responsable: z.string(),
    observaciones: z.string().optional().nullable(),
    auditoria: AuditoriaSchema,
});

/**
 * DTOs
 */
export type EnserDTO = z.infer<typeof EnserSchema>;
export type MovimientoEnserDTO = z.infer<typeof MovimientoEnserSchema>;
export type EnserCreateDTO = Omit<EnserDTO, 'id' | 'auditoria'>;
