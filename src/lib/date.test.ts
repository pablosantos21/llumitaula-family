import { describe, expect, it } from 'vitest';
import {
    extractISODate,
    formatIncidentDateEs,
    isSameLocalDay,
    parseLocalISODate,
    toLocalISODate,
} from './date';

describe('toLocalISODate', () => {
    it('usa la fecha calendario local incluso justo después de medianoche', () => {
        const earlyMorning = new Date(2026, 9, 6, 0, 15, 0);
        const lateNight = new Date(2026, 9, 6, 23, 59, 59);

        expect(toLocalISODate(earlyMorning)).toBe('2026-10-06');
        expect(toLocalISODate(lateNight)).toBe('2026-10-06');
    });

    it('no cambia al día anterior en zonas con offset positivo respecto a UTC cerca de las 00:00', () => {
        // Simula una instancia local a las 00:30 aunque su instante UTC pertenezca al día previo
        const localDate = new Date(2026, 6, 15, 0, 30, 0);
        expect(toLocalISODate(localDate)).toBe('2026-07-15');
    });
});

describe('extractISODate y parseLocalISODate', () => {
    it('mantiene intacto un literal YYYY-MM-DD y construye Date en hora local', () => {
        expect(extractISODate('2026-10-06')).toBe('2026-10-06');
        expect(extractISODate('2026-10-06T00:00:00Z')).toBe('2026-10-06');

        const parsed = parseLocalISODate('2026-10-06');
        expect(parsed.getFullYear()).toBe(2026);
        expect(parsed.getMonth()).toBe(9);
        expect(parsed.getDate()).toBe(6);
        expect(parsed.getHours()).toBe(0);
    });

    it('compara incidencias YYYY-MM-DD frente al día local seleccionado', () => {
        const selectedDate = new Date(2026, 9, 6, 0, 5, 0);
        expect(extractISODate('2026-10-06')).toBe(toLocalISODate(selectedDate));
        expect(extractISODate('2026-10-05')).not.toBe(toLocalISODate(selectedDate));
    });
});

describe('isSameLocalDay', () => {
    it('detecta el mismo día calendario en horas opuestas y distingue días contiguos', () => {
        const start = new Date(2026, 9, 6, 0, 0, 1);
        const end = new Date(2026, 9, 6, 23, 59, 59);
        const prev = new Date(2026, 9, 5, 23, 59, 59);

        expect(isSameLocalDay(start, end)).toBe(true);
        expect(isSameLocalDay(start, prev)).toBe(false);
    });
});

describe('formatIncidentDateEs', () => {
    it('formatea YYYY-MM-DD en español manteniendo el mismo día calendario', () => {
        expect(formatIncidentDateEs('2026-10-06')).toBe('6 de octubre de 2026');
    });

    it('devuelve el texto original si la fecha no es válida', () => {
        expect(formatIncidentDateEs('fecha-invalida')).toBe('fecha-invalida');
    });
});
