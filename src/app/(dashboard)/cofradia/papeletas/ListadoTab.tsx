
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { useCortejo } from '@/presentation/hooks/useCortejo';
import { Search, Trash2, CheckCircle2, Clock, X, Download, Edit3, Save } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';
import { Input } from '@/presentation/components/ui/Input';
import dynamic from 'next/dynamic';

const PDFDownloadButton = dynamic<any>(
    () => import('@/presentation/components/cofradia/PDFDownloadButton').then((mod) => mod.PDFDownloadButton),
    { ssr: false, loading: () => <div className="h-16 bg-slate-100 animate-pulse rounded-2xl flex-1" /> }
);

export default function ListadoTab() {
    const { papeletas, eliminarPapeleta, actualizarPapeleta, loading: loadingPapeletas } = usePapeletas();
    const { hermanos } = useHermanos();
    const { structure } = useCortejo();
    const [loading, setLoading] = useState(false);
    const [selectedPapeleta, setSelectedPapeleta] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    const handleSave = async () => {
        if (!editForm) return;
        try {
            setLoading(true);
            await actualizarPapeleta(editForm);
            setSelectedPapeleta(editForm);
            setIsEditing(false);
        } catch (err: any) {
            alert(`Error al actualizar: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = () => {
        setEditForm({ ...selectedPapeleta });
        setIsEditing(true);
    };

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
        if (!confirm('¿Estás seguro de que deseas anular esta papeleta?')) return;
        try {
            setLoading(true);
            await eliminarPapeleta(id);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'EMITIDA':
                return <Badge className="bg-green-100 text-green-700 border-green-200 uppercase text-[10px] font-black tracking-widest"><CheckCircle2 className="w-3 h-3 mr-1" /> Emitida</Badge>;
            case 'SOLICITADA':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200 uppercase text-[10px] font-black tracking-widest"><Clock className="w-3 h-3 mr-1" /> Por recoger</Badge>;
            case 'ASIGNADA':
                return <Badge className="bg-purple-100 text-purple-700 border-purple-200 uppercase text-[10px] font-black tracking-widest"><CheckCircle2 className="w-3 h-3 mr-1" /> Asignada</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase">{estado}</Badge>;
        }
    };

    const filteredPapeletas = papeletas.filter(p => {
        const h = hermanos.find(herm => herm.id === p.hermanoId);
        const matchesSearch = !searchTerm ||
            `${h?.nombre} ${h?.apellido1} ${h?.numeroHermano}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || p.estado === statusFilter;
        const matchesYear = !yearFilter || p.anio.toString() === yearFilter;
        return matchesSearch && matchesStatus && matchesYear;
    });

    return (
        <div className="space-y-6">
            <Card className="border-slate-100 shadow-none">
                <CardHeader>
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nombre o Nº..."
                                className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="SOLICITADA">Por recoger</option>
                                <option value="ASIGNADA">Asignada</option>
                                <option value="EMITIDA">Emitida</option>
                            </select>
                            <select
                                className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
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
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hermano</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalle</th>
                                    <th className="text-right px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPapeletas.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400 font-medium italic">
                                            No se encontraron registros.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPapeletas.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedPapeleta(p)}>
                                            <td className="px-4 py-4 font-mono font-bold text-slate-900">{getNumeroHermano(p.hermanoId)}</td>
                                            <td className="px-4 py-4 font-bold text-slate-900">{getNombreHermano(p.hermanoId)}</td>
                                            <td className="px-4 py-4">{getStatusBadge(p.estado)}</td>
                                            <td className="px-4 py-4 text-xs text-slate-500 italic truncate max-w-[150px]">{p.observaciones || '-'}</td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-300 hover:text-red-500 rounded-lg group-hover:bg-red-50"
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

            {/* Modal de Detalle */}
            {selectedPapeleta && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { if (!isEditing) setSelectedPapeleta(null); }}>
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                        {isEditing ? 'Editando Papeleta' : 'Detalle de Papeleta'}
                                    </h2>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                                        ID: {selectedPapeleta.id.slice(0, 8)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {!isEditing && (
                                        <Button variant="ghost" size="icon" onClick={startEditing} className="rounded-full hover:bg-blue-50 text-blue-500">
                                            <Edit3 className="w-5 h-5" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedPapeleta(null); setIsEditing(false); }} className="rounded-full hover:bg-slate-100">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Hermano</label>
                                    <p className="text-lg font-bold text-slate-800">{getNombreHermano(selectedPapeleta.hermanoId)}</p>
                                    <p className="text-sm text-slate-500">Número {getNumeroHermano(selectedPapeleta.hermanoId)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Año y Estado</label>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <p className="text-lg font-bold text-slate-800">{selectedPapeleta.anio}</p>
                                            <select
                                                className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold"
                                                value={editForm.estado}
                                                onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                                            >
                                                <option value="SOLICITADA">SOLICITADA</option>
                                                <option value="ASIGNADA">ASIGNADA</option>
                                                <option value="EMITIDA">EMITIDA</option>
                                                <option value="ANULADA">ANULADA</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-lg font-bold text-slate-800">{selectedPapeleta.anio}</p>
                                            <div className="mt-1">{getStatusBadge(selectedPapeleta.estado)}</div>
                                        </>
                                    )}
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tramo Sugerido</label>
                                    {isEditing ? (
                                        <select
                                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-blue-50 text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={editForm.tramoId || ''}
                                            onChange={(e) => setEditForm({ ...editForm, tramoId: e.target.value || null })}
                                        >
                                            <option value="">Sin tramo asignado</option>
                                            {structure?.tramos.map(t => (
                                                <option key={t.id} value={t.id}>TRAMO {t.numero}: {t.nombre}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-black uppercase italic text-slate-700">
                                            {structure?.tramos.find(t => t.id === selectedPapeleta.tramoId)?.nombre || 'NINGUNO'}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Observaciones / Puesto</label>
                                    {isEditing ? (
                                        <textarea
                                            className="w-full text-slate-600 bg-slate-50 p-4 rounded-2xl italic border border-slate-200 min-h-[80px] text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            value={editForm.observaciones || ''}
                                            onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                                            placeholder="Escribe anotaciones aquí..."
                                        />
                                    ) : (
                                        <p className="text-slate-600 bg-slate-50 p-4 rounded-2xl italic border border-slate-100 min-h-[80px]">
                                            {selectedPapeleta.observaciones || 'No hay observaciones registradas.'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {isEditing ? (
                                    <>
                                        <Button
                                            className="h-16 px-8 rounded-2xl bg-slate-900 border-slate-200 hover:bg-black text-white font-bold flex-1 shadow-lg shadow-slate-900/20"
                                            onClick={handleSave}
                                            disabled={loading}
                                        >
                                            {loading ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-16 px-8 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-500 font-bold"
                                            onClick={() => setIsEditing(false)}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <PDFDownloadButton
                                            papeleta={selectedPapeleta}
                                            hermano={getHermano(selectedPapeleta.hermanoId)}
                                        />
                                        <Button
                                            variant="outline"
                                            className="h-16 px-8 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-500 font-bold"
                                            onClick={() => setSelectedPapeleta(null)}
                                        >
                                            Cerrar Vista
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
