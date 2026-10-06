import type { FueraDeHoraDirection } from '@/services/family-requests.service';

export type { FueraDeHoraDirection };

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

export function isFueraDeHoraDirection(value: unknown): value is FueraDeHoraDirection {
    return value === 'antes' || value === 'despues';
}

export interface FueraDeHoraFormValue {
    childId: string;
    dateISO: string;
    direction: FueraDeHoraDirection | '';
}

/**
 * Formulario mínimo de la issue #14: hijo + fecha + dirección obligatorios.
 * Las reglas de fecha (no pasado, tope hoy+30) llegan en la issue #15.
 */
export function isFueraDeHoraFormValid(value: FueraDeHoraFormValue): boolean {
    return (
        value.childId !== '' &&
        DATE_RE.test(value.dateISO) &&
        isFueraDeHoraDirection(value.direction)
    );
}

export interface FueraDeHoraFormErrors {
    childId?: string;
    dateISO?: string;
    direction?: string;
}

/** Mensajes claros en español que evitan envíos inválidos. */
export function getFueraDeHoraFormErrors(value: FueraDeHoraFormValue): FueraDeHoraFormErrors {
    const errors: FueraDeHoraFormErrors = {};
    if (value.childId === '') {
        errors.childId = 'Selecciona un hijo';
    }
    if (!DATE_RE.test(value.dateISO)) {
        errors.dateISO = 'Elige una fecha';
    }
    if (!isFueraDeHoraDirection(value.direction)) {
        errors.direction = 'Elige si la salida será antes o después del horario habitual';
    }
    return errors;
}

/** Error de unicidad Postgres (duplicado hijo+fecha+tipo). */
export function isFueraDeHoraDuplicateError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    return (error as { code?: unknown }).code === '23505';
}

/**
 * La columna `message` es NOT NULL (1..1000): el formulario mínimo no pide
 * texto libre (issue #14), así que se deriva de la dirección elegida.
 */
export function buildFueraDeHoraMessage(direction: FueraDeHoraDirection): string {
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
