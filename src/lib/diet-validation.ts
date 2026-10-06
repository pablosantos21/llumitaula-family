export const DIET_DESCRIPTION_MAX_LENGTH = 1000;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toISODate(d: Date): string {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

export function todayISODate(now: Date = new Date()): string {
    return toISODate(now);
}

export function tomorrowISODate(now: Date = new Date()): string {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    return toISODate(next);
}

export function isDietDescriptionValid(message: string): boolean {
    const trimmed = message.trim();
    return trimmed.length >= 1 && trimmed.length <= DIET_DESCRIPTION_MAX_LENGTH;
}

/**
 * A dieta date is valid only when it is strictly in the future
 * relative to `today` (both YYYY-MM-DD). Past and today are blocked.
 */
export function isDietDateValid(dateISO: string, todayISO: string): boolean {
    if (!DATE_RE.test(dateISO) || !DATE_RE.test(todayISO)) return false;
    return dateISO > todayISO;
}

export interface DietFormValue {
    childId: string;
    message: string;
    dateISO: string;
}

export function isDietFormValid(value: DietFormValue, todayISO: string): boolean {
    return (
        value.childId !== '' &&
        isDietDescriptionValid(value.message) &&
        isDietDateValid(value.dateISO, todayISO)
    );
}
