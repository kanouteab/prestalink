import * as SecureStore from 'expo-secure-store';
import type { UserResponse } from '@prestalink/shared-types';

const TOKEN_KEY = 'prestalink_token';
const USER_KEY = 'prestalink_user';

/** SecureStore (Keychain/Keystore) plutot que AsyncStorage : le token de session ne doit pas atterrir en clair sur le disque (livrable 11). */
export async function readToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function readUser(): Promise<UserResponse | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  } catch {
    return null;
  }
}

export async function writeSession(user: UserResponse, token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch {
    // best effort
  }
}

export async function clearStoredSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    // best effort
  }
}
