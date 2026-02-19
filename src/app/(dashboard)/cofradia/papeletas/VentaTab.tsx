
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { InsForgePrecioRepository } from '@/infrastructure/repositories/insforge/InsForgePrecioRepository';
import { VenderPapeletaUseCase } from '@/core/use-cases/cofradia/VenderPapeletaUseCase';
import { ConfiguracionPrecio, TipoPrecio } from '@/core/domain/entities/ConfiguracionPrecio';
import { Search, ShoppingCart, User, Ghost, Star, Disc, Flame, ShieldAlert, Heart, Info, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const precioRepo = new InsForgePrecioRepository();
const ventaUseCase = new VenderPapeletaUseCase();

const IconMap: Record<string, React.ReactNode> = {
    'NAZARENO': <Ghost className="w-5 h-5" />,
    'VARA': <Disc className="w-5 h-5" />,
    'INSIGNIA': <Star className="w-5 h-5" />,
    'BOCINA': <Info className="w-5 h-5" />,
    'FAROL': <Flame className="w-5 h-5" />,
    'CRUZ_GUIA': <ShieldAlert className="w-5 h-5" />,
    'PAPELETA_SITIO': <ShoppingCart className="w-5 h-5" />,
    'COSTALERO': <Heart className="w-5 h-5" />,
    'PAPELETA_SIMBOLICA': <Info className="w-5 h-5" />,
};

export default function VentaTab() {
    const { hermanos } = useHermanos();
    const [precios, setPrecios] = useState<ConfiguracionPrecio[]>([]);
    const [selectedHermanoId, setSelectedHermanoId] = useState<string | null>(null);
    const [selectedPrecioId, setSelectedPrecioId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadPrecios = async () => {
            const allPrecios = await precioRepo.findAll({ activo: true });
            const cofradiaTypes: TipoPrecio[] = [
                'PAPELETA_SITIO', 'PAPELETA_SIMBOLICA', 'CRUZ_GUIA',
                'NAZARENO', 'VARA', 'BOCINA', 'INSIGNIA', 'FAROL', 'COSTALERO'
            ];
            setPrecios(allPrecios.filter(p => cofradiaTypes.includes(p.tipo as TipoPrecio)));
        };
        loadPrecios();
    }, []);

    const handleVenta = async () => {
        if (!selectedHermanoId || !selectedPrecioId) return;
        try {
            setLoading(true);
            await ventaUseCase.execute({
                hermanoId: selectedHermanoId,
                precioId: selectedPrecioId,
                anio: new Date().getFullYear(),
                observaciones: 'Venta Directa'
            });
            alert('¡Venta realizada con éxito!');
            setSelectedHermanoId(null);
            setSelectedPrecioId(null);
            setSearchTerm('');
        } catch (error: any) {
            alert(error.message || 'Error en la venta');
        } finally {
            setLoading(false);
        }
    };

    const filteredHermanos = hermanos.filter(h =>
        `${h.nombre} ${h.apellido1} ${h.numeroHermano}`.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 4);

    const selectedHermano = hermanos.find(h => h.id === selectedHermanoId);
    const selectedPrecio = precios.find(p => p.id === selectedPrecioId);

    return (
        <div className="grid lg:grid-cols-3 gap-8 p-4">
            <div className="lg:col-span-2 space-y-8">
                {/* 1. SELECCIÓN DE HERMANO */}
                <Card className="border-slate-100 shadow-none p-6 rounded-2xl">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">1. Identificar Hermano</h2>
                    {!selectedHermanoId ? (
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <Input
                                placeholder="Escribe nombre o número..."
                                className="pl-12 h-14 text-lg border-slate-100 bg-slate-50/50 rounded-2xl focus:bg-white transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-20">
                                    {filteredHermanos.map(h => (
                                        <button key={h.id} onClick={() => setSelectedHermanoId(h.id)} className="w-full p-4 hover:bg-slate-50 text-left border-b last:border-0 flex justify-between items-center group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">{h.nombre[0]}{h.apellido1[0]}</div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-none">{h.nombre} {h.apellido1}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Hermano {h.numeroHermano}</p>
                                                </div>
                                            </div>
                                            <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center"><User className="w-5 h-5 text-slate-400" /></div>
                                <div>
                                    <p className="font-black text-slate-900">{selectedHermano?.nombre} {selectedHermano?.apellido1}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nº {selectedHermano?.numeroHermano}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedHermanoId(null)} className="text-red-500 font-bold hover:bg-red-50 rounded-lg">QUITAR</Button>
                        </div>
                    )}
                </Card>

                {/* 2. SELECCIÓN DE PRODUCTO */}
                <div className={!selectedHermanoId ? 'opacity-30 pointer-events-none grayscale' : ''}>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2 italic">2. Seleccionar Concepto</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {precios.map(precio => (
                            <button key={precio.id} onClick={() => setSelectedPrecioId(precio.id)} className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 relative overflow-hidden group shadow-sm ${selectedPrecioId === precio.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                <div className={`transition-colors h-10 w-10 rounded-xl flex items-center justify-center ${selectedPrecioId === precio.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 group-hover:text-primary group-hover:bg-primary/5'}`}>
                                    {IconMap[precio.tipo] || <Info className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{precio.nombre}</p>
                                    <p className="text-lg font-black text-slate-900 tracking-tighter mt-1">{formatCurrency(precio.importe)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RESUMEN Y COBRO */}
            <div className="space-y-4">
                <Card className="p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 bg-white sticky top-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b pb-4">Carrito de Venta</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Papeleta</span>
                            <span className="text-sm font-black text-slate-900">{selectedPrecio?.nombre || '--'}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-y border-dashed border-slate-100">
                            <span className="text-lg font-black text-slate-900 italic">Total</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                {selectedPrecio ? formatCurrency(selectedPrecio.importe) : '0,00 €'}
                            </span>
                        </div>
                    </div>
                    <Button
                        className="w-full h-16 mt-8 rounded-2xl text-lg font-black bg-slate-900 text-white hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/20 disabled:opacity-20"
                        disabled={!selectedHermanoId || !selectedPrecioId || loading}
                        onClick={handleVenta}
                    >
                        {loading ? 'EMITIENDO...' : 'COBRAR AHORA'}
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6 bg-slate-50 p-3 rounded-xl border border-dashed">
                        Se generará el recibo en Tesorería y la papeleta en Cofradía.
                    </p>
                </Card>
            </div>
        </div>
    );
}
