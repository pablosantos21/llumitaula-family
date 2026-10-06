import { supabase } from '../lib/supabase';
import type { MealRecordStatus } from '../lib/meal-records-mapping';

export interface MealRecord {
    id: string;
    child_id: string;
    recorded_date: string;
    status: MealRecordStatus;
    notes: string | null;
    meal_type_id: string;
    meal_types?: {
        id: string;
        name: string;
    } | null;
}

/** Lectura mínima real de registros del alumno por hijo y fecha. */
export const MealRecordService = {
    getByChildAndDate: async (childId: string, dateISO: string): Promise<MealRecord[]> => {
        const { data, error } = await supabase
            .from('meal_records')
            .select(
                `
                id,
                child_id,
                recorded_date,
                status,
                notes,
                meal_type_id,
                meal_types (
                    id,
                    name
                )
            `,
            )
            .eq('child_id', childId)
            .eq('recorded_date', dateISO)
            .order('recorded_at', { ascending: true });

        if (error) {
            console.error('Error fetching meal records:', error);
            throw new Error(error.message);
        }

        return (data as unknown as MealRecord[]) || [];
    },
};
