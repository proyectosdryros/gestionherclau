/**
 * Hermano Form Component
 * Formulario de creación/edición con React Hook Form + Zod
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HermanoCreateSchema, type HermanoCreateDTO } from '@/lib/validations/hermano.schemas';
import { DexieHermanoRepository } from '@/infrastructure/repositories/indexeddb/DexieHermanoRepository';
import { RegistrarHermanoUseCase } from '@/core/use-cases/secretaria/RegistrarHermanoUseCase';
import { ActualizarHermanoUseCase } from '@/core/use-cases/secretaria/ActualizarHermanoUseCase';
import type { Hermano } from '@/core/domain/entities/Hermano';
import { useState } from 'react';

const repository = new DexieHermanoRepository();
const registrarUseCase = new RegistrarHermanoUseCase(repository);
const actualizarUseCase = new ActualizarHermanoUseCase(repository);

interface HermanoFormProps {
    hermano?: Hermano;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function HermanoForm({ hermano, onSuccess, onCancel }: HermanoFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isEditing = !!hermano;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<HermanoCreateDTO>({
        resolver: zodResolver(HermanoCreateSchema),
        defaultValues: hermano
            ? {
                nombre: hermano.nombre,
                apellido1: hermano.apellido1,
                apellido2: hermano.apellido2 ?? null,
                dni: hermano.dni.getValue(),
                email: hermano.email?.getValue() ?? null,
                telefono: hermano.telefono ?? undefined, // Ensure undefined if null for input
                fechaNacimiento: hermano.fechaNacimiento ?? null,
                fechaAlta: hermano.fechaAlta,
                consentimientos: {
                    datos: hermano.consentimientos.datos,
                    imagenes: hermano.consentimientos.imagenes,
                    comunicaciones: hermano.consentimientos.comunicaciones,
                },
            }
            : {
                fechaAlta: new Date(),
                consentimientos: {
                    datos: true,
                    imagenes: false,
                    comunicaciones: false,
                },
            },
    });

    const onSubmit = async (data: HermanoCreateDTO) => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);

            // Adapt DTO for use case input
            // The use case expects flat consentimientos structure, not nested
            const input = {
                ...data,
                consentimientoDatos: data.consentimientos.datos,
                consentimientoImagenes: data.consentimientos.imagenes,
                consentimientoComunicaciones: data.consentimientos.comunicaciones,
            };

            if (isEditing && hermano) {
                await actualizarUseCase.execute({
                    id: hermano.id,
                    ...data,
                    consentimientos: data.consentimientos,
                });
            } else {
                await registrarUseCase.execute(input);
            }

            onSuccess?.();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error general */}
            {submitError && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                    <p className="font-semibold">Error al guardar</p>
                    <p className="text-sm mt-1">{submitError}</p>
                </div>
            )}

            {/* Datos Personales */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Datos Personales</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('nombre')}
                            id="nombre"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            placeholder="Juan"
                        />
                        {errors.nombre && (
                            <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
                        )}
                    </div>

                    {/* Apellido 1 */}
                    <div>
                        <label htmlFor="apellido1" className="block text-sm font-medium mb-1">
                            Primer Apellido <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('apellido1')}
                            id="apellido1"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            placeholder="García"
                        />
                        {errors.apellido1 && (
                            <p className="text-sm text-red-500 mt-1">{errors.apellido1.message}</p>
                        )}
                    </div>

                    {/* Apellido 2 */}
                    <div>
                        <label htmlFor="apellido2" className="block text-sm font-medium mb-1">
                            Segundo Apellido
                        </label>
                        <input
                            {...register('apellido2')}
                            id="apellido2"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            placeholder="López"
                        />
                        {errors.apellido2 && (
                            <p className="text-sm text-red-500 mt-1">{errors.apellido2.message}</p>
                        )}
                    </div>

                    {/* DNI */}
                    <div>
                        <label htmlFor="dni" className="block text-sm font-medium mb-1">
                            DNI <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('dni')}
                            id="dni"
                            type="text"
                            disabled={isEditing}
                            className="w-full px-3 py-2 border rounded-md bg-background disabled:opacity-50"
                            placeholder="12345678A"
                        />
                        {errors.dni && <p className="text-sm text-red-500 mt-1">{errors.dni.message}</p>}
                        {isEditing && <p className="text-xs text-muted-foreground mt-1">El DNI no puede modificarse</p>}
                    </div>
                </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de Contacto</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            {...register('email')}
                            id="email"
                            type="email"
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            placeholder="juan.garcia@example.com"
                        />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium mb-1">
                            Teléfono
                        </label>
                        <input
                            {...register('telefono')}
                            id="telefono"
                            type="tel"
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            placeholder="666 123 456"
                        />
                        {errors.telefono && (
                            <p className="text-sm text-red-500 mt-1">{errors.telefono.message}</p>
                        )}
                    </div>

                    {/* Fecha Nacimiento */}
                    <div>
                        <label htmlFor="fechaNacimiento" className="block text-sm font-medium mb-1">
                            Fecha de Nacimiento
                        </label>
                        <input
                            {...register('fechaNacimiento', {
                                setValueAs: (v) => (v ? new Date(v) : null),
                            })}
                            id="fechaNacimiento"
                            type="date"
                            className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                        {errors.fechaNacimiento && (
                            <p className="text-sm text-red-500 mt-1">{errors.fechaNacimiento.message}</p>
                        )}
                    </div>

                    {/* Fecha Alta */}
                    <div>
                        <label htmlFor="fechaAlta" className="block text-sm font-medium mb-1">
                            Fecha de Alta <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('fechaAlta', {
                                valueAsDate: true,
                            })}
                            id="fechaAlta"
                            type="date"
                            className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                        {errors.fechaAlta && (
                            <p className="text-sm text-red-500 mt-1">{errors.fechaAlta.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Consentimientos RGPD */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Consentimientos RGPD</h3>

                <div className="space-y-3">
                    {/* Consentimiento Datos */}
                    <div className="flex items-start gap-2">
                        <input
                            {...register('consentimientos.datos')}
                            id="consentimientoDatos"
                            type="checkbox"
                            className="mt-1"
                        />
                        <label htmlFor="consentimientoDatos" className="text-sm">
                            <span className="font-medium">Tratamiento de datos personales</span>{' '}
                            <span className="text-red-500">*</span>
                            <br />
                            <span className="text-muted-foreground">
                                Acepto el tratamiento de mis datos personales según la política de privacidad
                            </span>
                        </label>
                    </div>
                    {errors.consentimientos?.datos && (
                        <p className="text-sm text-red-500">{errors.consentimientos.datos.message}</p>
                    )}

                    {/* Consentimiento Imágenes */}
                    <div className="flex items-start gap-2">
                        <input
                            {...register('consentimientos.imagenes')}
                            id="consentimientoImagenes"
                            type="checkbox"
                            className="mt-1"
                        />
                        <label htmlFor="consentimientoImagenes" className="text-sm">
                            <span className="font-medium">Uso de imágenes</span>
                            <br />
                            <span className="text-muted-foreground">
                                Autorizo el uso de mi imagen en actividades de la hermandad
                            </span>
                        </label>
                    </div>

                    {/* Consentimiento Comunicaciones */}
                    <div className="flex items-start gap-2">
                        <input
                            {...register('consentimientos.comunicaciones')}
                            id="consentimientoComunicaciones"
                            type="checkbox"
                            className="mt-1"
                        />
                        <label htmlFor="consentimientoComunicaciones" className="text-sm">
                            <span className="font-medium">Comunicaciones</span>
                            <br />
                            <span className="text-muted-foreground">
                                Acepto recibir comunicaciones sobre eventos y actividades
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Hermano'}
                </button>
            </div>
        </form>
    );
}
