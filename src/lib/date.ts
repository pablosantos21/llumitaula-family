const ISO_DATE_PREFIX_RE = /^(\d{4})-(\d{2})-(\d{2})/;

/** Formatea una fecha `Date` como `YYYY-MM-DD` usando la zona horaria local. */
export function toLocalISODate(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Extrae `YYYY-MM-DD` preservando el prefijo de fecha sin desplazamientos UTC. */
export function extractISODate(value: string): string {
    const match = ISO_DATE_PREFIX_RE.exec(value.trim());
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return toLocalISODate(parsed);
}

/** Construye un `Date` en medianoche local a partir de una cadena `YYYY-MM-DD` (o prefijo ISO). */
export function parseLocalISODate(value: string): Date {
    const match = ISO_DATE_PREFIX_RE.exec(value.trim());
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        return new Date(year, month - 1, day);
    }

    return new Date(value);
}

/** Indica si dos fechas corresponden al mismo día calendario en hora local. */
export function isSameLocalDay(a: Date, b: Date = new Date()): boolean {
    return toLocalISODate(a) === toLocalISODate(b);
}

/** Formatea la fecha de una incidencia en español sin desplazamientos por zona horaria UTC. */
export function formatIncidentDateEs(value: string): string {
    const date = parseLocalISODate(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
