import type { UserResponse } from '@prestalink/shared-types';

const TOKEN_KEY = 'prestalink_token';
const USER_KEY = 'prestalink_user';

export function readToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function readUser(): UserResponse | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  } catch {
    return null;
  }
}

export function writeSession(user: UserResponse, token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // stockage indisponible (navigation privee) : la session reste valide pour l'onglet courant.
  }
}

export function clearStoredSession(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // best effort
  }
}
