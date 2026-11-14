import { supabase } from '../lib/supabase';
import {
    buildFamilyResponse,
    INCIDENT_RESPONSE_MAX_LENGTH,
    isFamilyResponseValid,
} from '../lib/incident-response';

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

    respondToIncident: async (
        incidentId: string,
        responseText: string,
    ): Promise<{
        family_response: string;
        family_responded_at: string;
        family_seen: boolean;
    }> => {
        if (!isFamilyResponseValid(responseText)) {
            throw new Error(
                `La respuesta no puede superar los ${INCIDENT_RESPONSE_MAX_LENGTH} caracteres`,
            );
        }

        const family_response = buildFamilyResponse(responseText);
        const family_responded_at = new Date().toISOString();
        const family_seen = true;

        const { error } = await supabase
            .from('incidents')
            .update({
                family_response,
                family_responded_at,
                family_seen,
            })
            .eq('id', incidentId);

        if (error) {
            console.error('Error responding to incident:', error);
            throw new Error(error.message);
        }

        return { family_response, family_responded_at, family_seen };
    },

    markIncidentsAsSeen: async (incidentIds: string[]): Promise<void> => {
        if (incidentIds.length === 0) return;

        const { error } = await supabase
            .from('incidents')
            .update({ family_seen: true })
            .in('id', incidentIds);

        if (error) {
            console.error('Error marking incidents as seen:', error);
            throw new Error(error.message);
        }
    },
};
