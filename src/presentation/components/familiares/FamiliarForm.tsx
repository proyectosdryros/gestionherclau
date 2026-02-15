'use client';

import React from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FamiliarCreateSchema, type FamiliarCreateDTO } from '@/lib/validations/hermano.schemas';
import { Button } from '@/presentation/components/ui/Button';

interface FamiliarFormProps {
    hermanoId: string;
    onSuccess: (data: FamiliarCreateDTO) => Promise<void>;
    onCancel: () => void;
}

export function FamiliarForm({ hermanoId, onSuccess, onCancel }: FamiliarFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FamiliarCreateDTO>({
        resolver: zodResolver(FamiliarCreateSchema),
        defaultValues: {
            hermanoId,
            nombre: '',
            apellido1: '',
            apellido2: '',
            tipo: 'OTRO',
            fechaNacimiento: undefined, // Use undefined for optional date fields
            observaciones: '',
        },
    });

    return (
        <form onSubmit={handleSubmit(onSuccess)} className="space-y-4">
            <input type="hidden" {...register('hermanoId')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-2">
                    <label htmlFor="nombre" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Nombre
                    </label>
                    <input
                        id="nombre"
                        {...register('nombre')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Nombre del familiar"
                    />
                    {errors.nombre && (
                        <p className="text-sm font-medium text-destructive">{errors.nombre.message}</p>
                    )}
                </div>

                {/* Apellidos */}
                <div className="space-y-2">
                    <label htmlFor="apellido1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Primer Apellido
                    </label>
                    <input
                        id="apellido1"
                        {...register('apellido1')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Primer apellido"
                    />
                    {errors.apellido1 && (
                        <p className="text-sm font-medium text-destructive">{errors.apellido1.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="apellido2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Segundo Apellido
                    </label>
                    <input
                        id="apellido2"
                        {...register('apellido2')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Segundo apellido (opcional)"
                    />
                    {errors.apellido2 && (
                        <p className="text-sm font-medium text-destructive">{errors.apellido2.message}</p>
                    )}
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                    <label htmlFor="tipo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Parentesco
                    </label>
                    <select
                        id="tipo"
                        {...register('tipo')}
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                    >
                        <option value="CONYUGE">Cónyuge</option>
                        <option value="HIJO">Hijo/a</option>
                        <option value="PADRE">Padre</option>
                        <option value="MADRE">Madre</option>
                        <option value="HERMANO">Hermano/a</option>
                        <option value="OTRO">Otro</option>
                    </select>
                    {errors.tipo && (
                        <p className="text-sm font-medium text-destructive">{errors.tipo.message}</p>
                    )}
                </div>

                {/* Fecha Nacimiento */}
                <div className="space-y-2">
                    <label htmlFor="fechaNacimiento" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Fecha de Nacimiento
                    </label>
                    <input
                        id="fechaNacimiento"
                        type="date"
                        {...register('fechaNacimiento', {
                            valueAsDate: true,
                        })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors.fechaNacimiento && (
                        <p className="text-sm font-medium text-destructive">{errors.fechaNacimiento.message}</p>
                    )}
                </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
                <label htmlFor="observaciones" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Observaciones
                </label>
                <textarea
                    id="observaciones"
                    {...register('observaciones')}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Notas adicionales..."
                />
                {errors.observaciones && (
                    <p className="text-sm font-medium text-destructive">{errors.observaciones.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Familiar'}
                </Button>
            </div>
        </form>
    );
}
