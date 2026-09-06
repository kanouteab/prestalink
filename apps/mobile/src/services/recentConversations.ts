import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';

export type RecentConversation = RootStackParamList['Chat'] & { lastMessageAt: string };

const STORAGE_KEY = 'prestalink_recent_conversations';
const MAX_ENTRIES = 30;

/** Meme limite backend que le Web (pas d'endpoint "mes conversations", livrable H) : cache local des conversations ouvertes. */
export async function readRecentConversations(): Promise<RecentConversation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentConversation[]) : [];
  } catch {
    return [];
  }
}

export async function upsertRecentConversation(entry: RecentConversation): Promise<void> {
  try {
    const current = await readRecentConversations();
    const next = [entry, ...current.filter((c) => c.conversationKey !== entry.conversationKey)].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best effort
  }
}

export async function clearRecentConversations(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // best effort
  }
}
