
'use client';

import React, { useState } from 'react';
import { useCortejo } from '@/presentation/hooks/useCortejo';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Plus, Ghost, Star, Disc, Trash2, RotateCcw, RefreshCw, User } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';

export default function CortejoTab() {
    const { structure, loading, addFila, addInsignia, removeElemento, resetCortejo } = useCortejo();
    const [isInsigniaModalOpen, setIsInsigniaModalOpen] = useState(false);
    const [insigniaData, setInsigniaData] = useState({ tramoIdx: 0, subIdx: 0, insertAt: 0, nombre: '', varas: 0 });

    if (loading) return <div className="p-8 text-center text-slate-400 italic">Sincronizando Estructura...</div>;

    const handleAddInsignia = () => {
        addInsignia(insigniaData.tramoIdx, insigniaData.subIdx, insigniaData.insertAt, insigniaData.nombre, insigniaData.varas);
        setIsInsigniaModalOpen(false);
        setInsigniaData({ tramoIdx: 0, subIdx: 0, insertAt: 0, nombre: '', varas: 0 });
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Diseño del Cortejo</h2>
                    <p className="text-sm text-slate-500 font-bold">Configura los tramos, insignias y número de filas.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => {
                        if (confirm('¿Deseas resetear el cortejo al estado base? Se perderán las personalizaciones.')) resetCortejo();
                    }}
                    className="rounded-2xl border-red-100 text-red-600 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest"
                >
                    <RefreshCw className="w-3 h-3 mr-2" /> Reiniciar Base
                </Button>
            </div>

            <div className="space-y-12">
                {structure?.tramos.map((tramo, tIdx) => (
                    <Card key={tramo.id} className="border-none shadow-none bg-transparent space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white font-black italic shadow-lg shadow-slate-900/20 text-lg">
                                {tramo.numero}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{tramo.nombre}</h3>
                                <Badge className="mt-1 bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase">{tramo.subtramos.length} Subtramos</Badge>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {tramo.subtramos.map((sub, sIdx) => (
                                <div key={sub.id} className="relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                                    <div className="absolute -top-3 left-10">
                                        <Badge className="bg-slate-900 text-white rounded-xl text-[10px] font-black px-6 py-1.5 shadow-md uppercase tracking-widest italic border-none">
                                            Subtramo {sub.numero}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-col gap-6 items-center">
                                        {/* Botón de inserción inicial */}
                                        <button
                                            onClick={() => {
                                                setInsigniaData({ ...insigniaData, tramoIdx: tIdx, subIdx: sIdx, insertAt: 0 });
                                                setIsInsigniaModalOpen(true);
                                            }}
                                            className="group flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-amber-500 transition-all uppercase tracking-widest"
                                        >
                                            <div className="h-[2px] w-8 bg-slate-100 group-hover:bg-amber-100" />
                                            <Plus className="w-3 h-3" /> Insertar Insignia
                                            <div className="h-[2px] w-8 bg-slate-100 group-hover:bg-amber-100" />
                                        </button>

                                        {sub.elementos.map((elem, eIdx) => (
                                            <React.Fragment key={elem.id}>
                                                <div className="w-full max-w-sm relative group">
                                                    <button
                                                        onClick={() => removeElemento(tIdx, sIdx, elem.id)}
                                                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg hover:scale-110 z-10"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {elem.tipo === 'INSIGNIA' ? (
                                                        <div className="p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-200 shadow-sm flex flex-col items-center gap-2 group-hover:scale-[1.02] transition-transform">
                                                            <div className="flex items-center gap-3">
                                                                <Disc className="w-6 h-6 text-amber-600" />
                                                                <span className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">{elem.nombre}</span>
                                                            </div>
                                                            {elem.posiciones.length > 1 && (
                                                                <div className="flex gap-2 mt-2">
                                                                    {elem.posiciones.slice(1).map((_, vIdx) => (
                                                                        <div key={vIdx} className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center">
                                                                            <Disc className="w-3 h-3 text-amber-600" />
                                                                        </div>
                                                                    ))}
                                                                    <span className="text-[8px] font-bold text-amber-600 uppercase">+{elem.posiciones.length - 1} Varas</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : elem.tipo === 'PASO' ? (
                                                        <div className="p-8 bg-purple-50 rounded-[2.5rem] border-4 border-purple-200 shadow-lg flex flex-col items-center gap-3">
                                                            <div className="w-20 h-[2px] bg-purple-300 mb-2" />
                                                            <span className="text-xl font-black text-purple-900 uppercase italic tracking-tighter">PASO DE {elem.nombre}</span>
                                                            <div className="w-20 h-[2px] bg-purple-300 mt-2" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-4">
                                                            {elem.posiciones.map((_, i) => (
                                                                <div key={i} className="flex-1 h-20 rounded-2xl border-2 border-slate-200 bg-white flex flex-col items-center justify-center shadow-sm group-hover:border-slate-400 transition-colors">
                                                                    <User className="w-6 h-6 text-slate-300 mb-1" />
                                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">Nazareno {i === 0 ? 'Izq' : 'Der'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Botón de inserción entre elementos */}
                                                {(elem.tipo !== 'PASO') && (
                                                    <button
                                                        onClick={() => {
                                                            setInsigniaData({ ...insigniaData, tramoIdx: tIdx, subIdx: sIdx, insertAt: eIdx + 1 });
                                                            setIsInsigniaModalOpen(true);
                                                        }}
                                                        className="group flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-amber-500 transition-all uppercase tracking-widest"
                                                    >
                                                        <div className="h-[2px] w-8 bg-slate-100 group-hover:bg-amber-100" />
                                                        <Plus className="w-3 h-3" /> Insertar Insignia
                                                        <div className="h-[2px] w-8 bg-slate-100 group-hover:bg-amber-100" />
                                                    </button>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex justify-center">
                                        <Button
                                            onClick={() => addFila(tIdx, sIdx)}
                                            className="rounded-2xl h-12 px-10 gap-2 bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                                        >
                                            <Plus className="w-4 h-4" /> Añadir Fila de Cirios
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal para Nueva Insignia */}
            <Modal
                isOpen={isInsigniaModalOpen}
                onClose={() => setIsInsigniaModalOpen(false)}
                title="Configurar Nueva Insignia"
            >
                <div className="space-y-6 pt-4 text-black">
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase italic tracking-tighter">Nombre de la Insignia</label>
                        <Input
                            placeholder="Ej: Guión de la Juventud..."
                            className="h-12 rounded-2xl font-bold"
                            value={insigniaData.nombre}
                            onChange={(e) => setInsigniaData({ ...insigniaData, nombre: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase italic tracking-tighter text-slate-400">¿Cuántas varas la acompañan? (Opcional)</label>
                        <div className="grid grid-cols-5 gap-3">
                            {[0, 2, 4, 6].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setInsigniaData({ ...insigniaData, varas: val })}
                                    className={`h-12 rounded-2xl font-black transition-all border-2 ${insigniaData.varas === val
                                        ? 'bg-amber-50 border-amber-500 text-amber-600'
                                        : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {val === 0 ? 'SOLO' : val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsInsigniaModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancelar</Button>
                        <Button
                            onClick={handleAddInsignia}
                            disabled={!insigniaData.nombre}
                            className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            Confirmar Inserción
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className="max-w-xl mx-auto p-10 bg-slate-900 rounded-[40px] border border-slate-800 text-center shadow-2xl">
                <p className="text-xs font-black text-white uppercase tracking-widest opacity-50">Nota de Organización</p>
                <p className="text-sm text-white mt-4 italic leading-relaxed font-bold">
                    "Las filas se añaden por parejas automáticamente. Las insignias delimitan los subtramos y permiten organizar al personal por bloques de antigüedad o preferencia."
                </p>
            </div>
        </div>
    );
}
