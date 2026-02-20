'use client';

import React, { useState, useMemo } from 'react';
import { useCortejo } from '@/presentation/hooks/useCortejo';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { usePrecios } from '@/presentation/hooks/usePrecios';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Search, UserCheck, X, Plus, Ghost, Disc, MapPin, Tag } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';

interface PosicionSeleccionada {
    tIdx: number;
    sIdx: number;
    elemId: string;
    elemTipo: string;
    puestoNombre: string;
    posId: string;
    tramoId: string;
    tramoNombre: string;
}

export default function AsignacionTab() {
    const { structure, loading: loadingCortejo, asignarHermano } = useCortejo();
    const { papeletas, loading: loadingPapeletas } = usePapeletas();
    const { hermanos, loading: loadingHermanos } = useHermanos();
    const { precios, loading: loadingPrecios } = usePrecios();

    const [posicionSeleccionada, setPosicionSeleccionada] = useState<PosicionSeleccionada | null>(null);
    const [search, setSearch] = useState('');
    const [modoLibre, setModoLibre] = useState(false);

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
        const { tramoId, elemTipo, puestoNombre } = posicionSeleccionada;

        return papeletas
            .filter(p => {
                if (p.estado === 'ANULADA') return false;
                if (hermanoIdsAsignados.has(p.hermanoId)) return false;

                if (!modoLibre) {
                    // 1. Validar TRAMO
                    const tramoidPapeleta = (p as any).tramoid as string | null | undefined;
                    if (!tramoidPapeleta || tramoidPapeleta !== tramoId) return false;

                    // 2. Validar TIPO de Papeleta vs TIPO de Posición
                    // Resolvemos el precio de la papeleta
                    const precio = precios.find(pr => pr.id === p.puestoSolicitadoId);
                    if (precio) {
                        const tipoPrecio = precio.tipo; // NAZARENO, VARA, INSIGNIA, COSTALERO, etc.

                        // Lógica de compatibilidad
                        if (elemTipo === 'FILA_NAZARENOS' && tipoPrecio !== 'NAZARENO') return false;
                        if (elemTipo === 'INSIGNIA') {
                            // Si el puesto es 'Portador', requiere tipo INSIGNIA, FAROL, BOCINA o CRUZ_GUIA
                            // Si el puesto es 'Vara', requiere tipo VARA
                            const esVara = puestoNombre.toLowerCase().includes('vara');
                            if (esVara && tipoPrecio !== 'VARA') return false;
                            if (!esVara && !['INSIGNIA', 'FAROL', 'BOCINA', 'CRUZ_GUIA'].includes(tipoPrecio)) return false;
                        }
                        if (elemTipo === 'PASO' && tipoPrecio !== 'COSTALERO') return false;
                    }
                }
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
            .sort((a, b) => {
                const tramoidA = (a.papeleta as any).tramoid as string | null;
                const tramoidB = (b.papeleta as any).tramoid as string | null;
                const aScore = tramoidA === tramoId ? 0 : tramoidA ? 2 : 1;
                const bScore = tramoidB === tramoId ? 0 : tramoidB ? 2 : 1;
                return aScore - bScore;
            });
    }, [posicionSeleccionada, papeletas, hermanos, hermanoIdsAsignados, search, modoLibre, precios]);


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

    const renderPosiciones = (posiciones: any[], tIdx: number, sIdx: number, elemId: string, tipo: string, tramo: any, isCenter: boolean = false) => {
        return posiciones.map((pos) => (
            pos.hermanoId ? (
                /* POSICIÓN OCUPADA */
                <div
                    key={pos.id}
                    className={`flex items-center gap-2 bg-slate-900 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-sm relative group ${isCenter ? 'scale-110 border-2 border-amber-400/50' : ''}`}
                >
                    <UserCheck className={`${isCenter ? 'w-5 h-5' : 'w-3.5 h-3.5'} text-amber-400 shrink-0`} />
                    <div className="flex flex-col">
                        <span className="truncate max-w-[120px] leading-tight">{getHermanoName(pos.hermanoId)}</span>
                        <span className="text-white/40 text-[9px] font-black shrink-0">
                            Nº{getHermanoNumero(pos.hermanoId)}
                        </span>
                    </div>

                    <button
                        onClick={() => handleDesasignar(tIdx, sIdx, elemId, pos.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 shadow-md z-10"
                        title="Desasignar"
                    >
                        <X className="w-3 h-3 text-white" />
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
                            elemId: elemId,
                            elemTipo: tipo,
                            puestoNombre: pos.nombrePuesto,
                            posId: pos.id,
                            tramoId: tramo.id,
                            tramoNombre: tramo.nombre,
                        });
                        setSearch('');
                    }}
                    className={`flex items-center gap-1.5 border-2 border-dashed border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all ${isCenter ? 'scale-110 border-slate-300 bg-slate-50' : ''}`}
                >
                    {tipo === 'INSIGNIA'
                        ? <Disc className={`${isCenter ? 'w-5 h-5 text-amber-500' : 'w-3 h-3'}`} />
                        : <Ghost className="w-3 h-3" />
                    }
                    <span className="truncate max-w-[80px]">{pos.nombrePuesto}</span>
                    <Plus className="w-3 h-3" />
                </button>
            )
        ));
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
                    {tramo.subtramos.map((sub, sIdx) => {
                        // TRAMO 0 (CRUZ DE GUÍA): Layout Horizontal Específico
                        // Asumimos que tiene 3 elementos: Cruz (idx 0), Farol Y (idx 1), Farol Z (idx 2)
                        // Queremos: Farol Izq (idx 1) - Cruz (idx 0) - Farol Der (idx 2)
                        // Ajustamos indices según useCortejo: 
                        // useCortejo index 0: Cruz
                        // useCortejo index 1: Farol Izq
                        // useCortejo index 2: Farol Der
                        if (tramo.numero === 0) {
                            const cruz = sub.elementos[0];
                            const farolIzq = sub.elementos[1];
                            const farolDer = sub.elementos[2];

                            if (cruz && farolIzq && farolDer) {
                                return (
                                    <div key={sub.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-4">
                                        <div className="flex items-center justify-center gap-8">
                                            {/* Farol Izq */}
                                            <div className="flex flex-col items-center gap-2">
                                                {renderPosiciones(farolIzq.posiciones, tIdx, sIdx, farolIzq.id, farolIzq.tipo, tramo)}
                                                <span className="text-[9px] font-black uppercase text-slate-400 italic">{farolIzq.nombre}</span>
                                            </div>

                                            {/* Cruz Central */}
                                            <div className="flex flex-col items-center gap-2 -mt-6">
                                                {renderPosiciones(cruz.posiciones, tIdx, sIdx, cruz.id, cruz.tipo, tramo, true)}
                                                <span className="text-[9px] font-black uppercase text-slate-900 italic">{cruz.nombre}</span>
                                            </div>

                                            {/* Farol Der */}
                                            <div className="flex flex-col items-center gap-2">
                                                {renderPosiciones(farolDer.posiciones, tIdx, sIdx, farolDer.id, farolDer.tipo, tramo)}
                                                <span className="text-[9px] font-black uppercase text-slate-400 italic">{farolDer.nombre}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        }

                        // LAYOUT ESTÁNDAR PARA OTROS TRAMOS
                        return (
                            <div key={sub.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Subtramo {sub.numero}
                                </span>

                                {sub.elementos.map((elem) => {
                                    // LAYOUT HORIZONTAL PARA INSIGNIAS CON VARAS
                                    if (elem.tipo === 'INSIGNIA' && elem.posiciones.length > 1) {
                                        const portador = elem.posiciones.find(p => p.nombrePuesto === 'Portador');
                                        const varas = elem.posiciones.filter(p => p.nombrePuesto !== 'Portador');

                                        // Separar varas izquierda y derecha
                                        // Asumimos paridad simple: Vara 1, 3... Izq | Vara 2, 4... Der
                                        // O simplemente mitad y mitad
                                        const mid = Math.ceil(varas.length / 2);
                                        const varasIzq = varas.slice(0, mid);
                                        const varasDer = varas.slice(mid);

                                        return (
                                            <div key={elem.id} className="space-y-2 py-2">
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <div className="w-1 h-3 rounded-full bg-amber-400" />
                                                    <span className="text-[9px] font-black uppercase text-slate-400 italic">
                                                        {elem.nombre}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-center gap-4">
                                                    {/* Varas Izq */}
                                                    <div className="flex gap-2">
                                                        {renderPosiciones(varasIzq, tIdx, sIdx, elem.id, elem.tipo, tramo)}
                                                    </div>

                                                    {/* Insignia Central */}
                                                    {portador && (
                                                        <div className="transform -translate-y-2">
                                                            {renderPosiciones([portador], tIdx, sIdx, elem.id, elem.tipo, tramo, true)}
                                                        </div>
                                                    )}

                                                    {/* Varas Der */}
                                                    <div className="flex gap-2">
                                                        {renderPosiciones(varasDer, tIdx, sIdx, elem.id, elem.tipo, tramo)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // ELEMENTO NORMAL (Filas de nazarenos, Pasos, Insignias simples)
                                    return (
                                        <div key={elem.id} className={`space-y-2 flex flex-col ${elem.tipo === 'PASO' ? 'items-center py-6' : 'items-center'}`}>
                                            {/* Tipo de elemento */}
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1 h-3 rounded-full ${elem.tipo === 'INSIGNIA' ? 'bg-amber-400' : elem.tipo === 'PASO' ? 'bg-purple-500' : 'bg-slate-300'}`} />
                                                <span className="text-[9px] font-black uppercase text-slate-400 italic">
                                                    {elem.tipo === 'INSIGNIA' ? 'Insignia' : elem.tipo === 'PASO' ? 'Paso' : 'Nazarenos'}
                                                </span>
                                            </div>

                                            {/* Posiciones o Visual del Paso */}
                                            <div className={`flex flex-wrap gap-2 justify-center ${elem.tipo === 'PASO' ? 'scale-125' : ''}`}>
                                                {elem.tipo === 'PASO' ? (
                                                    <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black italic uppercase tracking-tighter shadow-xl shadow-slate-900/40 border-2 border-purple-500/50">
                                                        {elem.nombre}
                                                    </div>
                                                ) : (
                                                    renderPosiciones(elem.posiciones, tIdx, sIdx, elem.id, elem.tipo, tramo)
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
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
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase italic">
                                            TRAMO: <span className="text-slate-900 underline decoration-slate-300 decoration-2">{posicionSeleccionada.tramoNombre}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase italic">
                                            PUESTO: <span className="text-slate-900 underline decoration-slate-300 decoration-2">{posicionSeleccionada.puestoNombre}</span>
                                        </p>
                                    </div>
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

                            {/* Checkbox modo libre */}
                            <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={modoLibre}
                                    onChange={e => setModoLibre(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 accent-orange-500"
                                />
                                <span className="text-xs font-bold text-slate-500">
                                    Modo libre
                                    <span className="ml-1 font-normal text-slate-400">(mostrar hermanos de otros tramos)</span>
                                </span>
                            </label>
                        </div>

                        {/* Lista de candidatos */}
                        <div className="overflow-y-auto max-h-72 divide-y divide-slate-50">
                            {candidatos.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">
                                    No hay hermanos disponibles para este tramo
                                </div>
                            ) : (
                                candidatos.map(({ papeleta, hermano }) => {
                                    const tramoidPapeleta = (papeleta as any).tramoid as string | null;
                                    const esExacto = tramoidPapeleta === posicionSeleccionada.tramoId;
                                    const sinTramo = !tramoidPapeleta;
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
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                        Nº {hermano?.numeroHermano}
                                                    </p>
                                                    <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[8px] font-black text-slate-500 uppercase italic">
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {papeleta.observaciones}
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[8px] font-black text-slate-500 uppercase italic">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        {structure?.tramos.find(t => t.id === (papeleta as any).tramoid)?.nombre || 'Sin tramo'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {esExacto ? (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px] font-black uppercase">
                                                        Su tramo
                                                    </Badge>
                                                ) : sinTramo ? (
                                                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[9px] font-black uppercase">
                                                        Sin tramo
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-orange-100 text-orange-600 border-orange-200 text-[9px] font-black uppercase">
                                                        Otro tramo
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
