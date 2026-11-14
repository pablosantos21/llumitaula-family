import {
    formatDateLongEs,
    isISOCalendarDate,
    parseLocalISODate,
    toLocalISODate,
} from '@/lib/date';
import { MESSAGE_MAX_LENGTH } from '@/services/family-requests.service';

export const DIET_DESCRIPTION_MAX_LENGTH = MESSAGE_MAX_LENGTH;
export const DIET_MAX_DATES = 30;
export const DIET_MAX_MONTH_OFFSET = 3;
export const DIET_DUPLICATE_ERROR = 'Ya tienes dieta ese día';

export function todayISODate(now: Date = new Date()): string {
    return toLocalISODate(now);
}

export function tomorrowISODate(now: Date = new Date()): string {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    return toLocalISODate(next);
}

/** Último día seleccionable dentro del límite mensual (+3 meses desde `todayISO`). */
export function maxDietDateISO(
    todayISO: string,
    monthOffset: number = DIET_MAX_MONTH_OFFSET
): string {
    if (!isISOCalendarDate(todayISO)) {
        return '';
    }
    const base = parseLocalISODate(todayISO);
    const lastDayOfMaxMonth = new Date(
        base.getFullYear(),
        base.getMonth() + monthOffset + 1,
        0
    );
    return toLocalISODate(lastDayOfMaxMonth);
}

export function isDietDescriptionValid(message: string): boolean {
    const trimmed = message.trim();
    return trimmed.length >= 1 && trimmed.length <= DIET_DESCRIPTION_MAX_LENGTH;
}

/**
 * Una fecha de dieta solo es válida entre mañana y los próximos 3 meses
 * respecto a `todayISO` (ambas YYYY-MM-DD).
 */
export function isDietDateValid(dateISO: string, todayISO: string): boolean {
    if (!isISOCalendarDate(dateISO) || !isISOCalendarDate(todayISO)) {
        return false;
    }
    const maxISO = maxDietDateISO(todayISO);
    return dateISO > todayISO && dateISO <= maxISO;
}

export function isDietDatesListValid(
    dates: readonly string[],
    todayISO: string
): boolean {
    if (dates.length === 0 || dates.length > DIET_MAX_DATES) {
        return false;
    }
    if (new Set(dates).size !== dates.length) {
        return false;
    }
    return dates.every((dateISO) => isDietDateValid(dateISO, todayISO));
}

export interface DietFormValue {
    childId: string;
    message: string;
    dates: string[];
}

export interface DietFormErrors {
    childId?: string;
    dates?: string;
    message?: string;
}

export function getDietFormErrors(
    value: DietFormValue,
    todayISO: string
): DietFormErrors {
    const errors: DietFormErrors = {};

    if (value.childId === '') {
        errors.childId = 'Selecciona un hijo';
    }

    if (value.dates.length === 0) {
        errors.dates = 'Elige al menos un día';
    } else if (value.dates.length > DIET_MAX_DATES) {
        errors.dates = `Puedes seleccionar como máximo ${DIET_MAX_DATES} días por envío`;
    } else if (new Set(value.dates).size !== value.dates.length) {
        errors.dates = 'Hay días duplicados en la selección';
    } else if (!value.dates.every((dateISO) => isDietDateValid(dateISO, todayISO))) {
        errors.dates = 'Todas las fechas deben estar entre mañana y los próximos 3 meses';
    }

    const trimmedMessage = value.message.trim();
    if (trimmedMessage.length === 0) {
        errors.message = 'Describe la dieta especial';
    } else if (trimmedMessage.length > DIET_DESCRIPTION_MAX_LENGTH) {
        errors.message = `La descripción no puede superar los ${DIET_DESCRIPTION_MAX_LENGTH} caracteres`;
    }

    return errors;
}

export function isDietFormValid(value: DietFormValue, todayISO: string): boolean {
    return Object.keys(getDietFormErrors(value, todayISO)).length === 0;
}

export function isDietDuplicateError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    return (error as { code?: unknown }).code === '23505';
}

export function formatDietDateLong(dateISO: string): string {
    return formatDateLongEs(dateISO);
}
