import { describe, expect, it } from 'vitest';
import {
    buildFueraDeHoraMessage,
    getFueraDeHoraFormErrors,
    isFueraDeHoraDirection,
    isFueraDeHoraDuplicateError,
    isFueraDeHoraFormValid,
} from './fuera-de-hora-validation';

// Fuente de verdad: issues #7 (padre) y #14 (base + form mínimo).
describe('isFueraDeHoraFormValid', () => {
    it('es válido con hijo, fecha y dirección', () => {
        expect(
            isFueraDeHoraFormValid({ childId: 'h1', dateISO: '2026-10-07', direction: 'antes' }),
        ).toBe(true);
        expect(
            isFueraDeHoraFormValid({ childId: 'h1', dateISO: '2026-10-07', direction: 'despues' }),
        ).toBe(true);
    });

    it('falla si falta hijo, fecha o dirección', () => {
        expect(
            isFueraDeHoraFormValid({ childId: '', dateISO: '2026-10-07', direction: 'antes' }),
        ).toBe(false);
        expect(
            isFueraDeHoraFormValid({ childId: 'h1', dateISO: '', direction: 'antes' }),
        ).toBe(false);
        expect(
            isFueraDeHoraFormValid({ childId: 'h1', dateISO: '2026-10-07', direction: '' }),
        ).toBe(false);
    });
});

describe('getFueraDeHoraFormErrors', () => {
    it('avisa si falta hijo', () => {
        const errors = getFueraDeHoraFormErrors(
            { childId: '', dateISO: '2026-10-07', direction: 'antes' },
        );
        expect(errors.childId).toBe('Selecciona un hijo');
    });

    it('avisa si falta fecha', () => {
        const errors = getFueraDeHoraFormErrors(
            { childId: 'h1', dateISO: '', direction: 'antes' },
        );
        expect(errors.dateISO).toBe('Elige una fecha');
    });

    it('avisa si falta dirección', () => {
        const errors = getFueraDeHoraFormErrors(
            { childId: 'h1', dateISO: '2026-10-07', direction: '' },
        );
        expect(errors.direction).toBe('Elige si la salida será antes o después del horario habitual');
    });

    it('no devuelve errores con un formulario válido', () => {
        const errors = getFueraDeHoraFormErrors(
            { childId: 'h1', dateISO: '2026-10-07', direction: 'despues' },
        );
        expect(errors).toEqual({});
    });
});

describe('isFueraDeHoraDirection', () => {
    it('solo acepta antes o después', () => {
        expect(isFueraDeHoraDirection('antes')).toBe(true);
        expect(isFueraDeHoraDirection('despues')).toBe(true);
        expect(isFueraDeHoraDirection('')).toBe(false);
        expect(isFueraDeHoraDirection('durante')).toBe(false);
        expect(isFueraDeHoraDirection(null)).toBe(false);
    });
});

describe('duplicado fuera-de-hora (hijo+fecha)', () => {
    it('reconoce el error de unicidad 23505 como duplicado', () => {
        expect(isFueraDeHoraDuplicateError({ code: '23505' })).toBe(true);
        expect(isFueraDeHoraDuplicateError({ code: '42501' })).toBe(false);
        expect(isFueraDeHoraDuplicateError(new Error('boom'))).toBe(false);
        expect(isFueraDeHoraDuplicateError(null)).toBe(false);
    });
});

describe('buildFueraDeHoraMessage', () => {
    it('deriva el mensaje de la dirección', () => {
        expect(buildFueraDeHoraMessage('antes')).toBe('Salida antes del horario habitual');
        expect(buildFueraDeHoraMessage('despues')).toBe('Salida después del horario habitual');
    });
});
