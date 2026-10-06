export const FAMILY_MEAL_RECORDS_CAPABILITY = 'family_meal_records';

export interface MealCapabilityInput {
    overrideValue: boolean | null;
    schoolValue: boolean | null;
}

/** Resolución efectiva: override del aula si existe, si no valor del colegio, si no habilitado por defecto. */
export function resolveMealCapability(input: MealCapabilityInput): boolean {
    if (input.overrideValue !== null) return input.overrideValue;
    if (input.schoolValue !== null) return input.schoolValue;
    return true;
}
