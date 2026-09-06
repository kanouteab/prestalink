import { create } from 'zustand';
import type { UserResponse } from '@prestalink/shared-types';
import { readToken, readUser, writeSession, clearStoredSession } from '../services/authStorage';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (user: UserResponse, token: string) => Promise<void>;
  updateUser: (user: UserResponse) => Promise<void>;
  clearSession: () => Promise<void>;
}

/**
 * Contrairement au Web (localStorage, lecture synchrone), SecureStore est
 * asynchrone : l'etat demarre vide et se remplit via `hydrate()` au lancement
 * de l'app (voir RootNavigator), d'ou le flag `isHydrated`.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isHydrated: false,
  hydrate: async () => {
    const [token, user] = await Promise.all([readToken(), readUser()]);
    set({ token, user, isHydrated: true });
  },
  setSession: async (user, token) => {
    await writeSession(user, token);
    set({ user, token });
  },
  updateUser: async (user) => {
    const token = get().token;
    if (token) await writeSession(user, token);
    set({ user });
  },
  clearSession: async () => {
    await clearStoredSession();
    set({ user: null, token: null });
  },
}));

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => Boolean(state.token && state.user));
}
