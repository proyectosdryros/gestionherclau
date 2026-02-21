import React from 'react';
import { cn } from '@/lib/utils';

interface CuotasGridProps {
    pagos: number[]; // Array of months paid (1-12)
    selectedMonths?: number[]; // Array of months selected for payment (1-12)
    monthsToDelete?: number[]; // Array of months selected for deletion (1-12)
    onMonthClick?: (month: number) => void;
}

const MONTHS_SHORT = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTHS_FULL = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function CuotasGrid({ pagos, selectedMonths, monthsToDelete, onMonthClick }: CuotasGridProps) {
    return (
        <div className="flex gap-1">
            {MONTHS_SHORT.map((label, index) => {
                const monthNumber = index + 1; // Months are 1-12
                const isPaid = pagos.includes(monthNumber);
                const isSelected = selectedMonths?.includes(monthNumber);
                const isToDelete = monthsToDelete?.includes(monthNumber);

                let title = `${MONTHS_FULL[index]}: Pendiente`;
                if (isToDelete) title = `${MONTHS_FULL[index]}: Marcado para ANULAR`;
                else if (isPaid) title = `${MONTHS_FULL[index]}: Pagado (Click para anular)`;
                else if (isSelected) title = `${MONTHS_FULL[index]}: Seleccionado para pagar`;

                return (
                    <button
                        key={monthNumber}
                        type="button"
                        onClick={() => onMonthClick?.(monthNumber)}
                        title={title}
                        className={cn(
                            "w-7 h-7 rounded-md text-[11px] font-black transition-all flex items-center justify-center border shadow-sm",
                            isToDelete
                                ? "bg-red-500 border-red-600 text-white shadow-sm ring-2 ring-red-200 animate-pulse"
                                : isPaid
                                    ? "bg-emerald-500 border-emerald-600 text-white shadow-sm hover:bg-red-500 hover:border-red-600 hover:content-['X'] transition-colors"
                                    : (isSelected
                                        ? "bg-amber-500 border-amber-600 text-white ring-2 ring-amber-200 animate-pulse"
                                        : "bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200 hover:border-slate-400")
                        )}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
