
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { Search, Trash2, ArrowLeft, Loader2, CheckCircle2, Clock, Printer, X, Download, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/presentation/components/ui/Badge';
import { Input } from '@/presentation/components/ui/Input';
import dynamic from 'next/dynamic';

import { Suspense } from 'react';

const PDFDownloadButton = dynamic<any>(
    () => import('@/presentation/components/cofradia/PDFDownloadButton').then((mod) => mod.PDFDownloadButton),
    { ssr: false, loading: () => <div className="h-16 bg-slate-100 animate-pulse rounded-2xl flex-1" /> }
);

function ListadoPapeletasContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { papeletas, eliminarPapeleta, loading: loadingPapeletas } = usePapeletas();
    const { hermanos } = useHermanos();
    const [loading, setLoading] = useState(false);
    const [selectedPapeleta, setSelectedPapeleta] = useState<any | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('estado') || '');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getNombreHermano = (id: string) => {
        const h = hermanos.find(herm => herm.id === id);
        return h ? h.getNombreCompleto() : 'Desconocido';
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
        if (!confirm('¿Estás seguro de que deseas anular esta papeleta? Esto no eliminará el recibo automáticamente (debe hacerse en Tesorería si es necesario).')) {
            return;
        }

        try {
            setLoading(true);
            await eliminarPapeleta(id);
            alert('Papeleta anulada correctamente');
        } catch (err: any) {
            alert(`Error al anular la papeleta: ${err.message || 'Error desconocido'}`);
        } finally {
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

    const filteredPapeletas = papeletas.filter(p => {
        const hermano = hermanos.find(h => h.id === p.hermanoId);
        const matchesSearch = !searchTerm ||
            hermano?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hermano?.apellido1.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hermano?.numeroHermano?.toString().includes(searchTerm) ||
            p.id.includes(searchTerm);

        const matchesStatus = !statusFilter || p.estado === statusFilter;
        const matchesYear = !yearFilter || p.anio.toString() === yearFilter;
        const matchesManual = !searchParams.get('manual') || p.esAsignacionManual;

        return matchesSearch && matchesStatus && matchesYear && matchesManual;
    });

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
                <Button variant="ghost" size="icon" onClick={() => router.push('/cofradia')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Papeletas</h1>
                    <p className="text-muted-foreground">Filtra, busca y gestiona las solicitudes de este año.</p>
                </div>
            </div>

            <Card className="border-slate-800">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Buscar Hermano</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Nombre, apellidos o número de hermano..."
                                    className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</label>
                            <select
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="SOLICITADA">En Espera (Solicitadas)</option>
                                <option value="ASIGNADA">Asignadas</option>
                                <option value="EMITIDA">Emitidas / Cobradas</option>
                            </select>
                        </div>
                        <div className="w-full md:w-32 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Año</label>
                            <select
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
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
                                {filteredPapeletas.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium italic">
                                            No hay papeletas que coincidan con los filtros seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPapeletas.map((p) => (
                                        <tr
                                            key={p.id}
                                            className={`border-b hover:bg-slate-50 transition-colors cursor-pointer ${p.estado === 'SOLICITADA' ? 'bg-blue-50/20' : ''}`}
                                            onClick={() => setSelectedPapeleta(p)}
                                        >
                                            <td className="p-4 font-mono">{getNumeroHermano(p.hermanoId)}</td>
                                            <td className="p-4 font-medium">{getNombreHermano(p.hermanoId)}</td>
                                            <td className="p-4">{p.anio}</td>
                                            <td className="p-4">{getStatusBadge(p.estado)}</td>
                                            <td className="p-4 italic text-slate-500 truncate max-w-[200px]">{p.observaciones || '-'}</td>
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

export default function ListadoPapeletasPage() {
    return (
        <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <ListadoPapeletasContent />
        </Suspense>
    );
}
