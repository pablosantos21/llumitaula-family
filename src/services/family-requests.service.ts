import { supabase } from '../lib/supabase';

export type FamilyRequestType = 'special_menu' | 'dieta';
export type ContactMethod = 'email' | 'telefono' | 'otro';

export const MESSAGE_MAX_LENGTH = 1000;
export const CONTACT_DETAIL_MAX_LENGTH = 200;

export interface FamilyRequestInput {
    child_id: string;
    request_type: FamilyRequestType;
    date: string;
    message: string;
    contact_method?: ContactMethod | null;
    contact_detail?: string | null;
}

export const FamilyRequestService = {
    create: async (input: FamilyRequestInput): Promise<void> => {
        const { error } = await supabase
            .from('family_requests')
            .insert({
                ...input,
                contact_method: input.contact_method ?? null,
                contact_detail: input.contact_detail ?? null,
                payload: {},
            });

        if (error) {
            console.error('Error creating family request:', error);
            throw new Error(error.message);
        }
    },
};
