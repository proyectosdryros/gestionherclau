
'use client';

import React, { useState, useMemo } from 'react';
import { useRecibos } from '@/presentation/hooks/useRecibos';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Badge } from '@/presentation/components/ui/Badge';
import { Search, Plus, Filter, Wallet, MoreVertical, CreditCard } from 'lucide-react';
import { Modal } from '@/presentation/components/ui/Modal';
import { formatCurrency, cn } from '@/lib/utils';
import { TipoRecibo, Recibo } from '@/core/domain/entities/Recibo';
import { CuotasGrid } from '@/presentation/components/tesoreria/CuotasGrid';

export default function TesoreriaPage() {
    const { recibos, loading, error, registrarCobro, crearRecibo } = useRecibos();
    const { hermanos } = useHermanos(); // Load brothers for selection
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedReciboId, setSelectedReciboId] = useState<string | null>(null);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRecibo, setNewRecibo] = useState({
        hermanoId: '',
        concepto: '',
        importe: '',
        tipo: 'CUOTA_ORDINARIA' as TipoRecibo,
        fechaVencimiento: ''
    });

    const filteredHermanos = hermanos.filter(h =>
        `${h.nombre} ${h.apellido1}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.numeroHermano.toString().includes(searchTerm)
    );

    // Agrupar recibos por hermano para la vista de cuadrícula
    const recibosPorHermano = useMemo(() => {
        const mapping: Record<string, { pagos: number[], pendientes: number[] }> = {};
        const anioActual = 2026; // Usamos el año que estamos gestionando

        recibos.forEach(r => {
            const rYear = new Date(r.fechaEmision).getFullYear();
            if (rYear === anioActual && r.tipo === 'CUOTA_ORDINARIA') {
                if (!mapping[r.hermanoId]) mapping[r.hermanoId] = { pagos: [], pendientes: [] };

                const month = new Date(r.fechaEmision).getMonth() + 1;
                if (r.estado === 'COBRADO') {
                    mapping[r.hermanoId].pagos.push(month);
                } else if (r.estado === 'PENDIENTE') {
                    mapping[r.hermanoId].pendientes.push(month);
                }
            }
        });
        return mapping;
    }, [recibos]);

    const handleOpenPayment = (id: string) => {
        setSelectedReciboId(id);
        setIsPaymentModalOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!selectedReciboId) return;
        try {
            await registrarCobro(selectedReciboId, 'EFECTIVO');
            setIsPaymentModalOpen(false);
            setSelectedReciboId(null);
            // alert('Cobro registrado correctamente'); // Removed to avoid blocking UI
        } catch (err) {
            alert('Error al registrar el cobro');
        }
    };

    const handleCreateRecibo = async () => {
        if (!newRecibo.hermanoId || !newRecibo.concepto || !newRecibo.importe) {
            alert('Por favor rellena todos los campos obligatorios');
            return;
        }

        try {
            await crearRecibo({
                hermanoId: newRecibo.hermanoId,
                concepto: newRecibo.concepto,
                importe: parseFloat(newRecibo.importe),
                estado: 'PENDIENTE',
                tipo: newRecibo.tipo,
                fechaEmision: new Date(),
                fechaVencimiento: newRecibo.fechaVencimiento ? new Date(newRecibo.fechaVencimiento) : undefined,
                observaciones: ''
            });
            setIsCreateModalOpen(false);
            setNewRecibo({ hermanoId: '', concepto: '', importe: '', tipo: 'CUOTA_ORDINARIA', fechaVencimiento: '' });
        } catch (err) {
            console.error(err);
            alert('Error al crear el recibo');
        }
    };

    // Helper to find brother name
    const getHermanoName = (id: string) => {
        const h = hermanos.find(h => h.id === id);
        return h ? `${h.nombre} ${h.apellido1}` : id;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
                    <p className="text-muted-foreground">Gestión de recibos, cuotas y cobros manuales.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => window.location.href = '/tesoreria/precios'}>
                        <Wallet className="w-4 h-4 mr-2" />
                        Gestionar Precios
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/tesoreria/cuotas'} className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pago de Cuotas
                    </Button>
                    <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4" /> Nuevo Recibo
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recaudación Total</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(recibos.filter(r => r.estado === 'COBRADO').reduce((acc, r) => acc + r.importe, 0))}</div>
                        <p className="text-xs text-muted-foreground">Efectivo capturado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{formatCurrency(recibos.filter(r => r.estado === 'PENDIENTE').reduce((acc, r) => acc + r.importe, 0))}</div>
                        <p className="text-xs text-muted-foreground">Cobros pendientes</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Listado de Recibos</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por concepto..."
                                    className="pl-8 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr className="text-left font-medium">
                                    <th className="p-4 w-16">Nº</th>
                                    <th className="p-4">Hermano</th>
                                    <th className="p-4">Estado Cuotas 2026 (Mensual)</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-900">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-4 text-center">Cargando datos...</td></tr>
                                ) : filteredHermanos.length === 0 ? (
                                    <tr><td colSpan={4} className="p-4 text-center">No se encontraron hermanos.</td></tr>
                                ) : (
                                    filteredHermanos.map((hermano) => {
                                        const info = recibosPorHermano[hermano.id] || { pagos: [], pendientes: [] };
                                        const totalDeuda = info.pendientes.length * 1.50;

                                        return (
                                            <tr key={hermano.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-4 font-mono text-xs font-bold text-slate-500">{hermano.numeroHermano}</td>
                                                <td className="p-4">
                                                    <div className="font-bold">{hermano.nombre} {hermano.apellido1}</div>
                                                    {totalDeuda > 0 && (
                                                        <div className="text-[10px] text-red-600 font-black uppercase tracking-tighter">
                                                            Deuda: {formatCurrency(totalDeuda)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <CuotasGrid
                                                            pagos={info.pagos}
                                                            selectedMonths={info.pendientes} // Usamos selected para los pendientes en naranja
                                                            onMonthClick={() => {
                                                                // Redirigir a la gestión de cuotas detallada o abrir modal
                                                                window.location.href = '/tesoreria/cuotas';
                                                            }}
                                                        />
                                                        <span className="text-[10px] font-bold text-slate-400 ml-2">
                                                            {info.pagos.length}/12
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-indigo-600 font-bold"
                                                        onClick={() => window.location.href = '/tesoreria/cuotas'}
                                                    >
                                                        Gestionar
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

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Confirmar Cobro Manual"
            >
                <div className="space-y-4 pt-4 text-black">
                    <p className="text-sm">¿Confirmas que has recibido el dinero en efectivo para este recibo?</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmPayment}>Confirmar Cobro</Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Nuevo Recibo / Cuota"
            >
                <div className="space-y-4 pt-4 text-black">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hermano</label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={newRecibo.hermanoId}
                            onChange={(e) => setNewRecibo({ ...newRecibo, hermanoId: e.target.value })}
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
                        <label className="text-sm font-medium">Concepto</label>
                        <Input
                            placeholder="Ej: Cuota 2024, Lotería Navidad..."
                            value={newRecibo.concepto}
                            onChange={(e) => setNewRecibo({ ...newRecibo, concepto: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Importe (€)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={newRecibo.importe}
                                onChange={(e) => setNewRecibo({ ...newRecibo, importe: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={newRecibo.tipo}
                                onChange={(e) => setNewRecibo({ ...newRecibo, tipo: e.target.value as TipoRecibo })}
                            >
                                <option value="CUOTA_ORDINARIA">Cuota Ordinaria</option>
                                <option value="CUOTA_EXTRAORDINARIA">Cuota Extra.</option>
                                <option value="PAPELETA_SITIO">Papeleta Sitio</option>
                                <option value="DONATIVO">Donativo</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Vencimiento (Opcional)</label>
                        <Input
                            type="date"
                            value={newRecibo.fechaVencimiento}
                            onChange={(e) => setNewRecibo({ ...newRecibo, fechaVencimiento: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateRecibo}>Crear Recibo</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
