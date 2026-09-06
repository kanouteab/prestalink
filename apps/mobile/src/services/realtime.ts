import { RealtimeClient } from '@prestalink/api-client';
import { apiClient } from './apiClient';
import { readToken } from './authStorage';

/**
 * Contrairement au Web (SockJS, pour matcher .withSockJS() du backend), RN
 * fournit un WebSocket natif : on se connecte directement sur le chemin
 * websocket brut de SockJS, sans ses transports de repli navigateur
 * (livrable H / architecture I).
 */
const wsBaseUrl = apiClient.getBaseUrl().replace(/^http/, 'ws');

export const realtimeClient = new RealtimeClient({
  brokerUrl: `${wsBaseUrl}/ws-prestalink/websocket`,
  tokenProvider: () => readToken(),
});
