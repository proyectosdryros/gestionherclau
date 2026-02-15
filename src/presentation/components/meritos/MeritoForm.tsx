'use client';

import React from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MeritoCreateSchema, type MeritoCreateDTO } from '@/lib/validations/hermano.schemas';
import { Button } from '@/presentation/components/ui/Button';

interface MeritoFormProps {
    hermanoId: string;
    onSuccess: (data: MeritoCreateDTO) => Promise<void>;
    onCancel: () => void;
}

export function MeritoForm({ hermanoId, onSuccess, onCancel }: MeritoFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<MeritoCreateDTO>({
        resolver: zodResolver(MeritoCreateSchema),
        defaultValues: {
            hermanoId,
            tipo: 'OTRO',
            puntos: 0,
            fecha: new Date(),
            descripcion: '',
            observaciones: '',
        },
    });

    return (
        <form onSubmit={handleSubmit(onSuccess)} className="space-y-4">
            <input type="hidden" {...register('hermanoId')} />
            {/* Tipo */}
            <div className="space-y-2">
                <label htmlFor="tipo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Tipo de Mérito
                </label>
                <select
                    id="tipo"
                    {...register('tipo')}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                    <option value="CARGO_JUNTA">Cargo en Junta</option>
                    <option value="DONATIVO_EXTRAORDINARIO">Donativo Extraordinario</option>
                    <option value="VOLUNTARIADO">Voluntariado</option>
                    <option value="ANTIGUEDAD_ESPECIAL">Antigüedad Especial</option>
                    <option value="OTRO">Otro</option>
                </select>
                {errors.tipo && (
                    <p className="text-sm font-medium text-destructive">{errors.tipo.message}</p>
                )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <label htmlFor="descripcion" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Descripción
                </label>
                <input
                    id="descripcion"
                    {...register('descripcion')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descripción del mérito"
                />
                {errors.descripcion && (
                    <p className="text-sm font-medium text-destructive">{errors.descripcion.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Puntos */}
                <div className="space-y-2">
                    <label htmlFor="puntos" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Puntos
                    </label>
                    <input
                        id="puntos"
                        type="number"
                        {...register('puntos', { valueAsNumber: true })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="0"
                    />
                    {errors.puntos && (
                        <p className="text-sm font-medium text-destructive">{errors.puntos.message}</p>
                    )}
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                    <label htmlFor="fecha" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Fecha
                    </label>
                    <input
                        id="fecha"
                        type="date"
                        {...register('fecha', { valueAsDate: true })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors.fecha && (
                        <p className="text-sm font-medium text-destructive">{errors.fecha.message}</p>
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
                    {isSubmitting ? 'Guardando...' : 'Guardar Mérito'}
                </Button>
            </div>
        </form>
    );
}
