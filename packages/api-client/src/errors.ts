export class ApiError extends Error {
  readonly status: number;
  readonly path?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, options?: { path?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = options?.path;
    this.details = options?.details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export class ApiTimeoutError extends ApiError {
  constructor(path: string) {
    super('La requete a expire', 408, { path });
    this.name = 'ApiTimeoutError';
  }
}

export class ApiNetworkError extends ApiError {
  constructor(path: string, cause?: unknown) {
    super('Impossible de joindre le serveur', 0, { path, details: cause });
    this.name = 'ApiNetworkError';
  }
}
