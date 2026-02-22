/**
 * Hermano Form Component
 * Formulario de creación/edición con React Hook Form + Zod
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HermanoCreateSchema, type HermanoCreateDTO } from '@/lib/validations/hermano.schemas';
import { InsForgeHermanoRepository } from '@/infrastructure/repositories/insforge/InsForgeHermanoRepository';
import { RegistrarHermanoUseCase } from '@/core/use-cases/secretaria/RegistrarHermanoUseCase';
import { ActualizarHermanoUseCase } from '@/core/use-cases/secretaria/ActualizarHermanoUseCase';
import type { Hermano } from '@/core/domain/entities/Hermano';
import { useState } from 'react';

const repository = new InsForgeHermanoRepository();
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
                apodo: (hermano as any).apodo ?? null,
                apellido1: hermano.apellido1,
                apellido2: hermano.apellido2 ?? null,
                dni: hermano.dni?.getValue() ?? null,
                email: hermano.email?.getValue() ?? null,
                telefono: hermano.telefono ?? undefined,
                fechaNacimiento: hermano.fechaNacimiento ?? null,
                fechaAlta: hermano.fechaAlta,
                estado: hermano.estado,
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error general */}
            {submitError && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded-lg text-sm">
                    <p className="font-semibold">Error al guardar: {submitError}</p>
                </div>
            )}

            {/* Datos Principales y contacto combinados en grid de 3 */}
            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                    {/* Nombre */}
                    <div>
                        <label htmlFor="nombre" className="block text-xs font-medium mb-1 text-muted-foreground">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('nombre')}
                            id="nombre"
                            type="text"
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                            placeholder="Juan"
                        />
                        {errors.nombre && (
                            <p className="text-[10px] text-red-500 mt-0.5">{errors.nombre.message}</p>
                        )}
                    </div>

                    {/* Apodo */}
                    <div>
                        <label htmlFor="apodo" className="block text-xs font-medium mb-1 text-muted-foreground">
                            Apodo / Nombre Costalero
                        </label>
                        <input
                            {...register('apodo')}
                            id="apodo"
                            type="text"
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                            placeholder="Juanito"
                        />
                        {errors.apodo && (
                            <p className="text-[10px] text-red-500 mt-0.5">{errors.apodo.message}</p>
                        )}
                    </div>

                    {/* Apellido 1 */}
                    <div>
                        <label htmlFor="apellido1" className="block text-xs font-medium mb-1 text-muted-foreground">
                            Primer Apellido <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('apellido1')}
                            id="apellido1"
                            type="text"
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                            placeholder="García"
                        />
                        {errors.apellido1 && (
                            <p className="text-[10px] text-red-500 mt-0.5">{errors.apellido1.message}</p>
                        )}
                    </div>

                    {/* Apellido 2 */}
                    <div>
                        <label htmlFor="apellido2" className="block text-xs font-medium mb-1 text-muted-foreground">
                            Segundo Apellido
                        </label>
                        <input
                            {...register('apellido2')}
                            id="apellido2"
                            type="text"
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                            placeholder="López"
                        />
                        {errors.apellido2 && (
                            <p className="text-[10px] text-red-500 mt-0.5">{errors.apellido2.message}</p>
                        )}
                    </div>

                    {/* DNI */}
                    <div>
                        <label htmlFor="dni" className="block text-xs font-medium mb-1 text-muted-foreground">
                            DNI
                        </label>
                        <input
                            {...register('dni')}
                            id="dni"
                            type="text"
                            disabled={isEditing}
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm disabled:opacity-50"
                            placeholder="12345678A"
                        />
                        {errors.dni && <p className="text-[10px] text-red-500 mt-0.5">{errors.dni.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium mb-1 text-muted-foreground">
                            Email
                        </label>
                        <input
                            {...register('email')}
                            id="email"
                            type="email"
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                            placeholder="juan@example.com"
                        />
                        {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email.message}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label htmlFor="telefono" className="block text-xs font-medium mb-1 text-muted-foreground">
                            Teléfono
                        </label>
                        <input
                            {...register('telefono')}
                            id="telefono"
                            type="tel"
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                            placeholder="600000000"
                        />
                        {errors.telefono && (
                            <p className="text-[10px] text-red-500 mt-0.5">{errors.telefono.message}</p>
                        )}
                    </div>

                    {/* Fecha Nacimiento */}
                    <div>
                        <label htmlFor="fechaNacimiento" className="block text-xs font-medium mb-1 text-muted-foreground">
                            Fecha de Nacimiento
                        </label>
                        <input
                            {...register('fechaNacimiento', {
                                setValueAs: (v) => (v ? new Date(v) : null),
                            })}
                            id="fechaNacimiento"
                            type="date"
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                        />
                        {errors.fechaNacimiento && (
                            <p className="text-[10px] text-red-500 mt-0.5">{errors.fechaNacimiento.message}</p>
                        )}
                    </div>

                    {/* Fecha Alta */}
                    <div>
                        <label htmlFor="fechaAlta" className="block text-xs font-medium mb-1 text-muted-foreground">
                            Fecha de Alta <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('fechaAlta', {
                                valueAsDate: true,
                            })}
                            id="fechaAlta"
                            type="date"
                            className="w-full px-2 py-1.5 border rounded-md bg-background text-sm"
                        />
                        {errors.fechaAlta && (
                            <p className="text-[10px] text-red-500 mt-0.5">{errors.fechaAlta.message}</p>
                        )}
                    </div>

                    {/* Estado - Solo visible en edición */}
                    {isEditing && (
                        <div>
                            <label htmlFor="estado" className="block text-xs font-medium mb-1 text-muted-foreground">
                                Estado del Hermano <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('estado')}
                                id="estado"
                                className="w-full px-2 py-1.5 border rounded-md bg-background text-sm font-bold"
                            >
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="BAJA_TEMPORAL">BAJA TEMPORAL</option>
                                <option value="BAJA_VOLUNTARIA">BAJA VOLUNTARIA</option>
                                <option value="FALLECIDO">FALLECIDO</option>
                            </select>
                            {errors.estado && (
                                <p className="text-[10px] text-red-500 mt-0.5">{errors.estado.message}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Consentimientos RGPD mas compactos */}
            <div className="pt-2 border-t">
                {errors.consentimientos && (
                    <p className="text-[10px] text-red-500 mb-2">Debe aceptar los términos obligatorios</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <input {...register('consentimientos.datos')} id="cDatos" type="checkbox" className="h-3 w-3" />
                            <label htmlFor="cDatos" className="text-[11px] leading-tight">
                                Datos Personales <span className="text-red-500">*</span>
                            </label>
                        </div>
                        {errors.consentimientos?.datos && (
                            <p className="text-[10px] text-red-500">{errors.consentimientos.datos.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <input {...register('consentimientos.imagenes')} id="cImg" type="checkbox" className="h-3 w-3" />
                            <label htmlFor="cImg" className="text-[11px] leading-tight">Uso de Imágenes</label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <input {...register('consentimientos.comunicaciones')} id="cCom" type="checkbox" className="h-3 w-3" />
                            <label htmlFor="cCom" className="text-[11px] leading-tight">Comunicaciones</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 justify-end pt-3 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs border rounded hover:bg-muted transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                    {isSubmitting ? '...' : isEditing ? 'Guardar' : 'Crear'}
                </button>
            </div>
        </form>

    );
}
