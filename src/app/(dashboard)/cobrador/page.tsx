'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { useRecibos } from '@/presentation/hooks/useRecibos';
import { usePrecios } from '@/presentation/hooks/usePrecios';
import { cn, formatCurrency } from '@/lib/utils';
import {
    MapPin,
    Search,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Navigation,
    Phone,
    User,
    Euro,
    Loader2,
    RotateCcw,
    Map as MapIcon,
    List,
    X,
    Home,
    SquareCheck
} from 'lucide-react';
import { Hermano } from '@/core/domain/entities/Hermano';

const MONTHS_FULL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_FULL_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// --- Sub-componentes ---

function StatusBadge({ paidCount }: { paidCount: number }) {
    const all = paidCount === 12;
    const partial = paidCount > 0 && !all;
    return (
        <span className={cn(
            'inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full',
            all ? 'bg-emerald-100 text-emerald-700' :
                partial ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-600'
        )}>
            {all ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {paidCount}/12
        </span>
    );
}

function MapaHermano({ direccion, nombre }: { direccion: string; nombre: string }) {
    const query = encodeURIComponent(`${direccion}, Ayamonte, España`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    const wazeUrl = `https://www.waze.com/ul?q=${query}&navigate=yes`;

    return (
        <div className="bg-slate-900 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm text-slate-300 font-medium truncate">{direccion}</p>
            </div>
            <div className="relative h-48 bg-slate-800">
                <iframe
                    src={`https://maps.google.com/maps?q=${query}&output=embed&z=16`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    title={`Mapa ${nombre}`}
                />
            </div>
            <div className="flex gap-2 p-3">
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-2 rounded-xl transition-colors"
                >
                    <Navigation className="w-3 h-3" />
                    Google Maps
                </a>
                <a
                    href={wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#33CCFF] hover:bg-[#00BBEE] text-slate-900 text-xs font-black py-2 rounded-xl transition-colors"
                >
                    <Navigation className="w-3 h-3" />
                    Waze
                </a>
            </div>
        </div>
    );
}

// Grid de meses con selección individual
interface MonthGridProps {
    paidMonths: number[];
    selectedMonths: number[];
    onToggleMonth: (month: number) => void;
    isProcessing: boolean;
}

function MonthGrid({ paidMonths, selectedMonths, onToggleMonth, isProcessing }: MonthGridProps) {
    return (
        <div className="grid grid-cols-6 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                const paid = paidMonths.includes(m);
                const selected = selectedMonths.includes(m);
                return (
                    <button
                        key={m}
                        onClick={() => !paid && !isProcessing && onToggleMonth(m)}
                        disabled={paid || isProcessing}
                        className={cn(
                            'flex flex-col items-center justify-center py-2.5 rounded-xl text-center transition-all duration-150 select-none',
                            paid
                                // Mes pagado: verde, no clicable
                                ? 'bg-emerald-900/60 border border-emerald-700/50 cursor-default'
                                : selected
                                    // Mes seleccionado para pagar: azul/primary
                                    ? 'bg-primary border border-primary/70 shadow-md shadow-primary/30 scale-105 cursor-pointer active:scale-100'
                                    // Mes pendiente sin seleccionar: gris clicable
                                    : 'bg-slate-700/50 border border-slate-600/40 cursor-pointer hover:bg-slate-600/60 hover:border-slate-500/60 active:scale-95'
                        )}
                    >
                        <span className={cn(
                            'text-[9px] font-black uppercase leading-none mb-1',
                            paid ? 'text-emerald-400' : selected ? 'text-white' : 'text-slate-400'
                        )}>
                            {MONTHS_FULL[m - 1]}
                        </span>
                        {paid
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            : selected
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-500/50" />
                        }
                    </button>
                );
            })}
        </div>
    );
}

interface HermanoCardProps {
    hermano: Hermano;
    paidMonths: number[];
    cuotaEstandard: number;
    currentYear: number;
    isExpanded: boolean;
    isProcessing: boolean;
    onToggle: () => void;
    onPaySelected: (hermanoId: string, months: number[]) => void;
    onPayAll: (hermanoId: string) => void;
}

function HermanoCard({
    hermano,
    paidMonths,
    cuotaEstandard,
    currentYear,
    isExpanded,
    isProcessing,
    onToggle,
    onPaySelected,
    onPayAll
}: HermanoCardProps) {
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

    const paidCount = paidMonths.length;
    const pendingCount = 12 - paidCount;
    const pendingAmount = pendingCount * cuotaEstandard;
    const isFullyPaid = paidCount === 12;

    const allPendingMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(m => !paidMonths.includes(m));
    const selectedTotal = selectedMonths.length * cuotaEstandard;
    const allSelected = selectedMonths.length === allPendingMonths.length && allPendingMonths.length > 0;

    const toggleMonth = useCallback((month: number) => {
        setSelectedMonths(prev =>
            prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month].sort((a, b) => a - b)
        );
    }, []);

    const toggleAll = useCallback(() => {
        setSelectedMonths(allSelected ? [] : [...allPendingMonths]);
    }, [allSelected, allPendingMonths]);

    // Reset selección cuando se colapsa
    const handleToggle = () => {
        if (isExpanded) setSelectedMonths([]);
        onToggle();
    };

    return (
        <div className={cn(
            'rounded-2xl border transition-all duration-300 overflow-hidden',
            isExpanded
                ? 'border-primary/30 bg-slate-800/50 shadow-lg shadow-primary/10'
                : 'border-slate-700/50 bg-slate-800/30',
            isFullyPaid && 'opacity-60'
        )}>
            {/* Cabecera */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center gap-3 p-4 text-left"
            >
                <div className={cn(
                    'w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-black',
                    isFullyPaid
                        ? 'bg-emerald-900/50 text-emerald-400'
                        : pendingCount === 12
                            ? 'bg-red-900/50 text-red-400'
                            : 'bg-amber-900/50 text-amber-400'
                )}>
                    <span className="text-xs leading-none">#</span>
                    <span className="text-sm leading-none">{hermano.numeroHermano}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm truncate leading-tight">
                        {hermano.getNombreCompleto()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <StatusBadge paidCount={paidCount} />
                        {!isFullyPaid && (
                            <span className="text-xs text-red-400 font-bold">
                                {formatCurrency(pendingAmount)} pendiente
                            </span>
                        )}
                    </div>
                </div>

                <ChevronRight className={cn(
                    'w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200',
                    isExpanded && 'rotate-90'
                )} />
            </button>

            {/* Panel expandido */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">

                    {/* Grid de meses */}
                    {!isFullyPaid && (
                        <>
                            {/* Cabecera del grid con botón seleccionar todo */}
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                    Toca los meses para seleccionar:
                                </p>
                                <button
                                    onClick={toggleAll}
                                    disabled={isProcessing}
                                    className={cn(
                                        'flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all',
                                        allSelected
                                            ? 'bg-primary/20 border-primary/40 text-primary'
                                            : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:text-white'
                                    )}
                                >
                                    <SquareCheck className="w-3 h-3" />
                                    {allSelected ? 'DESMARCAR TODO' : 'SELECCIONAR TODO'}
                                </button>
                            </div>

                            <MonthGrid
                                paidMonths={paidMonths}
                                selectedMonths={selectedMonths}
                                onToggleMonth={toggleMonth}
                                isProcessing={isProcessing}
                            />

                            {/* Panel de cobro */}
                            {selectedMonths.length > 0 ? (
                                /* Si hay meses seleccionados → botón cobrar selección */
                                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                    {/* Resumen de meses seleccionados */}
                                    <div className="flex flex-wrap gap-1">
                                        {selectedMonths.map(m => (
                                            <button
                                                key={m}
                                                onClick={() => toggleMonth(m)}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-primary/20 border border-primary/40 text-primary text-[10px] font-black rounded-lg hover:bg-red-900/40 hover:border-red-700/40 hover:text-red-300 transition-colors"
                                            >
                                                {MONTHS_FULL_ES[m - 1]}
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Total y botón cobrar seleccionados */}
                                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                {selectedMonths.length} {selectedMonths.length === 1 ? 'mes' : 'meses'} seleccionado{selectedMonths.length !== 1 ? 's' : ''}
                                            </p>
                                            <p className="text-xl font-black text-white">{formatCurrency(selectedTotal)}</p>
                                        </div>
                                        <button
                                            onClick={() => onPaySelected(hermano.id, selectedMonths)}
                                            disabled={isProcessing}
                                            className={cn(
                                                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95',
                                                isProcessing
                                                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                                    : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                                            )}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Euro className="w-4 h-4" />
                                                    COBRAR
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Si no es todo → mostrar también botón cobrar todo */}
                                    {!allSelected && (
                                        <button
                                            onClick={() => onPayAll(hermano.id)}
                                            disabled={isProcessing}
                                            className="w-full py-2 text-xs font-black text-slate-500 hover:text-slate-300 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-colors"
                                        >
                                            O cobrar los {pendingCount} meses pendientes ({formatCurrency(pendingAmount)})
                                        </button>
                                    )}
                                </div>
                            ) : (
                                /* Sin selección → mostrar botón cobrar todo como secundario */
                                <div className="flex items-center justify-between p-3 bg-slate-700/20 border border-slate-700/30 rounded-xl">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total pendiente</p>
                                        <p className="text-lg font-black text-slate-400">{formatCurrency(pendingAmount)}</p>
                                    </div>
                                    <button
                                        onClick={() => onPayAll(hermano.id)}
                                        disabled={isProcessing}
                                        className={cn(
                                            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 border',
                                            isProcessing
                                                ? 'bg-slate-600 text-slate-400 cursor-not-allowed border-transparent'
                                                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-600/50'
                                        )}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'COBRAR TODO'
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {isFullyPaid && (
                        <>
                            <MonthGrid
                                paidMonths={paidMonths}
                                selectedMonths={[]}
                                onToggleMonth={() => { }}
                                isProcessing={false}
                            />
                            <div className="flex items-center gap-2 p-3 bg-emerald-900/30 border border-emerald-700/30 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <p className="text-sm text-emerald-300 font-bold">¡Cuotas al día! Todo pagado en {currentYear}.</p>
                            </div>
                        </>
                    )}

                    {/* Info de contacto y dirección */}
                    <div className="space-y-2">
                        {hermano.telefono && (
                            <a
                                href={`tel:${hermano.telefono}`}
                                className="flex items-center gap-2 p-2.5 bg-slate-700/40 rounded-xl text-sm text-slate-300 hover:bg-slate-700/60 transition-colors"
                            >
                                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="font-medium">{hermano.telefono}</span>
                            </a>
                        )}
                        {hermano.direccion && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2.5 bg-slate-700/40 rounded-xl text-sm text-slate-300">
                                    <Home className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="font-medium">{hermano.direccion}</span>
                                </div>
                                <MapaHermano direccion={hermano.direccion} nombre={hermano.getNombreCompleto()} />
                            </div>
                        )}
                        {!hermano.direccion && (
                            <div className="flex items-center gap-2 p-2.5 bg-slate-700/30 rounded-xl text-sm text-slate-500">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="italic">Dirección no registrada</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Página principal ---

type FilterType = 'pendiente' | 'pagado' | 'todos';
type ViewType = 'lista' | 'mapa';

export default function CobradorPage() {
    const { hermanos, loading: loadingHermanos } = useHermanos();
    const { recibos, loading: loadingRecibos, crearRecibo } = useRecibos();
    const { precios } = usePrecios({ activo: true, tipo: 'CUOTA' });

    const currentYear = new Date().getFullYear();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('pendiente');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [view, setView] = useState<ViewType>('lista');
    const [successId, setSuccessId] = useState<string | null>(null);

    const cuotaEstandard = useMemo(() => {
        const config = precios.find(p => p.activo && p.nombre.toUpperCase().includes('CUOT'))
            || precios.find(p => p.activo);
        return config ? config.importe : 1.50;
    }, [precios]);

    const pagosPorHermano = useMemo(() => {
        const mapping: Record<string, number[]> = {};
        recibos.forEach(r => {
            if (r.tipo === 'CUOTA_ORDINARIA' && r.estado === 'COBRADO') {
                const reciboYear = new Date(r.fechaEmision).getFullYear();
                if (reciboYear === currentYear) {
                    if (!mapping[r.hermanoId]) mapping[r.hermanoId] = [];
                    const monthNumber = new Date(r.fechaEmision).getMonth() + 1;
                    if (!mapping[r.hermanoId].includes(monthNumber)) {
                        mapping[r.hermanoId].push(monthNumber);
                    }
                }
            }
        });
        return mapping;
    }, [recibos, currentYear]);

    const stats = useMemo(() => {
        const total = hermanos.length;
        const alDia = hermanos.filter(h => (pagosPorHermano[h.id]?.length || 0) === 12).length;
        const pendiente = total - alDia;
        const totalPendiente = hermanos.reduce((acc, h) => {
            const paid = pagosPorHermano[h.id]?.length || 0;
            return acc + (12 - paid) * cuotaEstandard;
        }, 0);
        return { total, alDia, pendiente, totalPendiente };
    }, [hermanos, pagosPorHermano, cuotaEstandard]);

    const filteredHermanos = useMemo(() => {
        return hermanos
            .filter(h => {
                const paidCount = pagosPorHermano[h.id]?.length || 0;
                if (filter === 'pendiente') return paidCount < 12;
                if (filter === 'pagado') return paidCount === 12;
                return true;
            })
            .filter(h => {
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                return (
                    `${h.nombre} ${h.apellido1} ${h.apellido2 || ''}`.toLowerCase().includes(term) ||
                    h.numeroHermano.toString().includes(term) ||
                    (h.direccion || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                const pendA = 12 - (pagosPorHermano[a.id]?.length || 0);
                const pendB = 12 - (pagosPorHermano[b.id]?.length || 0);
                return pendB - pendA;
            });
    }, [hermanos, pagosPorHermano, filter, searchTerm]);

    // Función genérica para cobrar una lista de meses
    const processPayment = useCallback(async (hermanoId: string, monthsToPay: number[]) => {
        if (monthsToPay.length === 0) return;
        setProcessingId(hermanoId);
        try {
            for (const monthNumber of monthsToPay) {
                const jsMonth = monthNumber - 1;
                const dateObj = new Date(Date.UTC(currentYear, jsMonth, 1, 12, 0, 0));
                await crearRecibo({
                    hermanoId,
                    concepto: `Cuota ${MONTHS_FULL_ES[jsMonth]} ${currentYear}`,
                    importe: cuotaEstandard,
                    estado: 'COBRADO',
                    tipo: 'CUOTA_ORDINARIA',
                    fechaEmision: dateObj,
                    observaciones: 'Cobrado desde sección Cobrador'
                });
            }
            setSuccessId(hermanoId);
            setTimeout(() => setSuccessId(null), 3000);
            setExpandedId(null);
        } catch (err) {
            console.error('Error al registrar cobro:', err);
            alert('Error al procesar el cobro. Inténtalo de nuevo.');
        } finally {
            setProcessingId(null);
        }
    }, [currentYear, cuotaEstandard, crearRecibo]);

    const handlePaySelected = useCallback((hermanoId: string, months: number[]) => {
        processPayment(hermanoId, months);
    }, [processPayment]);

    const handlePayAll = useCallback((hermanoId: string) => {
        const paidMonths = pagosPorHermano[hermanoId] || [];
        const pending = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(m => !paidMonths.includes(m));
        processPayment(hermanoId, pending);
    }, [pagosPorHermano, processPayment]);

    const isLoading = loadingHermanos || loadingRecibos;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header fijo */}
            <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
                <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Cobrador</h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Campaña {currentYear} · {stats.pendiente} pendientes
                            </p>
                        </div>
                        <div className="flex items-center bg-slate-800 rounded-xl p-1 gap-1">
                            <button
                                onClick={() => setView('lista')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all',
                                    view === 'lista' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                )}
                            >
                                <List className="w-3.5 h-3.5" />
                                Lista
                            </button>
                            <button
                                onClick={() => setView('mapa')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all',
                                    view === 'mapa' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                )}
                            >
                                <MapIcon className="w-3.5 h-3.5" />
                                Mapa
                            </button>
                        </div>
                    </div>

                    {/* Stats rápidas */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-red-950/50 border border-red-800/30 rounded-xl p-2.5 text-center">
                            <p className="text-xl font-black text-red-400">{stats.pendiente}</p>
                            <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-wider">Pendientes</p>
                        </div>
                        <div className="bg-emerald-950/50 border border-emerald-800/30 rounded-xl p-2.5 text-center">
                            <p className="text-xl font-black text-emerald-400">{stats.alDia}</p>
                            <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider">Al día</p>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 text-center">
                            <p className="text-sm font-black text-primary leading-tight">{formatCurrency(stats.totalPendiente)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sin cobrar</p>
                        </div>
                    </div>

                    {/* Búsqueda */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="search"
                            placeholder="Buscar por nombre, número o dirección..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2">
                        {(['pendiente', 'todos', 'pagado'] as FilterType[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    'flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all',
                                    filter === f
                                        ? f === 'pendiente' ? 'bg-red-600 text-white'
                                            : f === 'pagado' ? 'bg-emerald-600 text-white'
                                                : 'bg-primary text-white'
                                        : 'bg-slate-800 text-slate-500 hover:text-white'
                                )}
                            >
                                {f === 'pendiente' ? '⚠ Pendientes' : f === 'pagado' ? '✓ Al día' : '≡ Todos'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="px-4 py-4 space-y-3 pb-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                        <p className="text-slate-400 font-medium">Cargando hermanos...</p>
                    </div>
                ) : filteredHermanos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-300 font-bold">Sin resultados</p>
                            <p className="text-slate-500 text-sm mt-1">
                                {filter === 'pendiente' ? '¡Todos los hermanos están al día!' : 'No se encontraron hermanos'}
                            </p>
                        </div>
                        {(filter !== 'todos' || searchTerm) && (
                            <button
                                onClick={() => { setFilter('todos'); setSearchTerm(''); }}
                                className="flex items-center gap-2 text-primary text-sm font-bold hover:text-primary/80"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Ver todos
                            </button>
                        )}
                    </div>
                ) : view === 'lista' ? (
                    <>
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wider px-1">
                            {filteredHermanos.length} hermano{filteredHermanos.length !== 1 ? 's' : ''}
                        </p>
                        {filteredHermanos.map(hermano => (
                            <div key={hermano.id} className="relative">
                                {successId === hermano.id && (
                                    <div className="absolute -top-2 left-0 right-0 flex justify-center z-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg shadow-emerald-900/50">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            ¡Cobro registrado con éxito!
                                        </div>
                                    </div>
                                )}
                                <HermanoCard
                                    hermano={hermano}
                                    paidMonths={pagosPorHermano[hermano.id] || []}
                                    cuotaEstandard={cuotaEstandard}
                                    currentYear={currentYear}
                                    isExpanded={expandedId === hermano.id}
                                    isProcessing={processingId === hermano.id}
                                    onToggle={() => setExpandedId(expandedId === hermano.id ? null : hermano.id)}
                                    onPaySelected={handlePaySelected}
                                    onPayAll={handlePayAll}
                                />
                            </div>
                        ))}
                    </>
                ) : (
                    /* Vista Mapa */
                    <div className="space-y-3">
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wider px-1">
                            Hermanos con dirección registrada
                        </p>
                        {filteredHermanos.filter(h => h.direccion).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <MapPin className="w-12 h-12 text-slate-700" />
                                <div className="text-center">
                                    <p className="text-slate-400 font-bold">Sin direcciones registradas</p>
                                    <p className="text-slate-600 text-sm">Los hermanos de tu lista no tienen dirección guardada.</p>
                                </div>
                            </div>
                        ) : (
                            filteredHermanos
                                .filter(h => h.direccion)
                                .map(hermano => {
                                    const paidMonths = pagosPorHermano[hermano.id] || [];
                                    const pendingCount = 12 - paidMonths.length;
                                    return (
                                        <div key={hermano.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
                                            <div className="flex items-center gap-3 p-3">
                                                <div className={cn(
                                                    'w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0',
                                                    pendingCount === 0 ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'
                                                )}>
                                                    {hermano.numeroHermano}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-white text-sm truncate">{hermano.getNombreCompleto()}</p>
                                                    <StatusBadge paidCount={paidMonths.length} />
                                                </div>
                                                {pendingCount > 0 && (
                                                    <button
                                                        onClick={() => handlePayAll(hermano.id)}
                                                        disabled={processingId === hermano.id}
                                                        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-xl flex-shrink-0 transition-colors active:scale-95"
                                                    >
                                                        {processingId === hermano.id
                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                            : 'COBRAR'
                                                        }
                                                    </button>
                                                )}
                                            </div>
                                            <MapaHermano direccion={hermano.direccion!} nombre={hermano.getNombreCompleto()} />
                                        </div>
                                    );
                                })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
