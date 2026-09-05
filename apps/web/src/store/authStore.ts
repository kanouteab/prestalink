import { create } from 'zustand';
import type { UserResponse } from '@prestalink/shared-types';
import { readToken, readUser, writeSession, clearStoredSession } from '../services/authStorage';
import { clearRecentConversations } from '../services/recentConversations';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  setSession: (user: UserResponse, token: string) => void;
  updateUser: (user: UserResponse) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readUser(),
  token: readToken(),
  setSession: (user, token) => {
    writeSession(user, token);
    set({ user, token });
  },
  updateUser: (user) => {
    const token = get().token;
    if (token) writeSession(user, token);
    set({ user });
  },
  clearSession: () => {
    clearStoredSession();
    clearRecentConversations();
    set({ user: null, token: null });
  },
}));

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => Boolean(state.token && state.user));
}
