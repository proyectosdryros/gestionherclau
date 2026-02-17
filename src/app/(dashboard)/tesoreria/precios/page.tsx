
'use client';

import { useState, useEffect, useCallback } from 'react';
import { InsForgePrecioRepository } from '@/infrastructure/repositories/insforge/InsForgePrecioRepository';
import { ObtenerPreciosUseCase, CrearPrecioUseCase, ActualizarPrecioUseCase, EliminarPrecioUseCase, PrecioDTO } from '@/core/use-cases/tesoreria/PreciosUseCases';
import { ConfiguracionPrecio } from '@/core/domain/entities/ConfiguracionPrecio';
import { Button } from '@/presentation/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { PrecioForm } from '@/presentation/components/tesoreria/PrecioForm';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming this utility exists

// Instancias (idealmente inyectadas)
const repository = new InsForgePrecioRepository();
const obtenerUseCase = new ObtenerPreciosUseCase(repository);
const crearUseCase = new CrearPrecioUseCase(repository);
const actualizarUseCase = new ActualizarPrecioUseCase(repository);
const eliminarUseCase = new EliminarPrecioUseCase(repository);

export default function GestionPreciosPage() {
    const [precios, setPrecios] = useState<ConfiguracionPrecio[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrecio, setEditingPrecio] = useState<ConfiguracionPrecio | undefined>(undefined);

    const loadPrecios = useCallback(async () => {
        try {
            setLoading(true);
            const data = await obtenerUseCase.execute();
            setPrecios(data);
        } catch (error) {
            console.error('Error cargando precios:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPrecios();
    }, [loadPrecios]);

    const handleCreate = async (data: PrecioDTO) => {
        await crearUseCase.execute(data);
        setIsModalOpen(false);
        loadPrecios();
    };

    const handleUpdate = async (data: PrecioDTO) => {
        if (!editingPrecio) return;
        await actualizarUseCase.execute(editingPrecio.id, data);
        setIsModalOpen(false);
        setEditingPrecio(undefined);
        loadPrecios();
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este precio?')) {
            await eliminarUseCase.execute(id);
            loadPrecios();
        }
    };

    const openCreateModal = () => {
        setEditingPrecio(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (precio: ConfiguracionPrecio) => {
        setEditingPrecio(precio);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Precios</h1>
                    <p className="text-muted-foreground">Configura cuotas, papeletas y otros conceptos de cobro.</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Nuevo Precio
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Precios</CardTitle>
                    <CardDescription>Precios activos e históricos del sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">Cargando...</div>
                    ) : precios.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">No hay precios configurados.</div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Año</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Importe</th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Estado</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {precios.map((precio) => (
                                        <tr key={precio.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex items-center gap-2">
                                                    <TagIcon className="h-4 w-4 text-gray-500" />
                                                    {precio.tipo}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">{precio.nombre}</td>
                                            <td className="p-4 align-middle">{precio.anio || '-'}</td>
                                            <td className="p-4 align-middle text-right font-bold">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precio.importe)}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${precio.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {precio.activo ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditModal(precio)}>
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(precio.id)} className="text-red-500 hover:text-red-700">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPrecio ? 'Editar Precio' : 'Nuevo Precio'}
            >
                <PrecioForm
                    precio={editingPrecio}
                    onSuccess={editingPrecio ? handleUpdate : handleCreate}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
