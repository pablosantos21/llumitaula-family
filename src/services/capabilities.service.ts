import { supabase } from '../lib/supabase';
import {
    FAMILY_MEAL_RECORDS_CAPABILITY,
    resolveMealCapability,
} from '../lib/meal-capability';

export interface EffectiveCapability {
    capability: string;
    enabled: boolean;
}

/** Resuelve la capacidad efectiva de comidas para el hijo seleccionado vía contrato admin #7. */
export const CapabilityService = {
    getMealCapabilityForChild: async (childId: string): Promise<boolean> => {
        const { data, error } = await supabase.rpc('get_effective_capabilities', {
            p_class_id: null,
            p_child_id: childId,
        });

        if (error) {
            console.error('Error resolving meal capability:', error);
            throw new Error(error.message);
        }

        const rows = (data ?? []) as EffectiveCapability[];
        const match = rows.find((row) => row.capability === FAMILY_MEAL_RECORDS_CAPABILITY);
        // Sin configuración explícita resuelve habilitado (fail-open solo en ese caso).
        if (!match) return resolveMealCapability({ overrideValue: null, schoolValue: null });
        return match.enabled;
    },
};
