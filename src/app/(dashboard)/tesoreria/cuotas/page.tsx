'use client';

import React, { useState, useMemo } from 'react';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { useRecibos } from '@/presentation/hooks/useRecibos';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Search, ChevronLeft, CreditCard, User, Calendar, Loader2 } from 'lucide-react';
import { CuotasGrid } from '@/presentation/components/tesoreria/CuotasGrid';
import { Modal } from '@/presentation/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

import { usePrecios } from '@/presentation/hooks/usePrecios';

const MONTHS_FULL = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTHS_SHORT = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default function CuotasPage() {
    const { hermanos, loading: loadingHermanos } = useHermanos();
    const { recibos, loading: loadingRecibos, registrarCobro, crearRecibo, eliminarRecibo } = useRecibos();
    const { precios } = usePrecios({ activo: true, tipo: 'CUOTA' });

    const currentYear = new Date().getFullYear();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonths, setSelectedMonths] = useState<Record<string, number[]>>({});
    const [monthsToDelete, setMonthsToDelete] = useState<Record<string, number[]>>({}); // New state for deletions
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [activeHermanoId, setActiveHermanoId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Standard fee based on price table
    const cuotaEstandard = useMemo(() => {
        const config = precios.find(p => p.activo && p.nombre.toUpperCase().includes('CUOT'))
            || precios.find(p => p.activo);
        return config ? config.importe : 1.50;
    }, [precios]);

    const handleOpenPaymentModal = (hermanoId: string) => {
        setActiveHermanoId(hermanoId);
        setIsPaymentModalOpen(true);
    };

    const toggleSelectionAll = (hermanoId: string) => {
        const paidMonths = pagosPorHermano[hermanoId] || [];
        const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Months 1-12
        const pending = allMonths.filter(m => !paidMonths.includes(m));
        const currentSelected = selectedMonths[hermanoId] || [];

        if (currentSelected.length === pending.length && pending.length > 0) {
            setSelectedMonths(prev => {
                const next = { ...prev };
                delete next[hermanoId];
                return next;
            });
        } else {
            setSelectedMonths(prev => ({ ...prev, [hermanoId]: pending }));
        }
    };

    // Filter brothers
    const filteredHermanos = useMemo(() => {
        return hermanos.filter(h =>
            `${h.nombre} ${h.apellido1} ${h.apellido2 || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.numeroHermano.toString().includes(searchTerm)
        ).slice(0, 50); // Limit results for performance
    }, [hermanos, searchTerm]);

    // Map paid months for each brother (only current year) - Using 1-12 indexing
    const pagosPorHermano = useMemo(() => {
        const mapping: Record<string, number[]> = {};
        recibos.forEach(r => {
            if (r.tipo === 'CUOTA_ORDINARIA' && r.estado === 'COBRADO') {
                const reciboYear = new Date(r.fechaEmision).getFullYear();
                if (reciboYear === currentYear) {
                    if (!mapping[r.hermanoId]) mapping[r.hermanoId] = [];

                    const jsMonth = new Date(r.fechaEmision).getMonth(); // 0-11
                    const monthNumber = jsMonth + 1; // Convert to 1-12

                    if (!mapping[r.hermanoId].includes(monthNumber)) {
                        mapping[r.hermanoId].push(monthNumber);
                    }
                }
            }
        });
        console.log('📊 Meses pagados por hermano:', mapping);
        return mapping;
    }, [recibos, currentYear]);

    const toggleMonthSelection = (hermanoId: string, monthNumber: number) => {
        const isPaid = pagosPorHermano[hermanoId]?.includes(monthNumber);

        if (isPaid) {
            // Logic for invalidating paid months
            setMonthsToDelete(prev => {
                const brotherDeletions = prev[hermanoId] || [];
                if (brotherDeletions.includes(monthNumber)) {
                    return { ...prev, [hermanoId]: brotherDeletions.filter(m => m !== monthNumber) };
                } else {
                    return { ...prev, [hermanoId]: [...brotherDeletions, monthNumber].sort((a, b) => a - b) };
                }
            });
        } else {
            // Logic for selecting unpaid months
            setSelectedMonths(prev => {
                const brotherSelections = prev[hermanoId] || [];
                if (brotherSelections.includes(monthNumber)) {
                    return { ...prev, [hermanoId]: brotherSelections.filter(m => m !== monthNumber) };
                } else {
                    return { ...prev, [hermanoId]: [...brotherSelections, monthNumber].sort((a, b) => a - b) };
                }
            });
        }
    };

    const handleConfirmPayment = async () => {
        if (!activeHermanoId) return;
        const monthsToPay = selectedMonths[activeHermanoId] || [];
        const monthsAnular = monthsToDelete[activeHermanoId] || [];

        if (monthsToPay.length === 0 && monthsAnular.length === 0) return;

        setIsProcessing(true);
        try {
            // 1. Process deletions
            for (const monthNumber of monthsAnular) {
                const jsMonth = monthNumber - 1;
                const existingRecibo = recibos.find(r =>
                    r.hermanoId === activeHermanoId &&
                    r.tipo === 'CUOTA_ORDINARIA' &&
                    r.estado === 'COBRADO' &&
                    new Date(r.fechaEmision).getMonth() === jsMonth &&
                    new Date(r.fechaEmision).getFullYear() === currentYear
                );

                if (existingRecibo) {
                    await eliminarRecibo(existingRecibo.id);
                }
            }

            // 2. Process payments
            for (const monthNumber of monthsToPay) {
                try {
                    const jsMonth = monthNumber - 1; // Convert 1-12 to 0-11 for JavaScript Date
                    const monthName = MONTHS_FULL[jsMonth];

                    // Create date strictly as UTC to avoid timezone issues
                    // This ensures 2026-12-01 is treated as Dec 1st regardless of local time
                    const dateObj = new Date(Date.UTC(currentYear, jsMonth, 1, 12, 0, 0));

                    const existingPending = recibos.find(r =>
                        r.hermanoId === activeHermanoId &&
                        r.tipo === 'CUOTA_ORDINARIA' &&
                        r.estado === 'PENDIENTE' &&
                        new Date(r.fechaEmision).getMonth() === jsMonth &&
                        new Date(r.fechaEmision).getFullYear() === currentYear
                    );

                    if (existingPending) {
                        await registrarCobro(existingPending.id, 'EFECTIVO');
                    } else {
                        await crearRecibo({
                            hermanoId: activeHermanoId,
                            concepto: `Cuota ${monthName} ${currentYear}`,
                            importe: cuotaEstandard,
                            estado: 'COBRADO',
                            tipo: 'CUOTA_ORDINARIA',
                            fechaEmision: dateObj,
                            observaciones: 'Pago desde modal de cuotas'
                        });
                    }
                } catch (monthError) {
                    console.error(`Error procesando mes ${monthNumber}:`, monthError);
                    throw monthError;
                }
            }

            // Reset states
            setMonthsToDelete(prev => {
                const next = { ...prev };
                delete next[activeHermanoId!];
                return next;
            });

            setSelectedMonths(prev => {
                const next = { ...prev };
                delete next[activeHermanoId!];
                return next;
            });
            setIsPaymentModalOpen(false);
            setActiveHermanoId(null);
        } catch (err) {
            console.error(err);
            alert('Error al procesar los cambios');
        } finally {
            setIsProcessing(false);
        }
    };

    const activeHermano = useMemo(() =>
        hermanos.find(h => h.id === activeHermanoId),
        [hermanos, activeHermanoId]);

    const activeSelectionCount = (activeHermanoId && selectedMonths[activeHermanoId]?.length) || 0;
    const activeTotal = activeSelectionCount * cuotaEstandard;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/tesoreria">
                        <Button variant="ghost" size="icon" className="bg-white border-slate-200 shadow-sm">
                            <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cobro de Cuotas</h1>
                        <p className="text-slate-500 font-medium">Gestión rápida de pagos mensuales {currentYear}.</p>
                    </div>
                </div>
            </div>

            <Card className="bg-white border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-slate-900">Listado de Hermanos</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar hermano por nombre o número..."
                                className="pl-8 w-[350px] bg-slate-50 border-slate-200 text-slate-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/80 border-b">
                                <tr className="text-left font-bold text-slate-600">
                                    <th className="p-4 w-16">Nº</th>
                                    <th className="p-4">Hermano</th>
                                    <th className="p-4 text-right">Estado Actual</th>
                                    <th className="p-4 w-32 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loadingHermanos || loadingRecibos ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Cargando datos...</td></tr>
                                ) : filteredHermanos.map((h) => (
                                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-slate-500 font-bold">{h.numeroHermano}</td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{h.nombre} {h.apellido1}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase">{h.apellido2 || ''}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            {(() => {
                                                const paidCount = pagosPorHermano[h.id]?.length || 0;
                                                const isFullyPaid = paidCount === 12;
                                                return (
                                                    <Badge variant={isFullyPaid ? 'success' : 'warning'} className="font-bold">
                                                        {paidCount}/12 Pagados
                                                    </Badge>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Button
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 font-bold px-4"
                                                onClick={() => handleOpenPaymentModal(h.id)}
                                            >
                                                Pagar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Gestión de Pagos"
            >
                {activeHermano && (
                    <div className="space-y-6 pt-4 text-slate-900">
                        <div className="flex items-center gap-4 border-b pb-4 border-slate-100">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-black">
                                {activeHermano.numeroHermano}
                            </div>
                            <div>
                                <p className="text-lg font-black">{activeHermano.nombre} {activeHermano.apellido1}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase">Cuotas Hermano {currentYear}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">Seleccione los meses a pagar:</p>
                                {(() => {
                                    const paidCount = pagosPorHermano[activeHermano.id]?.length || 0;
                                    const pendingCount = 12 - paidCount;
                                    const isAllSelected = (selectedMonths[activeHermano.id]?.length || 0) === pendingCount && pendingCount > 0;

                                    return (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-[10px] font-black border-slate-200"
                                            onClick={() => toggleSelectionAll(activeHermano.id)}
                                        >
                                            {isAllSelected ? 'DESMARCAR TODO' : 'MARCAR TODO EL AÑO'}
                                        </Button>
                                    );
                                })()}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-center">
                                <CuotasGrid
                                    pagos={pagosPorHermano[activeHermano.id] || []}
                                    selectedMonths={selectedMonths[activeHermano.id] || []}
                                    monthsToDelete={monthsToDelete[activeHermano.id] || []}
                                    onMonthClick={(m) => toggleMonthSelection(activeHermano.id, m)}
                                />
                            </div>
                        </div>

                        {activeSelectionCount > 0 && (
                            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-5 shadow-sm animate-in fade-in zoom-in duration-300">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <CreditCard className="w-8 h-8 text-indigo-700" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none mb-1">Total a cobrar</p>
                                    <p className="text-3xl font-black text-indigo-800 leading-none">{formatCurrency(activeTotal)}</p>
                                    <p className="text-xs text-indigo-700/70 font-bold mt-1">
                                        {activeSelectionCount === 1 ? '1 mes seleccionado' : `${activeSelectionCount} meses seleccionados`}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
                                disabled={isProcessing}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className={cn(
                                    "font-bold px-8 shadow-lg transition-colors",
                                    (monthsToDelete[activeHermano.id] || []).length > 0
                                        ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                )}
                                onClick={handleConfirmPayment}
                                disabled={(activeSelectionCount === 0 && (monthsToDelete[activeHermano.id] || []).length === 0) || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        PROCESANDO...
                                    </>
                                ) : (
                                    (monthsToDelete[activeHermano.id] || []).length > 0 && activeSelectionCount === 0
                                        ? 'CONFIRMAR ANULACIÓN'
                                        : (monthsToDelete[activeHermano.id] || []).length > 0
                                            ? 'GUARDAR CAMBIOS'
                                            : 'CONFIRMAR Y PAGAR'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal >
        </div >
    );
}
