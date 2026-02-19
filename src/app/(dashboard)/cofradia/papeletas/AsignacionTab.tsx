'use client';

import React, { useState, useMemo } from 'react';
import { useCortejo } from '@/presentation/hooks/useCortejo';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Search, UserCheck, X, Plus, Ghost, Disc } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';

interface PosicionSeleccionada {
    tIdx: number;
    sIdx: number;
    elemId: string;
    posId: string;
    tramoId: string;
    tramoNombre: string;
}

export default function AsignacionTab() {
    const { structure, loading: loadingCortejo, asignarHermano } = useCortejo();
    const { papeletas, loading: loadingPapeletas } = usePapeletas();
    const { hermanos, loading: loadingHermanos } = useHermanos();

    const [posicionSeleccionada, setPosicionSeleccionada] = useState<PosicionSeleccionada | null>(null);
    const [search, setSearch] = useState('');

    const loading = loadingCortejo || loadingPapeletas || loadingHermanos;

    const getHermanoName = (id: string) => {
        const h = hermanos.find(h => h.id === id);
        return h ? `${h.nombre} ${h.apellido1}` : 'Desconocido';
    };

    const getHermanoNumero = (id: string) => {
        return hermanos.find(h => h.id === id)?.numeroHermano ?? '-';
    };

    /** IDs de hermanos ya asignados en alguna posición del cortejo */
    const hermanoIdsAsignados = useMemo(() => {
        const ids = new Set<string>();
        structure?.tramos.forEach(t =>
            t.subtramos.forEach(s =>
                s.elementos.forEach(e =>
                    e.posiciones.forEach(p => {
                        if (p.hermanoId) ids.add(p.hermanoId);
                    })
                )
            )
        );
        return ids;
    }, [structure]);

    /** Candidatos para la posición seleccionada */
    const candidatos = useMemo(() => {
        if (!posicionSeleccionada) return [];
        const tramoId = posicionSeleccionada.tramoId;

        return papeletas
            .filter(p => {
                if (p.estado === 'ANULADA') return false;
                if (hermanoIdsAsignados.has(p.hermanoId)) return false;
                // Sin tramoId → candidato universal; con tramoId → debe coincidir
                if (p.tramoId && p.tramoId !== tramoId) return false;
                return true;
            })
            .map(p => {
                const h = hermanos.find(h => h.id === p.hermanoId);
                return { papeleta: p, hermano: h };
            })
            .filter(c => {
                if (!c.hermano) return false;
                if (!search) return true;
                return `${c.hermano.nombre} ${c.hermano.apellido1} ${c.hermano.numeroHermano}`
                    .toLowerCase()
                    .includes(search.toLowerCase());
            })
            // Primero los del tramo exacto, luego los universales (sin tramo)
            .sort((a, b) => {
                const aExacto = a.papeleta.tramoId === tramoId ? 0 : 1;
                const bExacto = b.papeleta.tramoId === tramoId ? 0 : 1;
                return aExacto - bExacto;
            });
    }, [posicionSeleccionada, papeletas, hermanos, hermanoIdsAsignados, search]);

    const handleAsignar = (papeletaId: string, hermanoId: string) => {
        if (!posicionSeleccionada) return;
        const { tIdx, sIdx, elemId, posId } = posicionSeleccionada;
        asignarHermano(tIdx, sIdx, elemId, posId, hermanoId, papeletaId);
        setPosicionSeleccionada(null);
        setSearch('');
    };

    const handleDesasignar = (tIdx: number, sIdx: number, elemId: string, posId: string) => {
        asignarHermano(tIdx, sIdx, elemId, posId, '', '');
    };

    if (loading) return (
        <div className="p-8 text-center text-slate-400 italic">Sincronizando datos…</div>
    );

    return (
        <div className="space-y-10 pb-24">

            {/* === CORTEJO === */}
            {structure?.tramos.map((tramo, tIdx) => (
                <div key={tramo.id} className="space-y-4">
                    {/* Cabecera de tramo */}
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow">
                            {tramo.numero}
                        </div>
                        <h3 className="text-base font-black text-slate-900 uppercase italic tracking-tight">
                            {tramo.nombre}
                        </h3>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* Subtramos */}
                    {tramo.subtramos.map((sub, sIdx) => (
                        <div key={sub.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Subtramo {sub.numero}
                            </span>

                            {sub.elementos.map((elem) => (
                                <div key={elem.id} className="space-y-2">
                                    {/* Tipo de elemento */}
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1 h-3 rounded-full ${elem.tipo === 'INSIGNIA' ? 'bg-amber-400' : elem.tipo === 'PASO' ? 'bg-purple-500' : 'bg-slate-300'}`} />
                                        <span className="text-[9px] font-black uppercase text-slate-400 italic">
                                            {elem.tipo === 'INSIGNIA' ? 'Insignia' : elem.tipo === 'PASO' ? 'Paso' : 'Nazarenos'}
                                        </span>
                                    </div>

                                    {/* Posiciones */}
                                    <div className="flex flex-wrap gap-2">
                                        {elem.posiciones.map((pos) => (
                                            pos.hermanoId ? (
                                                /* POSICIÓN OCUPADA */
                                                <div
                                                    key={pos.id}
                                                    className="flex items-center gap-2 bg-slate-900 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-sm relative group"
                                                >
                                                    <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                    <span className="truncate max-w-[120px]">{getHermanoName(pos.hermanoId)}</span>
                                                    <span className="text-white/40 text-[9px] font-black shrink-0">
                                                        Nº{getHermanoNumero(pos.hermanoId)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDesasignar(tIdx, sIdx, elem.id, pos.id)}
                                                        className="ml-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                        title="Desasignar"
                                                    >
                                                        <X className="w-2.5 h-2.5 text-white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                /* POSICIÓN VACÍA */
                                                <button
                                                    key={pos.id}
                                                    onClick={() => {
                                                        setPosicionSeleccionada({
                                                            tIdx,
                                                            sIdx,
                                                            elemId: elem.id,
                                                            posId: pos.id,
                                                            tramoId: tramo.id,
                                                            tramoNombre: tramo.nombre,
                                                        });
                                                        setSearch('');
                                                    }}
                                                    className="flex items-center gap-1.5 border-2 border-dashed border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                                >
                                                    {elem.tipo === 'INSIGNIA'
                                                        ? <Disc className="w-3 h-3" />
                                                        : <Ghost className="w-3 h-3" />
                                                    }
                                                    <span className="truncate max-w-[80px]">{pos.nombrePuesto}</span>
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}

            {/* === MODAL DE CANDIDATOS === */}
            {posicionSeleccionada && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={() => setPosicionSeleccionada(null)}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-slate-100">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">
                                        Asignar Hermano
                                    </h2>
                                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                                        TRAMO: <span className="text-slate-900">{posicionSeleccionada.tramoNombre}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPosicionSeleccionada(null)}
                                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Buscador */}
                            <div className="relative mt-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nombre o número…"
                                    className="pl-9 h-9 rounded-xl bg-slate-50 border-slate-200 text-sm"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Lista de candidatos */}
                        <div className="overflow-y-auto max-h-72 divide-y divide-slate-50">
                            {candidatos.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">
                                    No hay hermanos disponibles para este tramo
                                </div>
                            ) : (
                                candidatos.map(({ papeleta, hermano }) => {
                                    const esExacto = papeleta.tramoId === posicionSeleccionada.tramoId;
                                    return (
                                        <button
                                            key={papeleta.id}
                                            onClick={() => handleAsignar(papeleta.id, hermano!.id)}
                                            className="w-full flex items-center justify-between px-6 py-3 hover:bg-blue-50 transition-colors text-left group"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">
                                                    {hermano?.nombre} {hermano?.apellido1}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold">
                                                    Nº {hermano?.numeroHermano} · {papeleta.observaciones || 'Sin nota'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {esExacto ? (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px] font-black uppercase">
                                                        Su tramo
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[9px] font-black uppercase">
                                                        Sin tramo
                                                    </Badge>
                                                )}
                                                <Plus className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
