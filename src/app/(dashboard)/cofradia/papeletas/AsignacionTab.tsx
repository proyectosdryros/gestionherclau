'use client';

import React, { useState, useMemo } from 'react';
import { useCortejo } from '@/presentation/hooks/useCortejo';
import { usePapeletas } from '@/presentation/hooks/usePapeletas';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Search, UserCheck, X, Ghost, Disc, ChevronRight } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';

export default function AsignacionTab() {
    const { structure, loading: loadingCortejo, asignarHermano } = useCortejo();
    const { papeletas, loading: loadingPapeletas } = usePapeletas();
    const { hermanos, loading: loadingHermanos } = useHermanos();
    const [search, setSearch] = useState('');
    const [selectedPapeletaId, setSelectedPapeletaId] = useState<string | null>(null);

    const getHermanoName = (id: string) => {
        const h = hermanos.find(hermano => hermano.id === id);
        return h ? `${h.nombre} ${h.apellido1}` : 'Desconocido';
    };

    const loading = loadingCortejo || loadingPapeletas || loadingHermanos;

    // Filtrar papeletas pagadas y que coincidan con la búsqueda
    const filteredPapeletas = useMemo(() => {
        return papeletas.filter(p => {
            // En una app real filtraríamos por estado 'PAGADA' o 'EMITIDA'
            // p.estado === 'EMITIDA'
            const hermano = hermanos.find(h => h.id === p.hermanoId);
            const nombreCompleto = `${hermano?.nombre} ${hermano?.apellido1} ${hermano?.apellido2 || ''}`.toLowerCase();
            return nombreCompleto.includes(search.toLowerCase()) || hermano?.numeroHermano?.toString() === search;
        });
    }, [papeletas, hermanos, search]);

    const selectedPapeleta = useMemo(() =>
        papeletas.find(p => p.id === selectedPapeletaId),
        [papeletas, selectedPapeletaId]);

    const selectedHermano = useMemo(() =>
        hermanos.find(h => h.id === selectedPapeleta?.hermanoId),
        [hermanos, selectedPapeleta]);

    if (loading) return <div className="p-8 text-center text-slate-400 italic">Sincronizando datos...</div>;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20">

            {/* Sidebar de Papeletas Disponibles */}
            <div className="xl:col-span-4 space-y-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Papeletas de Sitio</h2>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar hermano o Nº..."
                            className="pl-10 rounded-2xl border-slate-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredPapeletas.length === 0 ? (
                            <p className="text-center py-10 text-slate-400 text-sm italic">No se encontraron papeletas</p>
                        ) : (
                            filteredPapeletas.map(p => {
                                const h = hermanos.find(herm => herm.id === p.hermanoId);
                                const isSelected = selectedPapeletaId === p.id;
                                // Verificar si ya está asignada
                                const isAssigned = structure?.tramos.some(t =>
                                    t.subtramos.some(s =>
                                        s.elementos.some(e =>
                                            e.posiciones.some(pos => pos.papeletaId === p.id)
                                        )
                                    )
                                );

                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPapeletaId(isSelected ? null : p.id)}
                                        disabled={isAssigned}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${isSelected
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                                            : isAssigned
                                                ? 'opacity-40 bg-slate-50 border-transparent grayscale'
                                                : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                                                    Nº {h?.numeroHermano || '--'}
                                                </span>
                                                {isAssigned && <Badge className="bg-green-500 text-white border-none text-[8px] uppercase">ASIGNADA</Badge>}
                                            </div>
                                            <p className={`font-bold mt-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                {h?.nombre} {h?.apellido1}
                                            </p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'text-slate-300 group-hover:text-slate-500'}`} />
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Vista del Cortejo para Asignación */}
            <div className="xl:col-span-8 space-y-8">
                {selectedPapeleta && (
                    <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl border-4 border-slate-800 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                                <UserCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Asignando a:</p>
                                <h3 className="text-xl font-black italic uppercase">{selectedHermano?.nombre} {selectedHermano?.apellido1}</h3>
                                <p className="text-xs font-bold text-amber-400">Selecciona un hueco vacío en el cortejo</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPapeletaId(null)} className="text-white hover:bg-white/10 rounded-full">
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                )}

                <div className="space-y-12">
                    {structure?.tramos.map((tramo, tIdx) => (
                        <Card key={tramo.id} className="border-none shadow-none bg-transparent space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black italic shadow-md">
                                    {tramo.numero}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{tramo.nombre}</h3>
                            </div>

                            {tramo.subtramos.map((sub, sIdx) => (
                                <div key={sub.id} className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-slate-200 text-black rounded-lg text-xs font-black px-4 py-1">SUBTRAMO {sub.numero}</Badge>
                                        <div className="h-[1px] flex-1 bg-slate-200" />
                                    </div>

                                    <div className="flex flex-col gap-4 items-center">
                                        {sub.elementos.map((elem, eIdx) => (
                                            <div key={elem.id} className="w-full space-y-3">
                                                <div className="flex items-center gap-3 px-2">
                                                    <div className={`w-1 h-4 rounded-full ${elem.tipo === 'INSIGNIA' ? 'bg-amber-400' : elem.tipo === 'PASO' ? 'bg-purple-500' : 'bg-slate-300'}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                                                        {elem.tipo === 'INSIGNIA' ? 'Insignia' : elem.tipo === 'PASO' ? 'Paso de Hermandad' : 'Fila de Nazarenos'}
                                                    </span>
                                                </div>

                                                <div className="flex gap-3">
                                                    {elem.posiciones.map((pos) => (
                                                        <button
                                                            key={pos.id}
                                                            disabled={!selectedPapeletaId && !pos.hermanoId}
                                                            onClick={() => {
                                                                if (pos.hermanoId) {
                                                                    asignarHermano(tIdx, sIdx, elem.id, pos.id, '', '');
                                                                } else if (selectedPapeletaId && selectedHermano) {
                                                                    // Validar Tramo
                                                                    const tramoPapeleta = selectedPapeleta?.tramoId;
                                                                    const tramoActual = structure.tramos[tIdx].id;

                                                                    if (tramoPapeleta && tramoPapeleta !== tramoActual) {
                                                                        const tramoNombrePapeleta = structure.tramos.find(t => t.id === tramoPapeleta)?.nombre || 'Desconocido';
                                                                        const confirmacion = confirm(`ATENCIÓN: Este hermano tiene papeleta para el tramo "${tramoNombrePapeleta}", pero intentas asignarlo al tramo "${structure.tramos[tIdx].nombre}". \n\n¿Deseas forzar esta asignación de todas formas?`);
                                                                        if (!confirmacion) return;
                                                                    }

                                                                    asignarHermano(tIdx, sIdx, elem.id, pos.id, selectedHermano.id, selectedPapeletaId);
                                                                    setSelectedPapeletaId(null);
                                                                }
                                                            }}
                                                            className={`flex-1 h-20 rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all shadow-sm ${pos.hermanoId
                                                                ? 'bg-slate-900 border-slate-900 text-white'
                                                                : selectedPapeletaId
                                                                    ? 'bg-white border-amber-400 border-dashed hover:border-amber-600 hover:bg-amber-50 cursor-pointer animate-pulse'
                                                                    : 'bg-white border-slate-100 opacity-50 cursor-default'
                                                                }`}
                                                        >
                                                            {pos.hermanoId ? (
                                                                <>
                                                                    <UserCheck className="w-6 h-6 mb-1 text-amber-400" />
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter truncate w-full px-2">
                                                                        {getHermanoName(pos.hermanoId)}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            asignarHermano(tIdx, sIdx, elem.id, pos.id, '', '');
                                                                        }}
                                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110"
                                                                    >
                                                                        <X className="w-3 h-3 text-white" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {elem.tipo === 'INSIGNIA' ? <Disc className="w-6 h-6 text-slate-200" /> : <Ghost className="w-6 h-6 text-slate-200" />}
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                                                                        {pos.nombrePuesto}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
