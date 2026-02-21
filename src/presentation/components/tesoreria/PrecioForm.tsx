
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/presentation/components/ui/Button';
import { ConfiguracionPrecio } from '@/core/domain/entities/ConfiguracionPrecio';
import { PrecioDTO } from '@/core/use-cases/tesoreria/PreciosUseCases';

const precioSchema = z.object({
    tipo: z.string().min(1, 'El tipo es obligatorio'),
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    importe: z.coerce.number().min(0, 'El importe debe ser positivo'),
    anio: z.coerce.number().optional().nullable(),
    activo: z.boolean().default(true),
});

type PrecioFormData = z.infer<typeof precioSchema>;

interface PrecioFormProps {
    precio?: ConfiguracionPrecio;
    onSuccess: (data: PrecioDTO) => Promise<void>;
    onCancel: () => void;
}

export function PrecioForm({ precio, onSuccess, onCancel }: PrecioFormProps) {
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<PrecioFormData>({
        resolver: zodResolver(precioSchema),
        defaultValues: {
            tipo: precio?.tipo || 'CUOTA',
            nombre: precio?.nombre || '',
            importe: precio?.importe || 0,
            anio: precio?.anio || new Date().getFullYear(),
            activo: precio?.activo ?? true,
        },
    });

    const onSubmit = async (data: PrecioFormData) => {
        try {
            setSubmitting(true);
            await onSuccess({
                ...data,
                importe: Number(data.importe),
                anio: data.anio ? Number(data.anio) : null
            });
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-2 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Tipo de Concepto</label>
                    <select
                        {...register('tipo')}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    >
                        <option value="CUOTA">Cuota de Hermano</option>
                        <option value="PAPELETA_SITIO">Papeleta Genérica</option>
                        <option value="NAZARENO">Nazareno</option>
                        <option value="VARA">Vara</option>
                        <option value="INSIGNIA">Insignia</option>
                        <option value="BOCINA">Bocina</option>
                        <option value="FAROL">Farol</option>
                        <option value="CRUZ_GUIA">Cruz de Guía</option>
                        <option value="PAPELETA_SIMBOLICA">Papeleta Simbólica</option>
                        <option value="DONATIVO">Donativo</option>
                        <option value="COSTALERO">Papeleta Costalero</option>
                        <option value="OTRO">Otro</option>
                    </select>
                    {errors.tipo && <p className="text-sm text-red-500">{errors.tipo.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Año de Vigencia</label>
                    <input
                        type="number"
                        {...register('anio')}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Nombre del Importe</label>
                <input
                    type="text"
                    {...register('nombre')}
                    placeholder="Ej: Cuota Anual, Papeleta Cirio..."
                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Importe Monetario (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('importe')}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-mono"
                    />
                    {errors.importe && <p className="text-sm text-red-500">{errors.importe.message}</p>}
                </div>

                <div className="flex items-center space-x-2 pt-8">
                    <input
                        type="checkbox"
                        {...register('activo')}
                        id="activo"
                        className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="activo" className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                        Precio Activo
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting} className="h-12 rounded-xl text-slate-500 border-slate-200">
                    Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="h-12 rounded-xl bg-slate-900 text-white font-bold px-8">
                    {submitting ? 'Guardando...' : 'Confirmar y Guardar'}
                </Button>
            </div>
        </form>
    );
}
