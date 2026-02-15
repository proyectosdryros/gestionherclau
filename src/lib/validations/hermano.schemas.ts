/**
 * Zod Schemas - Validación de datos
 * Estos schemas se usan tanto en cliente como en servidor
 */

import { z } from 'zod';

/**
 * Validación de DNI español
 */
const DNI_REGEX = /^[0-9]{8}[A-Z]$/;
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

function validateDniCheckDigit(dni: string): boolean {
    const number = parseInt(dni.substring(0, 8), 10);
    const letter = dni.charAt(8);
    const expectedLetter = DNI_LETTERS[number % 23];
    return letter === expectedLetter;
}

export const DniSchema = z
    .string()
    .regex(DNI_REGEX, 'Formato DNI inválido (8 dígitos + letra)')
    .refine(validateDniCheckDigit, 'Letra de control DNI incorrecta')
    .transform((val) => val.toUpperCase());

/**
 * Email Schema
 */
export const EmailSchema = z
    .string()
    .email('Formato de email inválido')
    .transform((val) => val.toLowerCase().trim());

/**
 * Teléfono Schema (formato español)
 */
export const TelefonoSchema = z
    .string()
    .regex(/^[679]\d{8}$/, 'Teléfono debe ser 9 dígitos empezando por 6, 7 o 9')
    .optional()
    .nullable();

/**
 * Estado Hermano Schema
 */
export const EstadoHermanoSchema = z.enum([
    'ACTIVO',
    'BAJA_TEMPORAL',
    'BAJA_VOLUNTARIA',
    'FALLECIDO',
]);

/**
 * Consentimientos RGPD Schema
 */
export const ConsentimientosRGPDSchema = z.object({
    datos: z.boolean().describe('Consentimiento tratamiento datos personales'),
    imagenes: z.boolean().describe('Consentimiento uso de imágenes'),
    comunicaciones: z.boolean().describe('Consentimiento envío comunicaciones'),
});

/**
 * Auditoría Schema
 */
export const AuditoriaSchema = z.object({
    created_at: z.date(),
    updated_at: z.date(),
    version: z.number().int().positive(),
});

/**
 * Hermano Schema (completo)
 */
export const HermanoSchema = z.object({
    id: z.string().uuid(),
    numeroHermano: z.number().int().positive(),
    nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(50),
    apellido1: z.string().min(2, 'Primer apellido debe tener al menos 2 caracteres').max(50),
    apellido2: z.string().max(50).nullable(),
    dni: DniSchema,
    email: EmailSchema.nullable(),
    telefono: TelefonoSchema,
    fechaNacimiento: z.date().max(new Date(), 'Fecha de nacimiento no puede ser futura').nullable(),
    fechaAlta: z.date(),
    estado: EstadoHermanoSchema,
    cuotasAlDia: z.boolean(),
    consentimientos: ConsentimientosRGPDSchema,
    auditoria: AuditoriaSchema,
});

/**
 * Hermano Create Schema (sin campos autogenerados)
 */
export const HermanoCreateSchema = HermanoSchema.omit({
    id: true,
    auditoria: true,
}).extend({
    numeroHermano: z.number().int().positive().optional(), // Auto-generado si no se proporciona
});

/**
 * Hermano Update Schema (campos opcionales)
 */
export const HermanoUpdateSchema = HermanoSchema.omit({
    id: true,
    numeroHermano: true,
    dni: true,
    auditoria: true,
}).partial();

/**
 * Tipo Familiar Schema
 */
export const TipoFamiliarSchema = z.enum([
    'CONYUGE',
    'HIJO',
    'PADRE',
    'MADRE',
    'HERMANO',
    'OTRO',
]);

/**
 * Familiar Schema
 */
export const FamiliarSchema = z.object({
    id: z.string().uuid(),
    hermanoId: z.string().uuid(),
    nombre: z.string().min(2).max(50),
    apellido1: z.string().min(2).max(50),
    apellido2: z.string().max(50).nullable(),
    tipo: TipoFamiliarSchema,
    fechaNacimiento: z.date().max(new Date()).nullable(),
    observaciones: z.string().max(500).nullable(),
    auditoria: AuditoriaSchema,
});

/**
 * Familiar Create Schema
 */
export const FamiliarCreateSchema = FamiliarSchema.omit({
    id: true,
    auditoria: true,
});

/**
 * Tipo Mérito Schema
 */
export const TipoMeritoSchema = z.enum([
    'CARGO_JUNTA',
    'DONATIVO_EXTRAORDINARIO',
    'VOLUNTARIADO',
    'ANTIGUEDAD_ESPECIAL',
    'OTRO',
]);

/**
 * Mérito Schema
 */
export const MeritoSchema = z.object({
    id: z.string().uuid(),
    hermanoId: z.string().uuid(),
    tipo: TipoMeritoSchema,
    descripcion: z.string().min(5, 'Descripción debe tener al menos 5 caracteres').max(200),
    puntos: z.number().int().min(0, 'Los puntos no pueden ser negativos').max(100),
    fecha: z.date(),
    observaciones: z.string().max(500).nullable(),
    auditoria: AuditoriaSchema,
});

/**
 * Mérito Create Schema
 */
export const MeritoCreateSchema = MeritoSchema.omit({
    id: true,
    auditoria: true,
});

/**
 * Tipos inferidos de TypeScript
 */
export type HermanoDTO = z.infer<typeof HermanoSchema>;
export type HermanoCreateDTO = z.infer<typeof HermanoCreateSchema>;
export type HermanoUpdateDTO = z.infer<typeof HermanoUpdateSchema>;
export type FamiliarDTO = z.infer<typeof FamiliarSchema>;
export type FamiliarCreateDTO = z.infer<typeof FamiliarCreateSchema>;
export type MeritoDTO = z.infer<typeof MeritoSchema>;
export type MeritoCreateDTO = z.infer<typeof MeritoCreateSchema>;
