import { describe, expect, it } from 'vitest';
import {
    FAMILY_MEAL_RECORDS_CAPABILITY,
    resolveMealCapability,
} from './meal-capability';

describe('resolveMealCapability', () => {
    it('habilita por defecto sin configuración explícita', () => {
        expect(
            resolveMealCapability({ overrideValue: null, schoolValue: null }),
        ).toBe(true);
    });

    it('usa el valor del colegio cuando no hay override del aula', () => {
        expect(
            resolveMealCapability({ overrideValue: null, schoolValue: true }),
        ).toBe(true);
        expect(
            resolveMealCapability({ overrideValue: null, schoolValue: false }),
        ).toBe(false);
    });

    it('el override explícito del aula prevalece en ambas direcciones', () => {
        expect(
            resolveMealCapability({ overrideValue: true, schoolValue: false }),
        ).toBe(true);
        expect(
            resolveMealCapability({ overrideValue: false, schoolValue: true }),
        ).toBe(false);
    });
});

describe('FAMILY_MEAL_RECORDS_CAPABILITY', () => {
    it('usa la clave del contrato de llumitaula-admin #7', () => {
        expect(FAMILY_MEAL_RECORDS_CAPABILITY).toBe('family_meal_records');
    });
});
