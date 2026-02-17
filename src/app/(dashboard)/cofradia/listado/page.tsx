
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { Trash2, ArrowLeft, Loader2, CheckCircle2, Clock, Printer, X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/presentation/components/ui/Badge';
import dynamic from 'next/dynamic';
const PDFDownloadButton = dynamic<any>(
    () => import('@/presentation/components/cofradia/PDFDownloadButton').then((mod) => mod.PDFDownloadButton),
    { ssr: false, loading: () => <div className="h-16 bg-slate-100 animate-pulse rounded-2xl flex-1" /> }
);

export default function ListadoPapeletasPage() {
    const router = useRouter();
    const { papeletas, eliminarPapeleta, loading: loadingPapeletas } = usePapeletas();
    const { hermanos } = useHermanos();
    const [loading, setLoading] = useState(false);
    const [selectedPapeleta, setSelectedPapeleta] = useState<any | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getNombreHermano = (id: string) => {
        const h = hermanos.find(herm => herm.id === id);
        return h ? `${h.nombre} ${h.apellido1}` : 'Desconocido';
    };

    const getHermano = (id: string) => {
        return hermanos.find(herm => herm.id === id);
    };

    const getNumeroHermano = (id: string) => {
        const h = hermanos.find(herm => herm.id === id);
        return h ? h.numeroHermano : '-';
    };

    const handleAnular = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        console.log('[ListadoPapeletas] Inicio handleAnular con ID:', id);
        if (!confirm('¿Estás seguro de que deseas anular esta papeleta? Esto no eliminará el recibo automáticamente (debe hacerse en Tesorería si es necesario).')) {
            console.log('[ListadoPapeletas] Cancelado por el usuario');
            return;
        }

        try {
            console.log('[ListadoPapeletas] Llamando a eliminarPapeleta...');
            setLoading(true);
            await eliminarPapeleta(id);
            console.log('[ListadoPapeletas] eliminarPapeleta completado con éxito');
            alert('Papeleta anulada correctamente');
        } catch (err: any) {
            console.error('[ListadoPapeletas] ERROR CATCH:', err);
            alert(`Error al anular la papeleta: ${err.message || 'Error desconocido'}`);
        } finally {
            console.log('[ListadoPapeletas] Finalizando carga');
            setLoading(false);
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'EMITIDA':
                return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Emitida</Badge>;
            case 'SOLICITADA':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" /> Por recoger</Badge>;
            case 'ASIGNADA':
                return <Badge className="bg-purple-100 text-purple-700 border-purple-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Puesto Asignado</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    if (loadingPapeletas) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Listado de Papeletas</h1>
                    <p className="text-muted-foreground">Gestión y control de papeletas emitidas para el año actual.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="text-left p-4 font-bold">Nº Hermano</th>
                                    <th className="text-left p-4 font-bold">Hermano</th>
                                    <th className="text-left p-4 font-bold">Año</th>
                                    <th className="text-left p-4 font-bold">Estado</th>
                                    <th className="text-left p-4 font-bold">Observaciones / Puesto</th>
                                    <th className="text-right p-4 font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {papeletas.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No hay papeletas registradas todavía.
                                        </td>
                                    </tr>
                                ) : (
                                    papeletas.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedPapeleta(p)}
                                        >
                                            <td className="p-4 font-mono">{getNumeroHermano(p.hermanoId)}</td>
                                            <td className="p-4 font-medium">{getNombreHermano(p.hermanoId)}</td>
                                            <td className="p-4">{p.anio}</td>
                                            <td className="p-4">{getStatusBadge(p.estado)}</td>
                                            <td className="p-4 italic text-slate-500">{p.observaciones || '-'}</td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    disabled={loading}
                                                    onClick={(e) => handleAnular(e, p.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Modal de Detalle Minimalista */}
            {selectedPapeleta && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Detalle de Papeleta</h2>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                                        ID: {selectedPapeleta.id.slice(0, 8)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedPapeleta(null)}
                                    className="rounded-full hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Hermano</label>
                                    <p className="text-lg font-bold text-slate-800">{getNombreHermano(selectedPapeleta.hermanoId)}</p>
                                    <p className="text-sm text-slate-500">Número {getNumeroHermano(selectedPapeleta.hermanoId)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Año y Estado</label>
                                    <p className="text-lg font-bold text-slate-800">{selectedPapeleta.anio}</p>
                                    <div className="mt-1">{getStatusBadge(selectedPapeleta.estado)}</div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Observaciones / Puesto</label>
                                    <p className="text-slate-600 bg-slate-50 p-4 rounded-2xl italic border border-slate-100">
                                        {selectedPapeleta.observaciones || 'No hay observaciones registradas para esta papeleta.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <PDFDownloadButton
                                    papeleta={selectedPapeleta}
                                    hermano={getHermano(selectedPapeleta.hermanoId)}
                                />

                                <Button
                                    variant="outline"
                                    className="h-16 px-8 rounded-2xl border-slate-200 hover:bg-slate-50"
                                    onClick={() => setSelectedPapeleta(null)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Formato de Recuerdo Premium</span>
                            <Download className="w-4 h-4 text-slate-300" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
