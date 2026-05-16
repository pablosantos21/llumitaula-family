import { supabase } from '../lib/supabase';

export interface Incident {
    id: string;
    child_id: string;
    date: string;
    description: string;
    created_at: string;
    monitor_id: string | null;
    reviewed: boolean | null;
    requires_family_signature: boolean | null;
    send_notification: boolean | null;
    family_seen: boolean | null;
    family_response: string | null;
    family_responded_at: string | null;
    monitor_validated: boolean | null;
    children?: {
        id: string;
        first_name: string;
        last_name: string;
    }
}

export const IncidentService = {
    getIncidentsForMyChildren: async (): Promise<Incident[]> => {
        const { data, error } = await supabase
            .from('incidents')
            .select(`
                id,
                child_id,
                date,
                description,
                created_at,
                monitor_id,
                reviewed,
                requires_family_signature,
                send_notification,
                family_seen,
                family_response,
                family_responded_at,
                monitor_validated,
                children (
                    id,
                    first_name,
                    last_name
                )
            `)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching incidents:', error);
            throw new Error(error.message);
        }

        return (data as unknown as Incident[]) || [];
    },

    getIncidentsByChild: async (childId: string): Promise<Incident[]> => {
        const { data, error } = await supabase
            .from('incidents')
            .select(`
                id,
                child_id,
                date,
                description,
                created_at,
                monitor_id,
                reviewed,
                requires_family_signature,
                send_notification,
                family_seen,
                family_response,
                family_responded_at,
                monitor_validated,
                children (
                    id,
                    first_name,
                    last_name
                )
            `)
            .eq('child_id', childId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching incidents:', error);
            throw new Error(error.message);
        }

        return (data as unknown as Incident[]) || [];
    },
};
