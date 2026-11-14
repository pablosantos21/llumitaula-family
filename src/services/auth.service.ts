import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'monitor' | 'parent' | 'worker' | 'supervisor';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

type AuthUser = NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>;

const VALID_ROLES: UserRole[] = ['admin', 'monitor', 'parent', 'worker', 'supervisor'];

export const RESTRICTED_ACCESS_MESSAGE =
    'Acceso restringido: esta aplicación es solo para familias.';
export const PROFILE_LOAD_ERROR_MESSAGE =
    'No se pudo verificar el perfil del usuario. Comprueba tu conexión e inténtalo de nuevo.';
export const CONNECTION_ERROR_MESSAGE =
    'Error de conexión. Comprueba tu conexión e inténtalo de nuevo.';
export const INVALID_CREDENTIALS_MESSAGE = 'Credenciales incorrectas';

/** Traduce errores de autenticación y perfil a mensajes comprensibles en español. */
export function getLoginErrorMessage(error: unknown): string {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message: unknown }).message === 'string'
              ? (error as { message: string }).message
              : typeof error === 'string'
                ? error
                : '';

    if (message === RESTRICTED_ACCESS_MESSAGE) {
        return RESTRICTED_ACCESS_MESSAGE;
    }

    if (
        message === PROFILE_LOAD_ERROR_MESSAGE ||
        /failed to fetch|network|fetch|timeout|econnrefused|connection/i.test(message)
    ) {
        return CONNECTION_ERROR_MESSAGE;
    }

    return INVALID_CREDENTIALS_MESSAGE;
}

async function loadProfile(userId: string): Promise<{ role: UserRole | null; fullName: string | null }> {
    const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(PROFILE_LOAD_ERROR_MESSAGE);
    }

    const role = data && VALID_ROLES.includes(data.role as UserRole) ? (data.role as UserRole) : null;

    return { role, fullName: data?.full_name ?? null };
}

async function getParentUser(authUser: AuthUser): Promise<User | null> {
    const profile = await loadProfile(authUser.id);
    if (profile.role !== 'parent') return null;

    return {
        id: authUser.id,
        name: profile.fullName || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: profile.role,
    };
}

export const AuthService = {
    login: async (email: string, password: string): Promise<User> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error);
            throw new Error(error.message);
        }

        if (!data.user) {
            throw new Error('Login failed: No user returned');
        }

        const user = await getParentUser(data.user);
        if (!user) {
            await supabase.auth.signOut();
            throw new Error(RESTRICTED_ACCESS_MESSAGE);
        }

        return user;
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        return getParentUser(user);
    },

    onAuthStateChange: (callback: (user: User | null) => void) => {
        return supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                void getParentUser(session.user)
                    .then(callback)
                    .catch((err) => {
                        console.error('Error refreshing user profile:', err);
                    });
            } else {
                callback(null);
            }
        });
    }
};
