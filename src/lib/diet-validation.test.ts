import { describe, expect, it } from 'vitest';
import {
    DIET_DESCRIPTION_MAX_LENGTH,
    DIET_DUPLICATE_ERROR,
    DIET_MAX_DATES,
    formatDietDateLong,
    getDietFormErrors,
    isDietDatesListValid,
    isDietDateValid,
    isDietDescriptionValid,
    isDietDuplicateError,
    isDietFormValid,
    maxDietDateISO,
    tomorrowISODate,
} from './diet-validation';

describe('diet-validation', () => {
    const today = '2026-10-06';

    it('calcula mañana y el límite máximo (+3 meses)', () => {
        expect(tomorrowISODate(new Date(2026, 9, 6, 12, 0))).toBe('2026-10-07');
        expect(maxDietDateISO(today)).toBe('2027-01-31');
    });

    it('acepta fechas entre mañana y +3 meses, y rechaza hoy, pasado o más allá del límite', () => {
        expect(isDietDateValid('2026-10-06', today)).toBe(false);
        expect(isDietDateValid('2026-10-05', today)).toBe(false);
        expect(isDietDateValid('2026-10-07', today)).toBe(true);
        expect(isDietDateValid('2027-01-31', today)).toBe(true);
        expect(isDietDateValid('2027-02-01', today)).toBe(false);
        expect(isDietDateValid('2026-02-30', today)).toBe(false);
    });

    it('valida listas multi-fecha hasta un máximo de 30 días sin duplicados', () => {
        expect(isDietDatesListValid([], today)).toBe(false);
        expect(isDietDatesListValid(['2026-10-07', '2026-10-08'], today)).toBe(true);
        expect(isDietDatesListValid(['2026-10-07', '2026-10-07'], today)).toBe(false);

        const thirtyValidDates = Array.from({ length: DIET_MAX_DATES }, (_, idx) => {
            const d = new Date(2026, 9, 7 + idx);
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${d.getFullYear()}-${month}-${day}`;
        });
        expect(isDietDatesListValid(thirtyValidDates, today)).toBe(true);
        expect(isDietDatesListValid([...thirtyValidDates, '2026-12-01'], today)).toBe(false);
    });

    it('valida descripción de dieta tras hacer trim y respetar el máximo', () => {
        expect(isDietDescriptionValid('   ')).toBe(false);
        expect(isDietDescriptionValid('Dieta blanda')).toBe(true);
        expect(isDietDescriptionValid('a'.repeat(DIET_DESCRIPTION_MAX_LENGTH))).toBe(true);
        expect(isDietDescriptionValid('a'.repeat(DIET_DESCRIPTION_MAX_LENGTH + 1))).toBe(false);
    });

    it('devuelve errores detallados por campo en el formulario de dieta', () => {
        expect(
            getDietFormErrors({ childId: '', dates: [], message: '   ' }, today)
        ).toEqual({
            childId: 'Selecciona un hijo',
            dates: 'Elige al menos un día',
            message: 'Describe la dieta especial',
        });

        expect(
            isDietFormValid(
                { childId: 'c1', dates: ['2026-10-07'], message: 'Sin lácteos' },
                today
            )
        ).toBe(true);
    });

    it('reconoce errores Postgres 23505 de dieta duplicada y define el mensaje esperado', () => {
        expect(DIET_DUPLICATE_ERROR).toBe('Ya tienes dieta ese día');
        expect(isDietDuplicateError({ code: '23505' })).toBe(true);
        expect(isDietDuplicateError({ code: '42501' })).toBe(false);
        expect(isDietDuplicateError(null)).toBe(false);
    });

    it('formatea fechas largas en español', () => {
        expect(formatDietDateLong('2026-10-07')).toContain('7 de octubre de 2026');
    });
});
