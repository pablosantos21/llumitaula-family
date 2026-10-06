import type { FueraDeHoraDirection } from '@/services/family-requests.service';
import { MESSAGE_MAX_LENGTH } from '@/services/family-requests.service';

export type { FueraDeHoraDirection };

/** Motivo opcional del aviso: 0..1000 caracteres (issue #15). */
export const FUERA_DE_HORA_MESSAGE_MAX_LENGTH = MESSAGE_MAX_LENGTH;

export const FUERA_DE_HORA_DIRECTIONS: { value: FueraDeHoraDirection; label: string }[] = [
    { value: 'antes', label: 'Antes del horario habitual' },
    { value: 'despues', label: 'Después del horario habitual' },
];

/** Aviso de duplicado exacto (mismo hijo+fecha+tipo), texto de la issue #16. */
export const FUERA_DE_HORA_DUPLICATE_ERROR =
    'Ya avisaste una salida antes/después para este día';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toISODate(d: Date): string {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

export function todayISODate(now: Date = new Date()): string {
    return toISODate(now);
}

/** Tope del aviso: hoy + 30 días (issue #15). */
export function maxFueraDeHoraISODate(now: Date = new Date()): string {
    const max = new Date(now);
    max.setDate(max.getDate() + 30);
    return toISODate(max);
}

/**
 * Fecha válida para el aviso (issue #15): hoy..hoy+30, ambos incluidos.
 * Las cadenas se comparan en formato YYYY-MM-DD.
 */
export function isFueraDeHoraDateValid(dateISO: string, todayISO: string): boolean {
    if (!DATE_RE.test(dateISO) || !DATE_RE.test(todayISO)) return false;
    if (dateISO < todayISO) return false;
    const [y, m, d] = todayISO.split('-').map(Number);
    return dateISO <= maxFueraDeHoraISODate(new Date(y, m - 1, d));
}

export function isFueraDeHoraDirection(value: unknown): value is FueraDeHoraDirection {
    return value === 'antes' || value === 'despues';
}

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/** Hora estimada opcional (issue #15): vacía permitida, libre sin validar contra horario. */
export function isFueraDeHoraEstimatedTimeValid(value: string): boolean {
    if (value === '') return true;
    return TIME_RE.test(value);
}

/** Mensaje/motivo opcional (issue #15): 0..1000 caracteres. */
export function isFueraDeHoraMessageValid(message: string): boolean {
    return message.length <= FUERA_DE_HORA_MESSAGE_MAX_LENGTH;
}

export interface FueraDeHoraFormValue {
    childId: string;
    dateISO: string;
    direction: FueraDeHoraDirection | '';
    /** Hora estimada opcional HH:MM (issue #15). */
    estimatedTime?: string;
    /** Mensaje/motivo opcional 0..1000 (issue #15). */
    message?: string;
}

/**
 * Formulario de la issue #15: hijo + fecha (hoy..hoy+30) + dirección
 * obligatorios; hora estimada y mensaje opcionales.
 */
export function isFueraDeHoraFormValid(
    value: FueraDeHoraFormValue,
    todayISO: string = todayISODate(),
): boolean {
    return (
        value.childId !== '' &&
        isFueraDeHoraDateValid(value.dateISO, todayISO) &&
        isFueraDeHoraDirection(value.direction) &&
        isFueraDeHoraEstimatedTimeValid(value.estimatedTime ?? '') &&
        isFueraDeHoraMessageValid(value.message ?? '')
    );
}

export interface FueraDeHoraFormErrors {
    childId?: string;
    dateISO?: string;
    direction?: string;
    estimatedTime?: string;
    message?: string;
}

/** Mensajes claros en español que evitan envíos inválidos. */
export function getFueraDeHoraFormErrors(
    value: FueraDeHoraFormValue,
    todayISO: string = todayISODate(),
): FueraDeHoraFormErrors {
    const errors: FueraDeHoraFormErrors = {};
    if (value.childId === '') {
        errors.childId = 'Selecciona un hijo';
    }
    if (!DATE_RE.test(value.dateISO)) {
        errors.dateISO = 'Elige una fecha';
    } else if (value.dateISO < todayISO) {
        errors.dateISO = 'La fecha no puede ser anterior a hoy';
    } else if (!isFueraDeHoraDateValid(value.dateISO, todayISO)) {
        errors.dateISO = 'La fecha no puede ser más de 30 días en el futuro';
    }
    if (!isFueraDeHoraDirection(value.direction)) {
        errors.direction = 'Elige si la salida será antes o después del horario habitual';
    }
    if (!isFueraDeHoraEstimatedTimeValid(value.estimatedTime ?? '')) {
        errors.estimatedTime = 'La hora no es válida';
    }
    if (!isFueraDeHoraMessageValid(value.message ?? '')) {
        errors.message = `El mensaje no puede superar los ${FUERA_DE_HORA_MESSAGE_MAX_LENGTH} caracteres`;
    }
    return errors;
}

/** Error de unicidad Postgres (duplicado hijo+fecha+tipo). */
export function isFueraDeHoraDuplicateError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    return (error as { code?: unknown }).code === '23505';
}

/**
 * La columna `message` es NOT NULL (1..1000): si no hay motivo se deriva
 * de la dirección (issue #14); con motivo se envía el motivo (issue #15).
 */
export function buildFueraDeHoraMessage(direction: FueraDeHoraDirection, message = ''): string {
    const note = message.trim();
    if (note !== '') return note;
    return direction === 'antes'
        ? 'Salida antes del horario habitual'
        : 'Salida después del horario habitual';
}

/** Etiqueta completa con año para la pantalla de éxito (p. ej. "martes, 7 de octubre de 2026"). */
export function formatFueraDeHoraDateLong(dateISO: string): string {
    const [y, m, d] = dateISO.split('-').map(Number);
    return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(y, m - 1, d));
}
