
'use client';

import React, { useState } from 'react';
import { useRecibos } from '@/presentation/hooks/useRecibos';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Badge } from '@/presentation/components/ui/Badge';
import { Search, Plus, Filter, Wallet, MoreVertical, CreditCard } from 'lucide-react';
import { Modal } from '@/presentation/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';

export default function TesoreriaPage() {
    const { recibos, loading, error, registrarCobro } = useRecibos();
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedReciboId, setSelectedReciboId] = useState<string | null>(null);

    const filteredRecibos = recibos.filter(r =>
        r.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.hermanoId.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            alert('Cobro registrado correctamente');
        } catch (err) {
            alert('Error al registrar el cobro');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
                    <p className="text-muted-foreground">Gestión de recibos, cuotas y cobros manuales.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Recibo
                </Button>
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
                                    <th className="p-4">Hermano</th>
                                    <th className="p-4">Concepto</th>
                                    <th className="p-4">Importe</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-4 text-center">Cargando recibos...</td></tr>
                                ) : filteredRecibos.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center">No hay recibos pendientes.</td></tr>
                                ) : (
                                    filteredRecibos.map((recibo) => (
                                        <tr key={recibo.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="p-4 font-mono text-xs">{recibo.hermanoId}</td>
                                            <td className="p-4">{recibo.concepto}</td>
                                            <td className="p-4 font-medium">{formatCurrency(recibo.importe)}</td>
                                            <td className="p-4">
                                                <Badge variant={
                                                    recibo.estado === 'COBRADO' ? 'success' :
                                                        recibo.estado === 'PENDIENTE' ? 'warning' : 'destructive'
                                                }>
                                                    {recibo.estado}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                {recibo.estado === 'PENDIENTE' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                        onClick={() => handleOpenPayment(recibo.id)}
                                                    >
                                                        Cobrar en Mano
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
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
        </div>
    );
}
