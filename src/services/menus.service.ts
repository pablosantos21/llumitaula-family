import { supabase } from '../lib/supabase';

export interface Menu {
    id: string;
    first_course: string | null;
    second_course: string | null;
    side: string | null;
    salad: string | null;
    dessert: string | null;
    type: string | null;
}

export interface MenuAssignment {
    menu_id: string;
    school_id: string;
    date: string;
    menus?: Menu;
}

export const MenuService = {
    getMenusBySchoolAndDate: async (schoolId: string, date: string): Promise<MenuAssignment[]> => {
        const { data, error } = await supabase
            .from('menus_schools')
            .select(`
                menu_id,
                school_id,
                date,
                menus (
                    id,
                    first_course,
                    second_course,
                    side,
                    salad,
                    dessert,
                    type
                )
            `)
            .eq('school_id', schoolId)
            .eq('date', date);

        if (error) {
            console.error('Error fetching menus:', error);
            throw new Error(error.message);
        }

        return (data as unknown as MenuAssignment[]) || [];
    },

    getMenusByDateRange: async (schoolId: string, startDate: string, endDate: string): Promise<MenuAssignment[]> => {
        const { data, error } = await supabase
            .from('menus_schools')
            .select(`
                menu_id,
                school_id,
                date,
                menus (
                    id,
                    first_course,
                    second_course,
                    side,
                    salad,
                    dessert,
                    type
                )
            `)
            .eq('school_id', schoolId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date');

        if (error) {
            console.error('Error fetching menus:', error);
            throw new Error(error.message);
        }

        return (data as unknown as MenuAssignment[]) || [];
    },
};
