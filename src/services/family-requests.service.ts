import { supabase } from '../lib/supabase';

export type FamilyRequestType = 'special_menu';
export type ContactMethod = 'email' | 'telefono' | 'otro';

export const MESSAGE_MAX_LENGTH = 1000;
export const CONTACT_DETAIL_MAX_LENGTH = 200;

export interface FamilyRequestInput {
    child_id: string;
    request_type: FamilyRequestType;
    date: string;
    message: string;
    contact_method: ContactMethod;
    contact_detail: string;
}

export const FamilyRequestService = {
    create: async (input: FamilyRequestInput): Promise<void> => {
        const { error } = await supabase
            .from('family_requests')
            .insert({ ...input, payload: {} });

        if (error) {
            console.error('Error creating family request:', error);
            throw new Error(error.message);
        }
    },
};
