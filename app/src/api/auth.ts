import { apiRequest } from './client';
import type { AuthSession } from '../types/auth';

export function signup(input: { name: string; email: string; password: string }): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/signup', { method: 'POST', body: input, auth: true });
}

export function login(input: { email: string; password: string }): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', { method: 'POST', body: input, auth: true });
}

/** Cria uma conta de visitante no servidor — sem e-mail/senha, mas com sessão real. */
export function guest(): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/guest', { method: 'POST', auth: true });
}

export function recover(input: { email: string }): Promise<{ sent: true }> {
  return apiRequest<{ sent: true }>('/auth/recover', { method: 'POST', body: input, auth: true });
}

/** Não renova a sessão durante a saída: ela pode estar sendo apagada localmente. */
export async function logoutRemote(refreshToken: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    await apiRequest<void>('/auth/logout', {
      method: 'POST', body: { refreshToken }, signal: controller.signal, retryOnUnauthorized: false,
    });
  } finally {
    clearTimeout(timer);
  }
}
