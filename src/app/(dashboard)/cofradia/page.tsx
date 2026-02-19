
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Users, UserCheck, Settings, Wand2, ArrowRightLeft, Plus, Tag, ShoppingCart } from 'lucide-react';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function CofradiaPage() {
    const router = useRouter();
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
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="h-12 px-8 gap-2 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                        onClick={() => router.push('/cofradia/papeletas')}
                    >
                        <Ticket className="w-4 h-4" /> Gestión de Papeletas
                    </Button>
                    <Button
                        variant="outline"
                        className="h-12 px-6 gap-2 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" /> Solicitud Manual
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-12 px-6 gap-2 rounded-2xl font-bold text-slate-400 hover:text-primary transition-all"
                    >
                        <Settings className="w-4 h-4" /> Ajustes
                    </Button>
                    <Button
                        className="h-12 px-8 gap-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-2xl font-black uppercase text-xs tracking-widest border border-primary/20 transition-all ml-auto"
                    >
                        <Wand2 className="w-4 h-4" /> Auto-Asignación
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card
                    className="cursor-pointer hover:border-primary/50 transition-colors group"
                    onClick={() => router.push('/cofradia/listado?estado=SOLICITADA')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solicitudes en Espera</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{papeletas.filter(p => p.estado === 'SOLICITADA').length}</div>
                        <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">Ver lista de espera →</p>
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer hover:border-green-500/50 transition-colors group"
                    onClick={() => router.push('/cofradia/listado?estado=ASIGNADA')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Puestos Asignados</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {papeletas.filter(p => p.estado === 'ASIGNADA' || p.estado === 'EMITIDA').length}
                        </div>
                        <p className="text-xs text-muted-foreground group-hover:text-green-500/70 transition-colors">Ver asignaciones →</p>
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer hover:border-amber-500/50 transition-colors group"
                    onClick={() => router.push('/cofradia/listado?manual=true')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ajustes Manuales</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">
                            {papeletas.filter(p => p.esAsignacionManual).length}
                        </div>
                        <p className="text-xs text-muted-foreground group-hover:text-amber-500/70 transition-colors">Revisar cambios manuales →</p>
                    </CardContent>
                </Card>
            </div>

            {/* Nueva Sección de Seguimiento Directo */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Solicitudes Pendientes (Lista de Espera)</h2>
                    <Button variant="link" onClick={() => router.push('/cofradia/listado?estado=SOLICITADA')} className="text-primary font-bold">
                        Gestionar todas
                    </Button>
                </div>

                <Card className="border-slate-800">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b">
                                        <th className="text-left p-4 font-bold">Hermano</th>
                                        <th className="text-left p-4 font-bold">Nº</th>
                                        <th className="text-left p-4 font-bold">Observaciones</th>
                                        <th className="text-right p-4 font-bold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {papeletas.filter(p => p.estado === 'SOLICITADA').length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                No hay solicitudes en espera para este año.
                                            </td>
                                        </tr>
                                    ) : (
                                        papeletas.filter(p => p.estado === 'SOLICITADA').slice(0, 5).map((p) => {
                                            const h = hermanos.find(herm => herm.id === p.hermanoId);
                                            return (
                                                <tr key={p.id} className="border-b hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-medium">{h ? `${h.nombre} ${h.apellido1}` : 'Cargando...'}</td>
                                                    <td className="p-4 font-mono text-xs">{h?.numeroHermano || '-'}</td>
                                                    <td className="p-4 text-slate-500 truncate max-w-[200px]">{p.observaciones || 'Sin notas'}</td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-primary hover:text-primary/80 font-bold"
                                                            onClick={() => router.push('/cofradia/listado')}
                                                        >
                                                            Asignar
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
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
