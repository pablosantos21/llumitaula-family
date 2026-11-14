import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSignInWithPassword, mockSignOut, mockFrom } = vi.hoisted(() => ({
    mockSignInWithPassword: vi.fn(),
    mockSignOut: vi.fn(),
    mockFrom: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: mockSignInWithPassword,
            signOut: mockSignOut,
            getUser: vi.fn(),
            onAuthStateChange: vi.fn(),
        },
        from: mockFrom,
    },
}));

import {
    AuthService,
    CONNECTION_ERROR_MESSAGE,
    getLoginErrorMessage,
    INVALID_CREDENTIALS_MESSAGE,
    PROFILE_LOAD_ERROR_MESSAGE,
    RESTRICTED_ACCESS_MESSAGE,
} from './auth.service';

function mockProfileQuery(result: { data: unknown; error: unknown }) {
    const maybeSingle = vi.fn().mockResolvedValue(result);
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });
}

describe('getLoginErrorMessage', () => {
    it('distingue acceso restringido, fallos de red y credenciales inválidas', () => {
        expect(getLoginErrorMessage(new Error(RESTRICTED_ACCESS_MESSAGE))).toBe(
            RESTRICTED_ACCESS_MESSAGE,
        );
        expect(getLoginErrorMessage(new Error(PROFILE_LOAD_ERROR_MESSAGE))).toBe(
            CONNECTION_ERROR_MESSAGE,
        );
        expect(getLoginErrorMessage(new TypeError('Failed to fetch'))).toBe(
            CONNECTION_ERROR_MESSAGE,
        );
        expect(getLoginErrorMessage(new Error('Invalid login credentials'))).toBe(
            INVALID_CREDENTIALS_MESSAGE,
        );
        expect(getLoginErrorMessage(null)).toBe(INVALID_CREDENTIALS_MESSAGE);
    });
});

describe('AuthService.login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSignOut.mockResolvedValue({ error: null });
    });

    it('inicia sesión correctamente para una cuenta con rol parent', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: {
                user: {
                    id: 'user-1',
                    email: 'familia@ejemplo.com',
                    user_metadata: {},
                },
            },
            error: null,
        });
        mockProfileQuery({
            data: { role: 'parent', full_name: 'María López' },
            error: null,
        });

        const user = await AuthService.login('familia@ejemplo.com', 'secret');

        expect(user).toEqual({
            id: 'user-1',
            name: 'María López',
            email: 'familia@ejemplo.com',
            role: 'parent',
        });
        expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('cierra sesión y lanza acceso restringido cuando el usuario no es parent', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: {
                user: {
                    id: 'user-2',
                    email: 'monitor@ejemplo.com',
                    user_metadata: {},
                },
            },
            error: null,
        });
        mockProfileQuery({
            data: { role: 'monitor', full_name: 'Monitor' },
            error: null,
        });

        await expect(
            AuthService.login('monitor@ejemplo.com', 'secret'),
        ).rejects.toThrow(RESTRICTED_ACCESS_MESSAGE);
        expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('no confunde un error de red al leer el perfil con acceso restringido ni destruye la sesión', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: {
                user: {
                    id: 'user-1',
                    email: 'familia@ejemplo.com',
                    user_metadata: {},
                },
            },
            error: null,
        });
        mockProfileQuery({
            data: null,
            error: { message: 'Failed to fetch' },
        });

        await expect(
            AuthService.login('familia@ejemplo.com', 'secret'),
        ).rejects.toThrow(PROFILE_LOAD_ERROR_MESSAGE);
        expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('propaga el error de credenciales incorrectas cuando falla signInWithPassword', async () => {
        mockSignInWithPassword.mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid login credentials' },
        });

        await expect(
            AuthService.login('familia@ejemplo.com', 'wrong'),
        ).rejects.toThrow('Invalid login credentials');
        expect(mockFrom).not.toHaveBeenCalled();
    });
});
