import * as SecureStore from 'expo-secure-store';
import { secureStore } from '../../state/secureStore';
import { ApiError, apiRequest, refreshSession } from '../client';

jest.mock('expo-secure-store', () => {
  const keystore = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => keystore.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      keystore.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      keystore.delete(key);
    }),
  };
});

const fetchMock = jest.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

function httpResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  };
}

const SESSAO = {
  user: { id: 'u1', name: 'Pedro', email: 'pedro.demo@planob.app', isGuest: false },
  accessToken: 'access-novo',
  refreshToken: 'refresh-novo',
};

beforeEach(async () => {
  await secureStore.clearSession();
  fetchMock.mockReset();
  (SecureStore.getItemAsync as jest.Mock).mockClear();
  (SecureStore.setItemAsync as jest.Mock).mockClear();
  (SecureStore.deleteItemAsync as jest.Mock).mockClear();
});

describe('refreshSession', () => {
  it('troca os tokens guardados quando o servidor renova a sessão', async () => {
    await secureStore.setRefreshToken('refresh-antigo');
    fetchMock.mockResolvedValueOnce(httpResponse(200, SESSAO));

    await expect(refreshSession()).resolves.toEqual(SESSAO);
    expect(await secureStore.getAccessToken()).toBe('access-novo');
    expect(await secureStore.getRefreshToken()).toBe('refresh-novo');
  });

  it('devolve null sem chamar a rede quando não há refresh token guardado', async () => {
    await expect(refreshSession()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // A renovação em voo é memorizada pra não sair duas de uma vez; se a memória
  // não for liberada em toda saída, a primeira tentativa sem token guardado
  // congela o resultado e nenhuma renovação posterior chega ao servidor.
  it('não trava a renovação depois de uma tentativa sem token guardado', async () => {
    await expect(refreshSession()).resolves.toBeNull();

    await secureStore.setRefreshToken('refresh-antigo');
    fetchMock.mockResolvedValueOnce(httpResponse(200, SESSAO));
    await expect(refreshSession()).resolves.toEqual(SESSAO);
  });

  // Regressão: o rate limit de /auth/refresh (backend/src/plugins/rateLimit.ts)
  // fez esse endpoint responder 429 com a sessão perfeitamente válida. Apagar o
  // Keystore aí deixa conta de visitante órfã — o refresh token é a única
  // credencial que ela tem.
  it('preserva o Keystore quando o servidor responde 429', async () => {
    await secureStore.setRefreshToken('refresh-valido');
    fetchMock.mockResolvedValueOnce(
      httpResponse(429, { code: 'rate_limited', message: 'Muitas tentativas em pouco tempo.' })
    );

    await expect(refreshSession()).rejects.toBeInstanceOf(ApiError);
    expect(await secureStore.getRefreshToken()).toBe('refresh-valido');
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('preserva o Keystore quando o servidor responde 500', async () => {
    await secureStore.setRefreshToken('refresh-valido');
    fetchMock.mockResolvedValueOnce(
      httpResponse(500, { code: 'internal_error', message: 'Algo deu errado.' })
    );

    await expect(refreshSession()).rejects.toBeInstanceOf(ApiError);
    expect(await secureStore.getRefreshToken()).toBe('refresh-valido');
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('preserva o Keystore quando a rede falha', async () => {
    await secureStore.setRefreshToken('refresh-valido');
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(refreshSession()).rejects.toThrow('Network request failed');
    expect(await secureStore.getRefreshToken()).toBe('refresh-valido');
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('apaga o Keystore quando o servidor responde 401', async () => {
    await secureStore.setAccessToken('access-velho');
    await secureStore.setRefreshToken('refresh-revogado');
    fetchMock.mockResolvedValueOnce(
      httpResponse(401, { code: 'invalid_refresh_token', message: 'Sessão expirada.' })
    );

    await expect(refreshSession()).resolves.toBeNull();
    expect(await secureStore.getAccessToken()).toBeNull();
    expect(await secureStore.getRefreshToken()).toBeNull();
  });
});

describe('apiRequest', () => {
  it('preserva o Keystore quando o refresh disparado por 401 leva 429', async () => {
    await secureStore.setAccessToken('access-expirado');
    await secureStore.setRefreshToken('refresh-valido');
    fetchMock
      .mockResolvedValueOnce(httpResponse(401, { code: 'unauthorized', message: 'Sessão expirada.' }))
      .mockResolvedValueOnce(
        httpResponse(429, { code: 'rate_limited', message: 'Muitas tentativas em pouco tempo.' })
      );

    await expect(apiRequest('/me')).rejects.toMatchObject({ status: 429, code: 'rate_limited' });
    expect(await secureStore.getRefreshToken()).toBe('refresh-valido');
  });
});
