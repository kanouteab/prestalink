import type { ChatContext } from '../features/chat/types';

export interface RecentConversation extends ChatContext {
  lastMessageAt: string;
}

const STORAGE_KEY = 'prestalink_recent_conversations';
const MAX_ENTRIES = 30;

/**
 * Le backend n'expose aucun endpoint "mes conversations" (livrable H) — le
 * chat est toujours ouvert depuis une publication precise. Cette liste locale
 * reconstitue un inbox utilisable en attendant un vrai endpoint serveur ;
 * a remplacer des qu'il existe.
 */
export function readRecentConversations(): RecentConversation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentConversation[]) : [];
  } catch {
    return [];
  }
}

export function upsertRecentConversation(entry: RecentConversation): void {
  try {
    const withoutEntry = readRecentConversations().filter((c) => c.conversationKey !== entry.conversationKey);
    const next = [entry, ...withoutEntry].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best effort
  }
}

export function clearRecentConversations(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // best effort
  }
}
