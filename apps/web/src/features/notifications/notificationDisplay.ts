/**
 * Le backend melange enum (NotificationType) et chaines libres pour le cycle
 * de vie des missions (MISSION_CREATED_FOR_CLIENT...) — on ne suppose donc
 * jamais un ensemble ferme de valeurs (livrable H).
 */
export function notificationIcon(type: string): string {
  if (type.startsWith('MISSION')) return '🧾';
  switch (type) {
    case 'NEW_REQUEST':
      return '📩';
    case 'NEW_OFFER':
      return '🛠️';
    case 'NEW_COMMENT':
      return '💬';
    case 'NEW_RATING':
      return '⭐';
    case 'PUBLICATION_EXPIRED':
      return '⏰';
    case 'OFFER_VIEWED':
    case 'REQUEST_VIEWED':
      return '👁️';
    default:
      return '🔔';
  }
}
