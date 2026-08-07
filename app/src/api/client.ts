import { secureStore } from '../state/secureStore';
import type { AuthSession } from '../types/auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Rotas de auth (signup/login/refresh/recover) não devem tentar anexar/renovar token. */
  auth?: boolean;
}

async function rawRequest<T>(path: string, options: RequestOptions, accessToken?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const code = (data && data.code) || 'unknown_error';
    const message = (data && data.message) || `Falha na requisição (${res.status}).`;
    throw new ApiError(res.status, code, message);
  }

  return data as T;
}

/**
 * Renova a sessão usando o refresh token guardado — usada tanto no retry
 * automático de 401 quanto no login por biometria (que só reabre uma sessão
 * já existente, nunca cria uma nova: ver docs/decisions/0003-criptografia-
 * cofre.md sobre biometria nunca substituir auth de servidor). Só uma
 * renovação por vez em voo.
 */
let refreshInFlight: Promise<AuthSession | null> | null = null;

export async function refreshSession(): Promise<AuthSession | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = await secureStore.getRefreshToken();
      if (!refreshToken) return null;
      try {
        const session = await rawRequest<AuthSession>('/auth/refresh', {
          method: 'POST',
          body: { refreshToken },
          auth: true,
        });
        await Promise.all([
          secureStore.setAccessToken(session.accessToken),
          secureStore.setRefreshToken(session.refreshToken),
        ]);
        return session;
      } catch {
        await secureStore.clearSession();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/** Cliente HTTP tipado pro backend — anexa access token e renova uma vez em 401. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (options.auth) return rawRequest<T>(path, options);

  const accessToken = await secureStore.getAccessToken();
  try {
    return await rawRequest<T>(path, options, accessToken ?? undefined);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const renewed = await refreshSession();
      if (renewed) return rawRequest<T>(path, options, renewed.accessToken);
    }
    throw err;
  }
}
