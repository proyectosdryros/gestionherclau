
'use client';

import React from 'react';
import { useCortejo } from '@/presentation/hooks/useCortejo';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Plus, Ghost, Star, Disc, Trash2, RotateCcw } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';

export default function CortejoTab() {
    const { structure, loading, addFila, addInsignia, removeElemento, resetCortejo } = useCortejo();

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando Estructura...</div>;

    return (
        <div className="space-y-12 pb-20">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Composición del Cortejo</h2>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mt-1">Temporada {structure?.temporada}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                    if (confirm('¿Deseas resetear el cortejo al estado base? Se perderán las personalizaciones.')) resetCortejo();
                }} className="rounded-xl border-slate-200 text-slate-900 hover:text-red-500 font-bold gap-2 bg-white">
                    <RotateCcw className="w-4 h-4" /> REINICIAR BASE
                </Button>
            </div>

            <div className="grid gap-12">
                {structure?.tramos.map((tramo, tIdx) => (
                    <section key={tramo.id} className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-slate-900/20">
                                    {tramo.numero}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-none uppercase italic tracking-tighter">{tramo.nombre}</h3>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-1">Tramo de Penitencia</p>
                                </div>
                            </div>
                            <Button onClick={() => addInsignia(tIdx)} variant="outline" size="sm" className="rounded-xl border-slate-300 font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2 text-slate-900">
                                <Star className="w-4 h-4 text-amber-500" /> AÑADIR INSIGNIA
                            </Button>
                        </div>

                        {tramo.subtramos.map((sub, sIdx) => (
                            <div key={sub.id} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-slate-200 text-black rounded-lg text-xs border-none font-black px-4 py-1.5 shadow-sm">
                                        SUBTRAMO {sub.numero}
                                    </Badge>
                                    <div className="h-[2px] flex-1 bg-slate-100" />
                                </div>

                                <div className="flex flex-col gap-6 items-center max-w-xl mx-auto py-4">
                                    {sub.elementos.map((elem) => (
                                        <div key={elem.id} className="group relative w-full flex justify-center">
                                            {elem.tipo === 'INSIGNIA' ? (
                                                <Card className="border-amber-200 bg-amber-50 shadow-sm rounded-3xl p-5 flex items-center justify-between w-full max-w-md border-2">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner border border-amber-200">
                                                            <Disc className="w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Insignia</p>
                                                            <p className="font-black text-slate-900 text-xl leading-none italic">{elem.nombre}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ) : (
                                                <div className="flex gap-8 w-full max-w-md justify-center">
                                                    {elem.posiciones.map((pos) => (
                                                        <div key={pos.id} className="flex-1 h-20 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center relative hover:border-slate-400 transition-all shadow-sm group-hover:shadow-md overflow-hidden">
                                                            <Ghost className="w-7 h-7 text-slate-300 opacity-50" />
                                                            <span className="text-[10px] absolute bottom-2 font-black text-slate-900 uppercase tracking-tighter italic">NAZARENO</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Delete button (hidden by default) */}
                                            <button
                                                onClick={() => removeElemento(tIdx, sIdx, elem.id)}
                                                className="absolute top-1/2 -translate-y-1/2 -right-16 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-95 z-10 hover:bg-red-600"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Action to add row */}
                                    <button
                                        onClick={() => addFila(tIdx, sIdx)}
                                        className="w-full max-w-md h-16 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50/50 hover:bg-white hover:border-slate-900 hover:text-slate-900 text-slate-900 transition-all gap-3 font-black text-xs uppercase italic tracking-widest shadow-sm"
                                    >
                                        <Plus className="w-5 h-5 text-slate-900" /> AÑADIR FILA DE NAZARENOS
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>
                ))}
            </div>

            <div className="max-w-xl mx-auto p-10 bg-slate-900 rounded-[40px] border border-slate-800 text-center shadow-2xl">
                <p className="text-xs font-black text-white uppercase tracking-widest opacity-50">Nota de Organización</p>
                <p className="text-sm text-white mt-4 italic leading-relaxed font-bold">
                    "Las filas se añaden por parejas automáticamente. Las insignias delimitan los subtramos y permiten organizar al personal por bloques de antigüedad o preferencia."
                </p>
            </div>
        </div>
    );
}
