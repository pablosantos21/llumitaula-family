import { supabase } from '../lib/supabase';

export type FamilyRequestType = 'special_menu' | 'dieta' | 'fuera_de_hora';
export type ContactMethod = 'email' | 'telefono' | 'otro';

/** Dirección de la salida fuera de horario respecto al horario habitual. */
export type FueraDeHoraDirection = 'antes' | 'despues';

export const MESSAGE_MAX_LENGTH = 1000;
export const CONTACT_DETAIL_MAX_LENGTH = 200;

export interface FamilyRequestInput {
    child_id: string;
    request_type: FamilyRequestType;
    date: string;
    message: string;
    contact_method?: ContactMethod | null;
    contact_detail?: string | null;
    /** Datos propios del tipo (p. ej. fuera_de_hora: { direction }). */
    payload?: Record<string, unknown> | null;
}

export class FamilyRequestError extends Error {
    code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.name = 'FamilyRequestError';
        this.code = code;
    }
}

export const FamilyRequestService = {
    create: async (input: FamilyRequestInput): Promise<void> => {
        const { error } = await supabase
            .from('family_requests')
            .insert({
                ...input,
                contact_method: input.contact_method ?? null,
                contact_detail: input.contact_detail ?? null,
                payload: input.payload ?? {},
            });

        if (error) {
            console.error('Error creating family request:', error);
            // Preserva el código Postgres (23505 = duplicado: hijo+fecha+tipo,
            // o hijo+fecha+dirección en fuera_de_hora; 42501 = RLS padre-hijo)
            // para mensajes claros en el formulario.
            throw new FamilyRequestError(error.message, (error as { code?: string }).code);
        }
    },
};
