
'use client';

import React from 'react';
import { useCortejo } from '@/presentation/hooks/useCortejo';
import { Card, CardHeader, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Plus, Minus, Ghost, Star, Disc, Trash2, RotateCcw } from 'lucide-react';
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
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Temporada {structure?.temporada}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                    if (confirm('¿Deseas resetear el cortejo al estado base? Se perderán las personalizaciones.')) resetCortejo();
                }} className="rounded-xl border-slate-200 text-slate-400 hover:text-red-500 font-bold gap-2">
                    <RotateCcw className="w-4 h-4" /> REINICIAR BASE
                </Button>
            </div>

            <div className="grid gap-10">
                {structure?.tramos.map((tramo, tIdx) => (
                    <section key={tramo.id} className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-slate-900/20">
                                    {tramo.numero}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-none">{tramo.nombre}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tramo de Penitencia</p>
                                </div>
                            </div>
                            <Button onClick={() => addInsignia(tIdx)} variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2">
                                <Star className="w-4 h-4 text-amber-500" /> AÑADIR INSIGNIA
                            </Button>
                        </div>

                        {tramo.subtramos.map((sub, sIdx) => (
                            <div key={sub.id} className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-slate-100 text-slate-600 rounded-lg text-[10px] border-none">Subtramo {sub.numero}</Badge>
                                    <div className="h-[1px] flex-1 bg-slate-100" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {sub.elementos.map((elem) => (
                                        <div key={elem.id} className="group relative">
                                            {elem.tipo === 'INSIGNIA' ? (
                                                <Card className="border-amber-100 bg-amber-50/20 shadow-none rounded-2xl p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                                            <Disc className="w-5 h-5 shadow-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-amber-600/50 uppercase tracking-widest">Insignia</p>
                                                            <p className="font-bold text-slate-800 leading-none">{elem.nombre}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {elem.posiciones.map((pos) => (
                                                        <div key={pos.id} className="flex-1 h-14 bg-white border border-slate-100 rounded-xl flex items-center justify-center relative hover:border-slate-300 transition-colors shadow-sm">
                                                            <Ghost className="w-4 h-4 text-slate-200" />
                                                            <span className="text-[8px] absolute bottom-1 font-bold text-slate-300 uppercase tracking-tighter">Nazareno</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Delete button (hidden by default) */}
                                            <button
                                                onClick={() => removeElemento(tIdx, sIdx, elem.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-95"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Action to add row */}
                                    <button
                                        onClick={() => addFila(tIdx, sIdx)}
                                        className="h-14 border border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50/50 hover:bg-white hover:border-slate-400 hover:text-slate-900 text-slate-400 transition-all gap-2 font-bold text-xs"
                                    >
                                        <Plus className="w-4 h-4" /> AÑADIR FILA
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>
                ))}
            </div>

            <div className="max-w-xl mx-auto p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nota de Administración</p>
                <p className="text-sm text-slate-600 mt-2 italic leading-relaxed">
                    Las filas se añaden por parejas automáticamente. Las insignias delimitan los subtramos y permiten organizar al personal por bloques de antigüedad o preferencia.
                </p>
            </div>
        </div>
    );
}
