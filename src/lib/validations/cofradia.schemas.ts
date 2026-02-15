/**
 * Zod Schemas - Cofradía
 */

import { z } from 'zod';
import { AuditoriaSchema } from './hermano.schemas';

/**
 * Categoria Puesto Schema
 */
export const CategoriaPuestoSchema = z.enum([
    'CIRIO',
    'VARA',
    'INSIGNIA',
    'MANIGUETA',
    'ACOMPAÑANTE',
    'COSTALERO',
    'ACÓLITO',
    'CAPATAZ',
    'BANDA',
]);

/**
 * Estado Papeleta Schema
 */
export const EstadoPapeletaSchema = z.enum([
    'SOLICITADA',
    'REVISADA',
    'ASIGNADA',
    'EMITIDA',
    'ANULADA',
]);

/**
 * Puesto Schema
 */
export const PuestoSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(2),
    categoria: CategoriaPuestoSchema,
    capacidad: z.number().int().min(1),
    seccion: z.string().optional(), // Ej: Cristo, Virgen
    ordenInSection: z.number().int(),
});

/**
 * Papeleta Schema
 */
export const PapeletaSchema = z.object({
    id: z.string().uuid(),
    hermanoId: z.string().uuid(),
    anio: z.number().int(),
    puestoSolicitadoId: z.string().uuid().nullable(),
    puestoAsignadoId: z.string().uuid().nullable(),
    esAsignacionManual: z.boolean().default(false),
    estado: EstadoPapeletaSchema,
    fechaSolicitud: z.date(),
    auditoria: AuditoriaSchema,
    observaciones: z.string().max(500).optional().nullable(),
});

/**
 * DTOs
 */
export type PuestoDTO = z.infer<typeof PuestoSchema>;
export type PapeletaDTO = z.infer<typeof PapeletaSchema>;
export type PapeletaCreateDTO = Omit<PapeletaDTO, 'id' | 'auditoria'>;
