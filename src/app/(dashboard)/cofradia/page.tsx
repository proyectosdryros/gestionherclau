
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Users, UserCheck, Settings, Wand2, ArrowRightLeft, Plus, Tag, ShoppingCart } from 'lucide-react';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';

export default function CofradiaPage() {
    const { papeletas, crearPapeleta } = usePapeletas();
    const { hermanos } = useHermanos();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPapeleta, setNewPapeleta] = useState({
        hermanoId: '',
        anio: new Date().getFullYear(),
        observaciones: ''
    });

    const handleCreatePapeleta = async () => {
        if (!newPapeleta.hermanoId) {
            alert('Selecciona un hermano');
            return;
        }

        try {
            await crearPapeleta({
                hermanoId: newPapeleta.hermanoId,
                anio: newPapeleta.anio,
                fechaSolicitud: new Date(),
                estado: 'SOLICITADA',
                puestoSolicitadoId: null,
                puestoAsignadoId: null,
                esAsignacionManual: false,
                observaciones: newPapeleta.observaciones
            });
            setIsCreateModalOpen(false);
            setNewPapeleta({ hermanoId: '', anio: new Date().getFullYear(), observaciones: '' });
            alert('Solicitud creada correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al crear la solicitud');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cofradía</h1>
                    <p className="text-muted-foreground">Planificación del cortejo y asignación de puestos.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => window.location.href = '/cofradia/ventas'}
                    >
                        <Tag className="w-4 h-4" /> Venta de Papeletas
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.location.href = '/cofradia/listado'}
                    >
                        <ShoppingCart className="w-4 h-4" /> Ver Listado Papeletas
                    </Button>
                    <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4" /> Nueva Solicitud Manual
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Settings className="w-4 h-4" /> Configurar Puestos
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none">
                        <Wand2 className="w-4 h-4" /> Asignación Automática
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solicitudes Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{papeletas.length}</div>
                        <p className="text-xs text-muted-foreground">Papeletas pedidas para este año</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Puestos Asignados</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {papeletas.filter(p => p.estado === 'ASIGNADA' || p.estado === 'EMITIDA').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Cortejo completado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Asignaciones Manuales</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">
                            {papeletas.filter(p => p.esAsignacionManual).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Ajustes manuales realizados</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-800">
                <CardHeader>
                    <CardTitle>Cortejo Procesional</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {['Tramo de Cristo', 'Tramo de Virgen'].map((seccion) => (
                            <div key={seccion} className="space-y-4">
                                <h3 className="text-lg font-semibold border-l-4 border-primary pl-3">{seccion}</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-shadow cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                                                    {i}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Puesto {i}</p>
                                                    <p className="text-xs text-muted-foreground">Sin asignar</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-xs">Asignar</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Nueva Papeleta de Sitio"
            >
                <div className="space-y-4 pt-4 text-black">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hermano Solicitante</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={newPapeleta.hermanoId}
                            onChange={(e) => setNewPapeleta({ ...newPapeleta, hermanoId: e.target.value })}
                        >
                            <option value="">Seleccionar Hermano...</option>
                            {hermanos.map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.numeroHermano} - {h.nombre} {h.apellido1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Año</label>
                        <Input
                            type="number"
                            value={newPapeleta.anio}
                            onChange={(e) => setNewPapeleta({ ...newPapeleta, anio: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Observaciones / Petición</label>
                        <Input
                            placeholder="Ej: Prefiero tramo de Cristo..."
                            value={newPapeleta.observaciones}
                            onChange={(e) => setNewPapeleta({ ...newPapeleta, observaciones: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreatePapeleta}>Registrar Solicitud</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
