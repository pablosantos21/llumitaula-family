import { supabase } from '../lib/supabase';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'parent';
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

        return {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: 'parent',
        };
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

        return {
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: 'parent',
        };
    },

    onAuthStateChange: (callback: (user: User | null) => void) => {
        return supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                callback({
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                    role: 'parent',
                });
            } else {
                callback(null);
            }
        });
    }
};
