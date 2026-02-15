
'use client';

import React from 'react';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2, User } from 'lucide-react';
import { Familiar } from '@/core/domain/entities/Familiar';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/Card';
import { FamiliarForm } from './FamiliarForm';
import { FamiliarCreateDTO } from '@/lib/validations/hermano.schemas';

interface FamiliaresListProps {
    hermanoId: string;
    familiares: Familiar[];
    onCreate: (data: FamiliarCreateDTO) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function FamiliaresList({
    hermanoId,
    familiares,
    onCreate,
    onDelete,
}: FamiliaresListProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = async (data: FamiliarCreateDTO) => {
        await onCreate(data);
        setIsCreateModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este familiar? Esta acción no se puede deshacer.')) {
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
                <h3 className="text-lg font-medium">Familiares</h3>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Añadir Familiar
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {familiares.map((familiar) => (
                    <Card key={familiar.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {familiar.tipo}
                            </CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {familiar.nombre} {familiar.apellido1}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {familiar.apellido2}
                            </p>
                            {familiar.fechaNacimiento && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Nacimiento: {format(familiar.fechaNacimiento, 'dd/MM/yyyy', { locale: es })}
                                </div>
                            )}
                            {familiar.observaciones && (
                                <div className="mt-2 text-xs text-muted-foreground italic">
                                    "{familiar.observaciones}"
                                </div>
                            )}
                            <div className="mt-4 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => handleDelete(familiar.id)}
                                    disabled={deletingId === familiar.id}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {deletingId === familiar.id ? 'Eliminando...' : 'Eliminar'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {familiares.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                        No hay familiares registrados
                    </div>
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Registrar Nuevo Familiar"
            >
                <FamiliarForm
                    hermanoId={hermanoId}
                    onSuccess={handleCreate}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
