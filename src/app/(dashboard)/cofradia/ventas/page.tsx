
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { InsForgePrecioRepository } from '@/infrastructure/repositories/insforge/InsForgePrecioRepository';
import { VenderPapeletaUseCase } from '@/core/use-cases/cofradia/VenderPapeletaUseCase';
import { ConfiguracionPrecio, TipoPrecio } from '@/core/domain/entities/ConfiguracionPrecio';
import { Search, ShoppingCart, ArrowLeft, User, Ghost, Star, Disc, Flame, ShieldAlert, Heart, Info, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

// Instancias
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

export default function VentaPapeletasPage() {
    const router = useRouter();
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
                observaciones: 'Venta TPV'
            });
            alert('¡Venta realizada!');
            setSelectedHermanoId(null);
            setSelectedPrecioId(null);
            setSearchTerm('');
        } catch (error: any) {
            alert(error.message || 'Error al realizar la venta');
        } finally {
            setLoading(false);
        }
    };

    const filteredHermanos = hermanos.filter(h =>
        `${h.nombre} ${h.apellido1} ${h.apellido2 || ''} ${h.numeroHermano}`.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 4);

    const selectedHermano = hermanos.find(h => h.id === selectedHermanoId);
    const selectedPrecio = precios.find(p => p.id === selectedPrecioId);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-white min-h-screen text-slate-900">
            {/* Header Minimalista */}
            <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-light tracking-tight">Terminal de Papeletas</h1>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Columna Izquierda: Selección */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Sección 1: Hermano */}
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold mb-4">1. Identificar Hermano</h2>
                        {!selectedHermanoId ? (
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Nombre o número de hermano..."
                                    className="pl-12 h-14 text-lg border-slate-100 bg-slate-50/50 focus:bg-white transition-all rounded-2xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-20">
                                        {filteredHermanos.map(h => (
                                            <button
                                                key={h.id}
                                                onClick={() => setSelectedHermanoId(h.id)}
                                                className="w-full p-4 hover:bg-slate-50 text-left border-b last:border-0 flex justify-between items-center group/item"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase text-black">
                                                        {h.nombre[0]}{h.apellido1[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{h.getNombreCompleto()}</p>
                                                        <p className="text-xs text-slate-400">Hermano Nº {h.numeroHermano}</p>
                                                    </div>
                                                </div>
                                                <Check className="w-4 h-4 text-primary opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{selectedHermano?.nombre} {selectedHermano?.apellido1}</p>
                                        <p className="text-sm text-slate-500">Hermano Nº {selectedHermano?.numeroHermano}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedHermanoId(null)} className="text-slate-400 hover:text-red-500 font-bold">CAMBIAR</Button>
                            </div>
                        )}
                    </section>

                    {/* Sección 2: Papeleta */}
                    <section className={!selectedHermanoId ? 'opacity-30 pointer-events-none' : ''}>
                        <h2 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold mb-4">2. Seleccionar Papeleta</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {precios.map(precio => (
                                <button
                                    key={precio.id}
                                    onClick={() => setSelectedPrecioId(precio.id)}
                                    className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center gap-3 relative overflow-hidden group
                                        ${selectedPrecioId === precio.id
                                            ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-lg'
                                            : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`transition-colors ${selectedPrecioId === precio.id ? 'text-slate-900' : 'text-slate-300 group-hover:text-slate-600'}`}>
                                        {IconMap[precio.tipo] || <Info className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{precio.nombre}</span>
                                    <span className="text-sm font-black text-slate-900">{formatCurrency(precio.importe)}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Columna Derecha: Confirmación Minimalista */}
                <div className="space-y-6">
                    <div className={`p-8 rounded-3xl border border-slate-200 transition-all bg-white shadow-2xl shadow-slate-200/50`}>
                        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold mb-8">Resumen Cobro</h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span className="text-sm">Subtotal</span>
                                <span className="font-mono">{selectedPrecio ? formatCurrency(selectedPrecio.importe) : '0,00 €'}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-sm">Gastos emisión</span>
                                <span className="font-mono">0,00 €</span>
                            </div>
                            <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                                <span className="text-xl font-bold text-slate-900 italic">Total</span>
                                <span className="text-3xl font-black tracking-tighter text-slate-900">
                                    {selectedPrecio ? formatCurrency(selectedPrecio.importe) : '0,00 €'}
                                </span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-16 mt-10 rounded-2xl text-lg font-black bg-slate-900 text-white hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                            disabled={!selectedHermanoId || !selectedPrecioId || loading}
                            onClick={handleVenta}
                        >
                            {loading ? 'EMITIENDO...' : 'EMITIR Y COBRAR'}
                        </Button>
                    </div>

                    <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold px-4">
                        El sistema generará automáticamente el apunte contable y la solicitud de puesto.
                    </p>
                </div>
            </div>
        </div>
    );
}
