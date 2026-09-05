export type NotificationPriority = 'INFO' | 'WARNING' | 'URGENT';

/**
 * Le backend melange des valeurs d'enum (NEW_REQUEST, NEW_OFFER, ...) et des
 * chaines libres pour le cycle de vie des missions (MISSION_CREATED_FOR_CLIENT...) :
 * `type` reste une chaine plutot qu'un enum ferme pour ne pas etre pris en defaut.
 */
export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: number;
  relatedPublicationId?: number;
  actorUserId?: number;
  priority: NotificationPriority;
}
