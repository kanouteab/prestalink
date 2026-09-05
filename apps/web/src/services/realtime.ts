import SockJS from 'sockjs-client';
import { RealtimeClient } from '@prestalink/api-client';
import { readToken } from './authStorage';
import { apiClient } from './apiClient';

/**
 * Le backend enregistre l'endpoint STOMP avec `.withSockJS()` (WebSocketConfig) :
 * on utilise donc SockJS cote Web pour matcher exactement ce que le serveur
 * attend, plutot qu'un WebSocket brut (reserve au client React Native, voir
 * packages/api-client/src/realtime/RealtimeClient.ts).
 */
export const realtimeClient = new RealtimeClient({
  webSocketFactory: () => new SockJS(`${apiClient.getBaseUrl()}/ws-prestalink`) as unknown as WebSocket,
  tokenProvider: () => readToken(),
});
