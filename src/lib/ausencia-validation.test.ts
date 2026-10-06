import { describe, expect, it } from 'vitest';
import {
    AUSENCIA_MESSAGE_MAX_LENGTH,
    buildAusenciaMessage,
    getAusenciaFormErrors,
    isAusenciaDateValid,
    isAusenciaFormValid,
    isAusenciaMessageValid,
} from './ausencia-validation';

describe('isAusenciaDateValid', () => {
    it('acepta hoy y fechas futuras, pero no fechas pasadas o imposibles', () => {
        expect(isAusenciaDateValid('2026-10-06', '2026-10-06')).toBe(true);
        expect(isAusenciaDateValid('2026-10-07', '2026-10-06')).toBe(true);
        expect(isAusenciaDateValid('2026-10-05', '2026-10-06')).toBe(false);
        expect(isAusenciaDateValid('2026-02-30', '2026-10-06')).toBe(false);
    });
});

describe('motivo opcional de ausencia', () => {
    it('acepta un motivo vacío y hasta 1000 caracteres, y rechaza uno más largo', () => {
        expect(isAusenciaMessageValid('')).toBe(true);
        expect(isAusenciaMessageValid('a'.repeat(AUSENCIA_MESSAGE_MAX_LENGTH))).toBe(true);
        expect(isAusenciaMessageValid('a'.repeat(AUSENCIA_MESSAGE_MAX_LENGTH + 1))).toBe(false);
    });

    it('usa un mensaje predeterminado si no se indica motivo', () => {
        expect(buildAusenciaMessage()).toBe('Ausencia notificada');
        expect(buildAusenciaMessage('   ')).toBe('Ausencia notificada');
        expect(buildAusenciaMessage('Enfermedad')).toBe('Enfermedad');
    });
});

describe('isAusenciaFormValid', () => {
    it('requiere un hijo y una fecha válida, con motivo opcional', () => {
        expect(
            isAusenciaFormValid(
                { childId: 'child-1', dateISO: '2026-10-06', message: '' },
                '2026-10-06',
            ),
        ).toBe(true);
        expect(
            isAusenciaFormValid(
                { childId: '', dateISO: '2026-10-06', message: '' },
                '2026-10-06',
            ),
        ).toBe(false);
        expect(
            isAusenciaFormValid(
                { childId: 'child-1', dateISO: '2026-10-05', message: '' },
                '2026-10-06',
            ),
        ).toBe(false);
    });

    it('describe los campos incompletos o inválidos en español', () => {
        expect(
            getAusenciaFormErrors(
                { childId: '', dateISO: '', message: 'x'.repeat(1001) },
                '2026-10-06',
            ),
        ).toEqual({
            childId: 'Selecciona un hijo',
            dateISO: 'Elige una fecha',
            message: 'El mensaje no puede superar los 1000 caracteres',
        });
        expect(
            getAusenciaFormErrors(
                { childId: 'child-1', dateISO: '2026-10-05' },
                '2026-10-06',
            ).dateISO,
        ).toBe('La fecha no puede ser anterior a hoy');
    });
});
