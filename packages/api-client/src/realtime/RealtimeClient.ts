import { Client, type StompSubscription } from '@stomp/stompjs';

export type RealtimeConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface RealtimeClientOptions {
  /**
   * Web : passer `webSocketFactory: () => new SockJS(url)` pour matcher le
   * `.withSockJS()` du backend. Mobile (RN/Hermes) : passer `brokerUrl` en
   * `ws(s)://.../ws-prestalink/websocket` directement, sans SockJS (ses
   * transports de repli navigateur n'existent pas nativement sur RN).
   */
  brokerUrl?: string;
  webSocketFactory?: () => WebSocket;
  tokenProvider: () => string | null | Promise<string | null>;
  reconnectDelayMs?: number;
}

interface DesiredSubscription {
  topic: string;
  handler: (payload: unknown) => void;
}

/**
 * Abstraction temps reel commune Web/Mobile (livrable 23) : connexion,
 * reconnexion automatique, (re)abonnement par topic, nettoyage, etat exposable
 * a l'UI. Vient enfin exploiter les topics STOMP deja emis par le serveur
 * (voir realtimeTopics) — jamais consommes par l'ancien frontend.
 */
export class RealtimeClient {
  private readonly client: Client;
  private readonly desired = new Map<string, DesiredSubscription>();
  private readonly activeSubs = new Map<string, StompSubscription>();
  private readonly listeners = new Set<(state: RealtimeConnectionState) => void>();
  private state: RealtimeConnectionState = 'disconnected';

  constructor(options: RealtimeClientOptions) {
    this.client = new Client({
      brokerURL: options.brokerUrl,
      webSocketFactory: options.webSocketFactory,
      reconnectDelay: options.reconnectDelayMs ?? 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: async () => {
        const token = await options.tokenProvider();
        this.client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      },
      onConnect: () => {
        this.setState('connected');
        this.resubscribeAll();
      },
      onWebSocketClose: () => this.setState('disconnected'),
      onStompError: () => this.setState('error'),
    });
  }

  connect(): void {
    this.setState('connecting');
    this.client.activate();
  }

  disconnect(): void {
    this.client.deactivate();
    this.setState('disconnected');
  }

  getState(): RealtimeConnectionState {
    return this.state;
  }

  onStateChange(listener: (state: RealtimeConnectionState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Retourne une fonction de desabonnement — a appeler au demontage du composant/ecran. */
  subscribe<T>(topic: string, handler: (payload: T) => void): () => void {
    const id = `${topic}#${Math.random().toString(36).slice(2)}`;
    this.desired.set(id, { topic, handler: handler as (payload: unknown) => void });
    if (this.client.connected) this.activateSubscription(id);
    return () => this.unsubscribe(id);
  }

  private activateSubscription(id: string): void {
    const desired = this.desired.get(id);
    if (!desired) return;
    const subscription = this.client.subscribe(desired.topic, (message) => {
      try {
        desired.handler(JSON.parse(message.body));
      } catch {
        desired.handler(message.body);
      }
    });
    this.activeSubs.set(id, subscription);
  }

  private resubscribeAll(): void {
    for (const id of this.desired.keys()) this.activateSubscription(id);
  }

  private unsubscribe(id: string): void {
    this.desired.delete(id);
    this.activeSubs.get(id)?.unsubscribe();
    this.activeSubs.delete(id);
  }

  private setState(state: RealtimeConnectionState): void {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }
}
