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
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
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
 *
 * `null` significa uma coisa só: a credencial guardada não vale mais — não
 * existe, ou o servidor a recusou com 401 — e aí o Keystore é limpo. Falha
 * transitória (429 do rate limit, 5xx, timeout, rede fora) preserva o token e
 * sobe como erro, porque a sessão continua válida. Apagar o refresh token de
 * uma conta visitante, que não tem e-mail e senha, é perda irreversível de
 * conta.
 */
let refreshInFlight: Promise<AuthSession | null> | null = null;

export async function refreshSession(): Promise<AuthSession | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      // O `finally` precisa cobrir toda saída, inclusive a de "não há token
      // guardado" — senão a renovação fica presa num resultado antigo.
      try {
        const refreshToken = await secureStore.getRefreshToken();
        if (!refreshToken) return null;
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
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await secureStore.clearSession();
          return null;
        }
        throw err;
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
      // Se a renovação falhar por motivo transitório, o erro dela sobe daqui e
      // substitui o 401: é a causa atual e é a que a tela sabe explicar.
      const renewed = await refreshSession();
      if (renewed) return rawRequest<T>(path, options, renewed.accessToken);
    }
    throw err;
  }
}
