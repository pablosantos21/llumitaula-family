import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDateLongEs, parseLocalISODate, toLocalISODate } from '@/lib/date';
import { cn } from '@/lib/utils';

const WEEKDAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

interface YearMonth {
    year: number;
    month: number;
}

function monthIndex({ year, month }: YearMonth): number {
    return year * 12 + month;
}

function shiftMonth(base: YearMonth, delta: number): YearMonth {
    const d = new Date(base.year, base.month + delta, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
}

function formatMonthTitle({ year, month }: YearMonth): string {
    const label = new Date(year, month, 1).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatShortChipDate(dateISO: string): string {
    return parseLocalISODate(dateISO).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
    });
}

export interface MonthlyDatePickerProps {
    selectedDates: string[];
    onChange: (dates: string[]) => void;
    minDateISO: string;
    maxMonthOffset?: number;
    maxDates?: number;
    todayISO?: string;
    disabled?: boolean;
    id?: string;
}

/** Calendario mensual multi-selección en español con límites de rango y sin dependencias externas. */
export function MonthlyDatePicker({
    selectedDates,
    onChange,
    minDateISO,
    maxMonthOffset,
    maxDates,
    todayISO,
    disabled = false,
    id,
}: MonthlyDatePickerProps) {
    const effectiveTodayISO = todayISO ?? toLocalISODate();
    const minDate = useMemo(() => parseLocalISODate(minDateISO), [minDateISO]);
    const todayDate = useMemo(() => parseLocalISODate(effectiveTodayISO), [effectiveTodayISO]);

    const minMonth: YearMonth = useMemo(
        () => ({ year: minDate.getFullYear(), month: minDate.getMonth() }),
        [minDate]
    );

    const maxMonth: YearMonth | null = useMemo(() => {
        if (maxMonthOffset === undefined) {
            return null;
        }
        return shiftMonth(
            { year: todayDate.getFullYear(), month: todayDate.getMonth() },
            maxMonthOffset
        );
    }, [todayDate, maxMonthOffset]);

    const [viewMonth, setViewMonth] = useState<YearMonth>(minMonth);

    const canGoPrev = !disabled && monthIndex(viewMonth) > monthIndex(minMonth);
    const canGoNext =
        !disabled && (maxMonth === null || monthIndex(viewMonth) < monthIndex(maxMonth));

    const sortedSelected = useMemo(
        () => Array.from(new Set(selectedDates)).sort(),
        [selectedDates]
    );
    const selectedSet = useMemo(() => new Set(sortedSelected), [sortedSelected]);
    const maxReached = maxDates !== undefined && sortedSelected.length >= maxDates;

    const leadingEmptyCount = useMemo(() => {
        const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay();
        return (firstDay + 6) % 7;
    }, [viewMonth]);

    const daysInMonth = useMemo(
        () => new Date(viewMonth.year, viewMonth.month + 1, 0).getDate(),
        [viewMonth]
    );

    const toggleDate = (dateISO: string) => {
        if (disabled) return;
        if (selectedSet.has(dateISO)) {
            onChange(sortedSelected.filter((d) => d !== dateISO));
            return;
        }
        if (maxReached) {
            return;
        }
        onChange([...sortedSelected, dateISO].sort());
    };

    const removeDate = (dateISO: string) => {
        if (disabled) return;
        onChange(sortedSelected.filter((d) => d !== dateISO));
    };

    return (
        <div id={id} className="space-y-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                    <button
                        type="button"
                        aria-label="Mes anterior"
                        disabled={!canGoPrev}
                        onClick={() => setViewMonth((prev) => shiftMonth(prev, -1))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-gray-900">
                        {formatMonthTitle(viewMonth)}
                    </span>
                    <button
                        type="button"
                        aria-label="Mes siguiente"
                        disabled={!canGoNext}
                        onClick={() => setViewMonth((prev) => shiftMonth(prev, 1))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {WEEKDAY_HEADERS.map((day) => (
                        <div
                            key={day}
                            className="py-1 text-xs font-medium text-gray-500"
                        >
                            {day}
                        </div>
                    ))}

                    {Array.from({ length: leadingEmptyCount }).map((_, idx) => (
                        <div key={`empty-${idx}`} aria-hidden="true" />
                    ))}

                    {Array.from({ length: daysInMonth }, (_, idx) => {
                        const dayNumber = idx + 1;
                        const dateISO = toLocalISODate(
                            new Date(viewMonth.year, viewMonth.month, dayNumber)
                        );
                        const isSelected = selectedSet.has(dateISO);
                        const isBeforeMin = dateISO < minDateISO;
                        const isToday = dateISO === effectiveTodayISO;
                        const isDayDisabled =
                            disabled || isBeforeMin || (!isSelected && maxReached);

                        return (
                            <button
                                key={dateISO}
                                type="button"
                                aria-pressed={isSelected}
                                aria-label={formatDateLongEs(dateISO)}
                                disabled={isDayDisabled}
                                onClick={() => toggleDate(dateISO)}
                                className={cn(
                                    'h-9 w-full rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                                    isSelected
                                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                                        : isBeforeMin
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : isMaxBlocked(maxReached, isSelected)
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-800 hover:bg-primary-50',
                                    isToday && !isSelected && 'ring-1 ring-primary-400 font-semibold'
                                )}
                            >
                                {dayNumber}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                <span>
                    {sortedSelected.length}{' '}
                    {sortedSelected.length === 1 ? 'día seleccionado' : 'días seleccionados'}
                    {maxDates !== undefined ? ` (máx. ${maxDates})` : ''}
                </span>
                {sortedSelected.length > 0 && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange([])}
                        className="font-medium text-primary-600 hover:underline disabled:opacity-50"
                    >
                        Limpiar selección
                    </button>
                )}
            </div>

            {sortedSelected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {sortedSelected.map((dateISO) => (
                        <span
                            key={dateISO}
                            className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-800"
                        >
                            <span>{formatShortChipDate(dateISO)}</span>
                            <button
                                type="button"
                                disabled={disabled}
                                aria-label={`Quitar ${formatDateLongEs(dateISO)}`}
                                onClick={() => removeDate(dateISO)}
                                className="rounded-full p-0.5 text-primary-700 hover:bg-primary-100 disabled:opacity-50"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function isMaxBlocked(maxReached: boolean, isSelected: boolean): boolean {
    return maxReached && !isSelected;
}
