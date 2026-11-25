import { supabase } from '../lib/supabase';

export interface Child {
    id: string;
    first_name: string;
    last_name: string;
    class_id: string;
    created_at: string;
    classes?: {
        id: string;
        name: string;
        school_id: string;
        schools?: {
            id: string;
            name: string;
        }
    }
}

export const ChildService = {
    getMyChildren: async (): Promise<Child[]> => {
        const { data, error } = await supabase
            .from('children')
            .select(`
                id,
                first_name,
                last_name,
                class_id,
                created_at,
                classes (
                    id,
                    name,
                    school_id,
                    schools (
                        id,
                        name
                    )
                )
            `)
            .order('first_name');

        if (error) {
            console.error('Error fetching children:', error);
            throw new Error(error.message);
        }

        return (data ?? []).map((row) => ({
            ...row,
            classes: row.classes
                ? {
                      ...row.classes,
                      schools: row.classes.schools ?? undefined,
                  }
                : undefined,
        }));
    },
};
