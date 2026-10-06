import { describe, expect, it } from 'vitest';
import {
    FUERA_DE_HORA_MESSAGE_MAX_LENGTH,
    buildFueraDeHoraMessage,
    getFueraDeHoraFormErrors,
    isFueraDeHoraDateValid,
    isFueraDeHoraDirection,
    isFueraDeHoraDuplicateError,
    isFueraDeHoraEstimatedTimeValid,
    isFueraDeHoraFormValid,
    isFueraDeHoraMessageValid,
} from './fuera-de-hora-validation';

// Fuente de verdad: issues #7 (padre), #14 (base + form mínimo) y #15 (hora+mensaje+fechas).
describe('isFueraDeHoraFormValid', () => {
    it('es válido con hijo, fecha y dirección', () => {
        expect(
            isFueraDeHoraFormValid(
                { childId: 'h1', dateISO: '2026-10-07', direction: 'antes' },
                '2026-10-06',
            ),
        ).toBe(true);
        expect(
            isFueraDeHoraFormValid(
                { childId: 'h1', dateISO: '2026-10-07', direction: 'despues' },
                '2026-10-06',
            ),
        ).toBe(true);
    });

    it('es válido con hora estimada y mensaje opcionales', () => {
        expect(
            isFueraDeHoraFormValid(
                {
                    childId: 'h1',
                    dateISO: '2026-10-06',
                    direction: 'antes',
                    estimatedTime: '15:30',
                    message: 'Recoge la abuela',
                },
                '2026-10-06',
            ),
        ).toBe(true);
    });

    it('falla si falta hijo, fecha o dirección', () => {
        expect(
            isFueraDeHoraFormValid(
                { childId: '', dateISO: '2026-10-07', direction: 'antes' },
                '2026-10-06',
            ),
        ).toBe(false);
        expect(
            isFueraDeHoraFormValid(
                { childId: 'h1', dateISO: '', direction: 'antes' },
                '2026-10-06',
            ),
        ).toBe(false);
        expect(
            isFueraDeHoraFormValid(
                { childId: 'h1', dateISO: '2026-10-07', direction: '' },
                '2026-10-06',
            ),
        ).toBe(false);
    });

    it('falla con fecha pasada o más allá de hoy+30 (issue #15)', () => {
        expect(
            isFueraDeHoraFormValid(
                { childId: 'h1', dateISO: '2026-10-05', direction: 'antes' },
                '2026-10-06',
            ),
        ).toBe(false);
        expect(
            isFueraDeHoraFormValid(
                { childId: 'h1', dateISO: '2026-11-06', direction: 'antes' },
                '2026-10-06',
            ),
        ).toBe(false);
    });

    it('falla con hora malformada o mensaje de más del máximo (issue #15)', () => {
        expect(
            isFueraDeHoraFormValid(
                { childId: 'h1', dateISO: '2026-10-06', direction: 'antes', estimatedTime: '25:00' },
                '2026-10-06',
            ),
        ).toBe(false);
        expect(
            isFueraDeHoraFormValid(
                {
                    childId: 'h1',
                    dateISO: '2026-10-06',
                    direction: 'antes',
                    message: 'a'.repeat(FUERA_DE_HORA_MESSAGE_MAX_LENGTH + 1),
                },
                '2026-10-06',
            ),
        ).toBe(false);
    });
});

describe('getFueraDeHoraFormErrors', () => {
    it('avisa si falta hijo', () => {
        const errors = getFueraDeHoraFormErrors(
            { childId: '', dateISO: '2026-10-07', direction: 'antes' },
            '2026-10-06',
        );
        expect(errors.childId).toBe('Selecciona un hijo');
    });

    it('avisa si falta fecha', () => {
        const errors = getFueraDeHoraFormErrors(
            { childId: 'h1', dateISO: '', direction: 'antes' },
            '2026-10-06',
        );
        expect(errors.dateISO).toBe('Elige una fecha');
    });

    it('avisa si la fecha es pasada o supera hoy+30', () => {
        expect(
            getFueraDeHoraFormErrors(
                { childId: 'h1', dateISO: '2026-10-05', direction: 'antes' },
                '2026-10-06',
            ).dateISO,
        ).toBe('La fecha no puede ser anterior a hoy');
        expect(
            getFueraDeHoraFormErrors(
                { childId: 'h1', dateISO: '2026-11-06', direction: 'antes' },
                '2026-10-06',
            ).dateISO,
        ).toBe('La fecha no puede ser más de 30 días en el futuro');
    });

    it('avisa si falta dirección', () => {
        const errors = getFueraDeHoraFormErrors(
            { childId: 'h1', dateISO: '2026-10-07', direction: '' },
            '2026-10-06',
        );
        expect(errors.direction).toBe('Elige si la salida será antes o después del horario habitual');
    });

    it('avisa con hora o mensaje inválidos', () => {
        expect(
            getFueraDeHoraFormErrors(
                { childId: 'h1', dateISO: '2026-10-06', direction: 'antes', estimatedTime: 'xx' },
                '2026-10-06',
            ).estimatedTime,
        ).toBe('La hora no es válida');
        expect(
            getFueraDeHoraFormErrors(
                {
                    childId: 'h1',
                    dateISO: '2026-10-06',
                    direction: 'antes',
                    message: 'a'.repeat(FUERA_DE_HORA_MESSAGE_MAX_LENGTH + 1),
                },
                '2026-10-06',
            ).message,
        ).toBe('El mensaje no puede superar los 1000 caracteres');
    });

    it('no devuelve errores con un formulario válido', () => {
        const errors = getFueraDeHoraFormErrors(
            { childId: 'h1', dateISO: '2026-10-07', direction: 'despues' },
            '2026-10-06',
        );
        expect(errors).toEqual({});
    });
});

describe('isFueraDeHoraDateValid (issue #15: hoy..hoy+30)', () => {
    it('acepta hoy y hoy+30, rechaza ayer y hoy+31', () => {
        expect(isFueraDeHoraDateValid('2026-10-06', '2026-10-06')).toBe(true);
        expect(isFueraDeHoraDateValid('2026-11-05', '2026-10-06')).toBe(true);
        expect(isFueraDeHoraDateValid('2026-10-05', '2026-10-06')).toBe(false);
        expect(isFueraDeHoraDateValid('2026-11-06', '2026-10-06')).toBe(false);
    });

    it('rechaza formato inválido', () => {
        expect(isFueraDeHoraDateValid('', '2026-10-06')).toBe(false);
        expect(isFueraDeHoraDateValid('2026-10-06', '')).toBe(false);
    });
});

describe('hora estimada opcional (issue #15: vacía permitida, libre)', () => {
    it('acepta vacía y cualquier hora HH:MM válida', () => {
        expect(isFueraDeHoraEstimatedTimeValid('')).toBe(true);
        expect(isFueraDeHoraEstimatedTimeValid('08:30')).toBe(true);
        expect(isFueraDeHoraEstimatedTimeValid('23:59')).toBe(true);
    });

    it('rechaza horas malformadas', () => {
        expect(isFueraDeHoraEstimatedTimeValid('24:00')).toBe(false);
        expect(isFueraDeHoraEstimatedTimeValid('8:30')).toBe(false);
        expect(isFueraDeHoraEstimatedTimeValid('abc')).toBe(false);
    });
});

describe('mensaje/motivo opcional 0-1000 (issue #15)', () => {
    it('acepta vacío y hasta el máximo', () => {
        expect(isFueraDeHoraMessageValid('')).toBe(true);
        expect(isFueraDeHoraMessageValid('a'.repeat(FUERA_DE_HORA_MESSAGE_MAX_LENGTH))).toBe(true);
    });

    it('rechaza más del máximo', () => {
        expect(isFueraDeHoraMessageValid('a'.repeat(FUERA_DE_HORA_MESSAGE_MAX_LENGTH + 1))).toBe(false);
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

    it('usa el motivo cuando se indica (issue #15)', () => {
        expect(buildFueraDeHoraMessage('antes', 'Recoge la abuela')).toBe('Recoge la abuela');
        expect(buildFueraDeHoraMessage('antes', '   ')).toBe('Salida antes del horario habitual');
    });
});
