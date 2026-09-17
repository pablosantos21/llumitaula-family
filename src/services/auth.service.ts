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

async function loadProfile(userId: string): Promise<{ role: UserRole | null; fullName: string | null }> {
    const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching user profile:', error);
        return { role: null, fullName: null };
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
        console.log('Attempting login for:', email);
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
            throw new Error('Acceso restringido: esta aplicación es solo para familias.');
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
                void getParentUser(session.user).then(callback);
            } else {
                callback(null);
            }
        });
    }
};
