/**
 * Les 9 topics STOMP deja emis par le backend (WebSocketConfig + SimpMessagingTemplate)
 * mais jamais ecoutes par l'ancien frontend. Le prefixe /app n'existe pas cote
 * serveur : aucun @MessageMapping n'est declare, la diffusion est uniquement
 * serveur -> client, tout ecrit passe par REST.
 */
export const realtimeTopics = {
  offers: () => '/topic/offers',
  requests: () => '/topic/requests',
  feed: () => '/topic/feed',
  dashboard: () => '/topic/dashboard',
  missions: () => '/topic/missions',
  userNotifications: (userId: number) => `/topic/users/${userId}`,
  missionChat: (missionId: number) => `/topic/missions/${missionId}/chat`,
  userChat: (userId: number) => `/topic/users/${userId}/chat`,
  conversationChat: (conversationKey: string) => `/topic/conversations/${conversationKey}/chat`,
  presence: () => '/topic/presence',
} as const;
