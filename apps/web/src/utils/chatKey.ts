import type { PublicationType } from '@prestalink/shared-types';

/**
 * Reproduit exactement la convention du backend
 * (`"direct:" + min(id1,id2) + ":" + max(id1,id2) + ":" + type + ":" + pubId`)
 * pour que le message emis matche le meme conversationKey cote serveur.
 */
export function buildDirectConversationKey(
  userIdA: number,
  userIdB: number,
  publicationType: PublicationType,
  publicationId: number,
): string {
  const min = Math.min(userIdA, userIdB);
  const max = Math.max(userIdA, userIdB);
  return `direct:${min}:${max}:${publicationType}:${publicationId}`;
}
