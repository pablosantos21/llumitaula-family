import { MESSAGE_MAX_LENGTH } from '@/services/family-requests.service';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export const AUSENCIA_MESSAGE_MAX_LENGTH = MESSAGE_MAX_LENGTH;
export const AUSENCIA_DEFAULT_MESSAGE = 'Ausencia notificada';

function isISOCalendarDate(value: string): boolean {
    const match = DATE_RE.exec(value);
    if (!match) return false;

    const [, year, month, day] = match.map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function toISODate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

export function todayISODate(now: Date = new Date()): string {
    return toISODate(now);
}

/** La ausencia se puede notificar para hoy o una fecha futura. */
export function isAusenciaDateValid(dateISO: string, todayISO: string): boolean {
    return (
        isISOCalendarDate(dateISO) &&
        isISOCalendarDate(todayISO) &&
        dateISO >= todayISO
    );
}

export function isAusenciaMessageValid(message: string): boolean {
    return message.length <= AUSENCIA_MESSAGE_MAX_LENGTH;
}

export function buildAusenciaMessage(message = ''): string {
    const trimmed = message.trim();
    return trimmed === '' ? AUSENCIA_DEFAULT_MESSAGE : trimmed;
}

export interface AusenciaFormValue {
    childId: string;
    dateISO?: string;
    dates?: string[];
    message?: string;
}

export interface AusenciaFormErrors {
    childId?: string;
    dateISO?: string;
    dates?: string;
    message?: string;
}

export function isAusenciaDatesListValid(
    dates: readonly string[],
    todayISO: string
): boolean {
    if (dates.length === 0) {
        return false;
    }
    if (new Set(dates).size !== dates.length) {
        return false;
    }
    return dates.every((dateISO) => isAusenciaDateValid(dateISO, todayISO));
}

export function isAusenciaFormValid(value: AusenciaFormValue, todayISO: string): boolean {
    return Object.keys(getAusenciaFormErrors(value, todayISO)).length === 0;
}

export function getAusenciaFormErrors(
    value: AusenciaFormValue,
    todayISO: string,
): AusenciaFormErrors {
    const errors: AusenciaFormErrors = {};
    if (value.childId === '') errors.childId = 'Selecciona un hijo';

    if (value.dates !== undefined) {
        if (value.dates.length === 0) {
            errors.dates = 'Elige al menos una fecha';
        } else if (new Set(value.dates).size !== value.dates.length) {
            errors.dates = 'Hay fechas duplicadas en la selección';
        } else if (!value.dates.every((dateISO) => isAusenciaDateValid(dateISO, todayISO))) {
            errors.dates = 'Todas las fechas deben ser hoy o posteriores';
        }
    } else {
        const dateISO = value.dateISO ?? '';
        if (!isISOCalendarDate(dateISO)) {
            errors.dateISO = 'Elige una fecha';
        } else if (dateISO < todayISO) {
            errors.dateISO = 'La fecha no puede ser anterior a hoy';
        } else if (!isAusenciaDateValid(dateISO, todayISO)) {
            errors.dateISO = 'Elige una fecha válida';
        }
    }

    if (!isAusenciaMessageValid(value.message ?? '')) {
        errors.message = `El mensaje no puede superar los ${AUSENCIA_MESSAGE_MAX_LENGTH} caracteres`;
    }
    return errors;
}

export function formatAusenciaDateLong(dateISO: string): string {
    const [year, month, day] = dateISO.split('-').map(Number);
    if (!year || !month || !day) return dateISO;
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
