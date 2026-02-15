'use client';

import React from 'react';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2, Award } from 'lucide-react';
import { Merito } from '@/core/domain/entities/Merito';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/Card';
import { MeritoForm } from './MeritoForm';
import { MeritoCreateDTO } from '@/lib/validations/hermano.schemas';

interface MeritosListProps {
    hermanoId: string;
    meritos: Merito[];
    onCreate: (data: MeritoCreateDTO) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function MeritosList({
    hermanoId,
    meritos,
    onCreate,
    onDelete,
}: MeritosListProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = async (data: MeritoCreateDTO) => {
        await onCreate(data);
        setIsCreateModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este mérito? Esta acción no se puede deshacer.')) {
            setDeletingId(id);
            try {
                await onDelete(id);
            } finally {
                setDeletingId(null);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Méritos y Puntos</h3>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Añadir Mérito
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meritos.map((merito) => (
                    <Card key={merito.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {merito.tipo.replace('_', ' ')}
                            </CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {merito.puntos} pts
                            </div>
                            <p className="text-sm text-foreground mt-1">
                                {merito.descripcion}
                            </p>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Fecha: {format(merito.fecha, 'dd/MM/yyyy', { locale: es })}
                            </div>
                            {merito.observaciones && (
                                <div className="mt-2 text-xs text-muted-foreground italic">
                                    "{merito.observaciones}"
                                </div>
                            )}
                            <div className="mt-4 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => handleDelete(merito.id)}
                                    disabled={deletingId === merito.id}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {deletingId === merito.id ? 'Eliminando...' : 'Eliminar'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {meritos.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                        No hay méritos registrados
                    </div>
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Registrar Nuevo Mérito"
            >
                <MeritoForm
                    hermanoId={hermanoId}
                    onSuccess={handleCreate}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
