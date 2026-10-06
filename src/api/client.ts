import { storage } from '../utils/storage';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3500/api/v1').replace(/\/$/, '');

export type PaginationMeta = { page: number; limit: number; total: number; pages: number };
export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
};

export class ApiError extends Error {
  constructor(public status: number, public data: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function extractMessage(data: unknown, fallback: string) {
  if (typeof data === 'object' && data) {
    const value = (data as { message?: unknown }).message;
    if (typeof value === 'string' && value.trim()) return value;
    const nested = (data as { error?: { message?: unknown } }).error?.message;
    if (typeof nested === 'string' && nested.trim()) return nested;
  }
  return fallback;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const url = new URL(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`);
  Object.entries(options.query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  const token = storage.getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, null, 'Não foi possível ligar à API do AutoStand. Verifica se o backend está em execução.');
  }

  const text = await response.text();
  const parsed = text ? (() => {
    try { return JSON.parse(text) as unknown; } catch { return text; }
  })() : null;

  if (response.status === 401) {
    storage.clear();
    window.location.assign('/login');
    throw new ApiError(401, parsed, 'Sessão expirada.');
  }

  if (response.status === 403) {
    throw new ApiError(403, parsed, 'Não tens permissão para executar esta operação.');
  }

  if (response.status === 409) {
    throw new ApiError(409, parsed, extractMessage(parsed, 'A operação entrou em conflito com o estado atual do recurso. Atualiza os dados e tenta novamente.'));
  }

  if (!response.ok) {
    throw new ApiError(response.status, parsed, extractMessage(parsed, `Pedido falhou (${response.status}).`));
  }

  if (typeof parsed === 'object' && parsed !== null && 'success' in parsed && 'data' in parsed) {
    return parsed as ApiEnvelope<T>;
  }

  // Mantém compatibilidade caso uma rota antiga devolva diretamente o payload.
  return { success: true, data: parsed as T };
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) => request<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export function unwrap<T>(response: ApiEnvelope<T>): T {
  return response.data;
}

export function unwrapList<T>(response: ApiEnvelope<T[]>): { data: T[]; total: number; meta?: PaginationMeta } {
  return {
    data: response.data ?? [],
    total: response.meta?.total ?? response.data?.length ?? 0,
    meta: response.meta,
  };
}
