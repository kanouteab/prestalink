import { ApiError, ApiNetworkError, ApiTimeoutError } from './errors.js';

export type QueryValue = string | number | boolean | undefined | null;

export interface TokenStore {
  /** Web: lecture synchrone (localStorage). Mobile: lecture asynchrone (SecureStore). */
  getToken(): string | null | Promise<string | null>;
  /** Appele quand le serveur repond 401 : a chaque plateforme de nettoyer sa session. */
  onUnauthorized?(): void;
}

export interface ApiClientOptions {
  baseUrl: string;
  tokenStore: TokenStore;
  timeoutMs?: number;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Corps deja construit (FormData) pour les uploads multipart. */
  formData?: FormData;
  signal?: AbortSignal;
  /** Certains endpoints backend n'exigent pas de jeton (feeds publics). */
  auth?: boolean;
}

function buildQueryString(query?: Record<string, QueryValue>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Client HTTP unique pour toute la plateforme : Web et Mobile en injectent
 * chacun leur `TokenStore` mais partagent la meme logique de base URL,
 * en-tetes, timeout et parsing d'erreur (livrable 21).
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly tokenStore: TokenStore;
  private readonly timeoutMs: number;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.tokenStore = options.tokenStore;
    this.timeoutMs = options.timeoutMs ?? 15000;
  }

  /** Expose pour construire l'URL du endpoint STOMP (`{baseUrl}/ws-prestalink`) sans dupliquer la config. */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /** Prefixe les URLs relatives renvoyees par le backend (ex. /uploads/offer/x.jpg). */
  resolveAssetUrl(relativeUrl: string): string {
    if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;
    return `${this.baseUrl}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', query, body, formData, signal, auth = true } = options;
    const url = `${this.baseUrl}${path}${buildQueryString(query)}`;

    const headers = new Headers();
    if (!formData) headers.set('Content-Type', 'application/json');

    if (auth) {
      const token = await this.tokenStore.getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
        signal: controller.signal,
      });
    } catch (cause) {
      clearTimeout(timeout);
      if (controller.signal.aborted) throw new ApiTimeoutError(path);
      throw new ApiNetworkError(path, cause);
    }
    clearTimeout(timeout);

    if (response.status === 401) {
      this.tokenStore.onUnauthorized?.();
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const raw = await response.text();
    const parsed = raw ? safeJsonParse(raw) : undefined;

    if (!response.ok) {
      const message = extractErrorMessage(parsed, raw, response.statusText);
      throw new ApiError(message, response.status, { path, details: parsed ?? raw });
    }

    return parsed as T;
  }

  get<T>(path: string, query?: Record<string, QueryValue>, options?: Omit<RequestOptions, 'method' | 'query'>) {
    return this.request<T>(path, { ...options, method: 'GET', query });
  }

  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  delete<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  upload<T>(path: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'formData'>) {
    return this.request<T>(path, { ...options, method: 'POST', formData });
  }
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function extractErrorMessage(parsed: unknown, raw: string, statusText: string): string {
  if (parsed && typeof parsed === 'object' && 'message' in parsed) {
    const message = (parsed as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return raw || statusText || 'Une erreur est survenue';
}
