'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useHermanos } from '@/presentation/hooks/useHermanos';
import { useRecibos } from '@/presentation/hooks/useRecibos';
import { usePrecios } from '@/presentation/hooks/usePrecios';
import { useConfiguracion } from '@/presentation/hooks/useConfiguracion';
import { cn, formatCurrency } from '@/lib/utils';
import {
    MapPin, Search, CheckCircle2, XCircle, ChevronRight,
    Navigation, Phone, Euro, Loader2, RotateCcw,
    Map as MapIcon, List, X, Home, SquareCheck, User, RefreshCw, ChevronDown
} from 'lucide-react';
import { Hermano } from '@/core/domain/entities/Hermano';

const MONTHS_S = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_L = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function StatusBadge({ n }: { n: number }) {
    return (
        <span className={cn('inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full',
            n === 12 ? 'bg-emerald-100 text-emerald-700' : n > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600')}>
            {n === 12 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {n}/12
        </span>
    );
}

function MapaCard({ dir, name }: { dir: string; name: string }) {
    const q = encodeURIComponent(`${dir}, Ayamonte, España`);
    return (
        <div className="bg-slate-900 rounded-2xl overflow-hidden">
            <div className="h-40 bg-slate-800">
                <iframe src={`https://maps.google.com/maps?q=${q}&output=embed&z=16`}
                    className="w-full h-full border-0" loading="lazy" title={`Mapa ${name}`} />
            </div>
            <div className="flex gap-2 p-2">
                <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-[10px] font-black py-2 rounded-xl">
                    <Navigation className="w-3 h-3" />Maps
                </a>
                <a href={`https://www.waze.com/ul?q=${q}&navigate=yes`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-[#33CCFF] text-slate-900 text-[10px] font-black py-2 rounded-xl">
                    <Navigation className="w-3 h-3" />Waze
                </a>
            </div>
        </div>
    );
}

// Grid de 12 meses con selección
function MonthGrid({ paid, selected, onToggle, busy }: {
    paid: number[]; selected: number[]; onToggle: (m: number) => void; busy: boolean;
}) {
    return (
        <div className="grid grid-cols-6 gap-1">
            {ALL_MONTHS.map(m => {
                const isPaid = paid.includes(m);
                const isSel = selected.includes(m);
                return (
                    <button key={m} type="button" disabled={isPaid || busy}
                        onClick={() => !isPaid && !busy && onToggle(m)}
                        className={cn('flex flex-col items-center justify-center py-2 rounded-xl transition-all',
                            isPaid ? 'bg-emerald-900/70 border border-emerald-700/60 cursor-default'
                                : isSel ? 'bg-primary border border-primary/70 scale-[1.05] shadow shadow-primary/30'
                                    : 'bg-slate-700/50 border border-slate-600/40 hover:bg-slate-600/60 active:scale-95'
                        )}>
                        <span className={cn('text-[9px] font-black mb-0.5',
                            isPaid ? 'text-emerald-400' : isSel ? 'text-white' : 'text-slate-400')}>
                            {MONTHS_S[m - 1]}
                        </span>
                        {isPaid
                            ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            : isSel
                                ? <CheckCircle2 className="w-3 h-3 text-white" />
                                : <div className="w-3 h-3 rounded-full border-2 border-slate-500/50" />
                        }
                    </button>
                );
            })}
        </div>
    );
}

interface CardProps {
    h: Hermano; paid: number[]; rate: number; year: number;
    expanded: boolean; busy: boolean;
    onToggle: () => void;
    onPay: (id: string, months: number[]) => Promise<void>;
}
function HCard({ h, paid, rate, year, expanded, busy, onToggle, onPay }: CardProps) {
    const [sel, setSel] = useState<number[]>([]);
    const pending = useMemo(() => ALL_MONTHS.filter(m => !paid.includes(m)), [paid]);
    const full = paid.length === 12;
    const allSel = sel.length === pending.length && pending.length > 0;

    // Limpiar selección cuando paidMonths se actualiza (useEffect, NO en render)
    useEffect(() => {
        setSel(prev => prev.filter(m => !paid.includes(m)));
    }, [paid]);

    const toggle = (m: number) => setSel(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m].sort((a, b) => a - b));
    const toggleAll = () => setSel(allSel ? [] : [...pending]);

    const handleClose = () => { setSel([]); onToggle(); };
    const doPay = async (months: number[]) => { await onPay(h.id, months); setSel([]); };

    return (
        <div className={cn('rounded-2xl border transition-all duration-200 overflow-hidden',
            expanded ? 'border-primary/30 bg-slate-800/50 shadow-lg shadow-primary/10'
                : 'border-slate-700/50 bg-slate-800/30',
            full && !expanded && 'opacity-60')}>

            <button onClick={handleClose} className="w-full flex items-center gap-3 p-4 text-left">
                <div className={cn('w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-black text-sm',
                    full ? 'bg-emerald-900/50 text-emerald-400'
                        : pending.length === 12 ? 'bg-red-900/50 text-red-400'
                            : 'bg-amber-900/50 text-amber-400')}>
                    <span className="text-[9px]">#</span>
                    {h.numeroHermano}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm truncate">{h.getNombreCompleto()}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge n={paid.length} />
                        {!full && <span className="text-xs text-red-400 font-bold">{formatCurrency(pending.length * rate)}</span>}
                    </div>
                </div>
                <ChevronRight className={cn('w-4 h-4 text-slate-500 flex-shrink-0 transition-transform', expanded && 'rotate-90')} />
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    {!full ? (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Selecciona meses a cobrar:</p>
                                <button type="button" onClick={toggleAll} disabled={busy}
                                    className={cn('flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border',
                                        allSel ? 'bg-primary/20 border-primary/40 text-primary'
                                            : 'bg-slate-700/50 border-slate-600/50 text-slate-400')}>
                                    <SquareCheck className="w-3 h-3" />
                                    {allSel ? 'DESMARCAR' : 'SELEC. TODO'}
                                </button>
                            </div>
                            <MonthGrid paid={paid} selected={sel} onToggle={toggle} busy={busy} />

                            {sel.length > 0 ? (
                                <div className="space-y-2 animate-in fade-in duration-150">
                                    <div className="flex flex-wrap gap-1">
                                        {sel.map(m => (
                                            <button key={m} type="button" onClick={() => toggle(m)} disabled={busy}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-primary/20 border border-primary/40 text-primary text-[10px] font-black rounded-lg hover:bg-red-900/40 hover:text-red-300 transition-colors">
                                                {MONTHS_L[m - 1]}<X className="w-2.5 h-2.5" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{sel.length} {sel.length === 1 ? 'mes' : 'meses'}</p>
                                            <p className="text-xl font-black text-white">{formatCurrency(sel.length * rate)}</p>
                                        </div>
                                        <button type="button" onClick={() => doPay(sel)} disabled={busy}
                                            className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm active:scale-95',
                                                busy ? 'bg-slate-600 text-slate-400' : 'bg-primary text-white shadow shadow-primary/30')}>
                                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Euro className="w-4 h-4" />COBRAR</>}
                                        </button>
                                    </div>
                                    {!allSel && (
                                        <button type="button" onClick={() => doPay(pending)} disabled={busy}
                                            className="w-full py-2 text-xs font-black text-slate-500 hover:text-slate-300 border border-slate-700/50 rounded-xl transition-colors">
                                            O cobrar todo ({formatCurrency(pending.length * rate)})
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-slate-700/20 border border-slate-700/30 rounded-xl">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total pendiente</p>
                                        <p className="text-lg font-black text-slate-300">{formatCurrency(pending.length * rate)}</p>
                                    </div>
                                    <button type="button" onClick={() => doPay(pending)} disabled={busy}
                                        className={cn('px-4 py-2.5 rounded-xl font-black text-sm border transition-all active:scale-95',
                                            busy ? 'bg-slate-600 text-slate-400 border-transparent'
                                                : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600/50')}>
                                        {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'COBRAR TODO'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <MonthGrid paid={paid} selected={[]} onToggle={() => { }} busy={false} />
                            <div className="flex items-center gap-2 p-3 bg-emerald-900/30 border border-emerald-700/30 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <p className="text-sm text-emerald-300 font-bold">¡Al día! Todo pagado en {year}.</p>
                            </div>
                        </>
                    )}

                    {/* Contacto */}
                    <div className="space-y-1.5">
                        {h.telefono && (
                            <a href={`tel:${h.telefono}`}
                                className="flex items-center gap-2 p-2.5 bg-slate-700/40 rounded-xl text-sm text-slate-300 hover:bg-slate-700/60 transition-colors">
                                <Phone className="w-4 h-4 text-primary flex-shrink-0" />{h.telefono}
                            </a>
                        )}
                        {h.direccion ? (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 p-2.5 bg-slate-700/40 rounded-xl text-sm text-slate-300">
                                    <Home className="w-4 h-4 text-primary flex-shrink-0" />{h.direccion}
                                </div>
                                <MapaCard dir={h.direccion} name={h.getNombreCompleto()} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-2.5 bg-slate-700/30 rounded-xl text-sm text-slate-500">
                                <MapPin className="w-4 h-4" />Sin dirección registrada
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

type Filter = 'pendiente' | 'pagado' | 'todos';
type View = 'lista' | 'mapa';

export default function CobradorPage() {
    const { hermanos, loading: lH } = useHermanos();
    const { recibos, loading: lR, crearRecibo, refresh } = useRecibos();
    const { precios } = usePrecios({ activo: true, tipo: 'CUOTA' });
    const { activeAnio } = useConfiguracion();

    // Usar MISMO año que useRecibos internamente
    const year = activeAnio;

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('pendiente');
    const [openId, setOpenId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [view, setView] = useState<View>('lista');
    const [okId, setOkId] = useState<string | null>(null);
    const [distrito, setDistrito] = useState<string>('');

    // Distritos comunes en Ayamonte y pedanías
    const distritos = [
        'La Villa',
        'La Ribera',
        'Centro',
        'Salón Santa Gadea',
        'Salón Gadea',
        'Federico Mayo',
        'Costa Esuri',
        'Isla Canela',
        'Punta del Moral',
        'Pozo del Camino',
        'Las Moreras',
        'Julio Romero de Torres',
        'El Estanque'
    ];

    // Optimistic paid months — feedback inmediato sin esperar al DB
    const [optPaid, setOptPaid] = useState<Record<string, number[]>>({});

    // Limpiar optimistic cuando el DB ya refleja los datos
    useEffect(() => {
        setOptPaid(prev => {
            const next = { ...prev };
            let changed = false;
            for (const [id, months] of Object.entries(next)) {
                const dbPaid = pagosPorHermano[id] || [];
                const rem = months.filter(m => !dbPaid.includes(m));
                if (rem.length !== months.length) {
                    changed = true;
                    if (rem.length === 0) delete next[id];
                    else next[id] = rem;
                }
            }
            return changed ? next : prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recibos]);

    // Polling cada 30s + refresco al volver a la pestaña
    useEffect(() => {
        const timer = setInterval(() => refresh(), 30000);
        const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
        document.addEventListener('visibilitychange', onVisible);
        return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
    }, [refresh]);

    const rate = useMemo(() => {
        const p = precios.find(p => p.activo && p.nombre.toUpperCase().includes('CUOT')) || precios.find(p => p.activo);
        return p ? p.importe : 1.50;
    }, [precios]);

    // Meses pagados según DB
    const pagosPorHermano = useMemo(() => {
        const m: Record<string, number[]> = {};
        recibos.forEach(r => {
            if (r.tipo === 'CUOTA_ORDINARIA' && r.estado === 'COBRADO') {
                const y = new Date(r.fechaEmision).getFullYear();
                if (y === year) {
                    if (!m[r.hermanoId]) m[r.hermanoId] = [];
                    const mn = new Date(r.fechaEmision).getMonth() + 1;
                    if (!m[r.hermanoId].includes(mn)) m[r.hermanoId].push(mn);
                }
            }
        });
        return m;
    }, [recibos, year]);

    // Meses efectivos = DB + optimistic (sin duplicados)
    const effectivePaid = useCallback((id: string) => {
        const db = pagosPorHermano[id] || [];
        const opt = optPaid[id] || [];
        return [...new Set([...db, ...opt])].sort((a, b) => a - b);
    }, [pagosPorHermano, optPaid]);

    const stats = useMemo(() => {
        const alDia = hermanos.filter(h => effectivePaid(h.id).length === 12).length;
        const totalPend = hermanos.reduce((acc, h) => {
            const p = effectivePaid(h.id).length;
            return acc + (12 - p) * rate;
        }, 0);
        return { alDia, pendiente: hermanos.length - alDia, totalPend };
    }, [hermanos, effectivePaid, rate]);

    const list = useMemo(() => hermanos
        .filter(h => {
            const p = effectivePaid(h.id).length;
            if (filter === 'pendiente') return p < 12;
            if (filter === 'pagado') return p === 12;
            return true;
        })
        .filter(h => {
            if (!search) return true;
            const t = search.toLowerCase();
            return `${h.nombre} ${h.apellido1} ${h.apellido2 || ''}`.toLowerCase().includes(t)
                || h.numeroHermano.toString().includes(t)
                || (h.direccion || '').toLowerCase().includes(t);
        })
        .filter(h => {
            if (!distrito) return true;
            return h.distrito === distrito;
        })
        .sort((a, b) => a.numeroHermano - b.numeroHermano),
        [hermanos, effectivePaid, filter, search, distrito]);

    const handlePay = useCallback(async (hermanoId: string, months: number[]) => {
        if (!months.length) return;

        // 1. Optimistic update — UI se actualiza INSTANTÁNEAMENTE
        setOptPaid(prev => ({
            ...prev,
            [hermanoId]: [...new Set([...(prev[hermanoId] || []), ...months])]
        }));

        setBusyId(hermanoId);
        try {
            for (const m of months) {
                const jsM = m - 1;
                await crearRecibo({
                    hermanoId,
                    concepto: `Cuota ${MONTHS_L[jsM]} ${year}`,
                    importe: rate,
                    estado: 'COBRADO',
                    tipo: 'CUOTA_ORDINARIA',
                    // Año sincronizado con activeAnio para que useRecibos lo encuentre
                    fechaEmision: new Date(Date.UTC(year, jsM, 1, 12, 0, 0)),
                    observaciones: 'Cobrado desde Cobrador'
                });
            }
            setOkId(hermanoId);
            setTimeout(() => setOkId(null), 2500);

            // Si ya pagó todo, cerrar card
            const totalPaidNow = effectivePaid(hermanoId).length;
            if (totalPaidNow >= 12) setOpenId(null);

        } catch (err) {
            // Rollback optimistic si falla
            setOptPaid(prev => ({
                ...prev,
                [hermanoId]: (prev[hermanoId] || []).filter(m => !months.includes(m))
            }));
            console.error(err);
            alert('Error al procesar el cobro. Inténtalo de nuevo.');
        } finally {
            setBusyId(null);
        }
    }, [year, rate, crearRecibo, effectivePaid]);

    const loading = lH || lR;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header fijo */}
            <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
                <div className="px-4 pt-4 pb-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Cobrador</h1>
                            <p className="text-xs text-slate-500">Campaña {year} · {stats.pendiente} pendientes</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => refresh()} title="Actualizar datos"
                                className="p-2 rounded-xl bg-slate-800 text-slate-500 hover:text-white transition-colors">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <div className="flex items-center bg-slate-800 rounded-xl p-1 gap-1">
                                <button onClick={() => setView('lista')}
                                    className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all',
                                        view === 'lista' ? 'bg-primary text-white' : 'text-slate-500')}>
                                    <List className="w-3.5 h-3.5" />Lista
                                </button>
                                <button onClick={() => setView('mapa')}
                                    className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all',
                                        view === 'mapa' ? 'bg-primary text-white' : 'text-slate-500')}>
                                    <MapIcon className="w-3.5 h-3.5" />Mapa
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-red-950/50 border border-red-800/30 rounded-xl p-2 text-center">
                            <p className="text-xl font-black text-red-400">{stats.pendiente}</p>
                            <p className="text-[10px] text-red-500/80 font-bold uppercase">Pendientes</p>
                        </div>
                        <div className="bg-emerald-950/50 border border-emerald-800/30 rounded-xl p-2 text-center">
                            <p className="text-xl font-black text-emerald-400">{stats.alDia}</p>
                            <p className="text-[10px] text-emerald-500/80 font-bold uppercase">Al día</p>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-2 text-center">
                            <p className="text-sm font-black text-primary">{formatCurrency(stats.totalPend)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Sin cobrar</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="search" placeholder="Buscar..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-all" />
                            {search && <button onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><X className="w-4 h-4" /></button>}
                        </div>
                        <div className="relative w-1/3">
                            <select
                                value={distrito}
                                onChange={e => setDistrito(e.target.value)}
                                className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-all"
                            >
                                <option value="">🌐 Todos</option>
                                {distritos.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {(['pendiente', 'todos', 'pagado'] as Filter[]).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={cn('flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all',
                                    filter === f
                                        ? f === 'pendiente' ? 'bg-red-600 text-white' : f === 'pagado' ? 'bg-emerald-600 text-white' : 'bg-primary text-white'
                                        : 'bg-slate-800 text-slate-500 hover:text-white')}>
                                {f === 'pendiente' ? '⚠ Pendientes' : f === 'pagado' ? '✓ Al día' : '≡ Todos'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-3 pb-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-slate-400">Cargando...</p>
                    </div>
                ) : list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <User className="w-12 h-12 text-slate-700" />
                        <p className="text-slate-400 font-bold">
                            {filter === 'pendiente' ? '¡Todos al día!' : 'Sin resultados'}
                        </p>
                        {(filter !== 'todos' || search) && (
                            <button onClick={() => { setFilter('todos'); setSearch(''); }}
                                className="flex items-center gap-2 text-primary text-sm font-bold">
                                <RotateCcw className="w-4 h-4" />Ver todos
                            </button>
                        )}
                    </div>
                ) : view === 'lista' ? (
                    <>
                        <p className="text-xs text-slate-600 font-bold uppercase px-1">{list.length} hermanos</p>
                        {list.map(h => (
                            <div key={h.id} className="relative">
                                {okId === h.id && (
                                    <div className="absolute -top-2 inset-x-0 flex justify-center z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                                            <CheckCircle2 className="w-3.5 h-3.5" />¡Cobro registrado!
                                        </div>
                                    </div>
                                )}
                                <HCard
                                    h={h}
                                    paid={effectivePaid(h.id)}
                                    rate={rate}
                                    year={year}
                                    expanded={openId === h.id}
                                    busy={busyId === h.id}
                                    onToggle={() => setOpenId(openId === h.id ? null : h.id)}
                                    onPay={handlePay}
                                />
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-600 font-bold uppercase px-1">Con dirección registrada</p>
                        {list.filter(h => h.direccion).length === 0 ? (
                            <div className="flex flex-col items-center py-16 gap-3">
                                <MapPin className="w-10 h-10 text-slate-700" />
                                <p className="text-slate-500 text-sm">Sin direcciones registradas</p>
                            </div>
                        ) : list.filter(h => h.direccion).map(h => {
                            const epaid = effectivePaid(h.id);
                            const pend = ALL_MONTHS.filter(m => !epaid.includes(m));
                            return (
                                <div key={h.id} className="rounded-2xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
                                    <div className="flex items-center gap-3 p-3">
                                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0',
                                            pend.length === 0 ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400')}>
                                            {h.numeroHermano}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-white text-sm truncate">{h.getNombreCompleto()}</p>
                                            <StatusBadge n={epaid.length} />
                                        </div>
                                        {pend.length > 0 && (
                                            <button onClick={() => handlePay(h.id, pend)} disabled={busyId === h.id}
                                                className="px-3 py-1.5 bg-primary text-white text-xs font-black rounded-xl active:scale-95">
                                                {busyId === h.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'COBRAR'}
                                            </button>
                                        )}
                                    </div>
                                    <MapaCard dir={h.direccion!} name={h.getNombreCompleto()} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
