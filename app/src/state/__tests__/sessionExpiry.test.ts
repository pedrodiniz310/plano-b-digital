import { useAppStore } from '../store';
import { secureStore } from '../secureStore';
import { updateMe } from '../../api/me';

jest.mock('expo-secure-store', () => {
  const keystore = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => keystore.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => { keystore.set(key, value); }),
    deleteItemAsync: jest.fn(async (key: string) => { keystore.delete(key); }),
  };
});

jest.mock('../persist', () => ({
  PERSIST_KEY: 'test-store',
  asyncStorageAdapter: { getItem: jest.fn(() => null), setItem: jest.fn(), removeItem: jest.fn() },
}));

const fetchMock = jest.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

function httpResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) };
}

const user = { id: 'user-1', name: 'Pedro', email: 'pedro@example.test', guest: false };

beforeEach(async () => {
  fetchMock.mockReset();
  await secureStore.clearSession();
  useAppStore.setState({ user: null, status: 'idle', outbox: [], incidentOwnerId: null });
});

// Regressão: refresh recusado apagava os tokens mas deixava `user` na store —
// o app seguia "logado" e toda chamada (PATCH /me, POST /incidents) dava 401.
it('desloga localmente quando o servidor recusa o refresh token', async () => {
  await useAppStore.getState().setSession(user, { accessToken: 'access-velho', refreshToken: 'refresh-morto' });
  fetchMock
    .mockResolvedValueOnce(httpResponse(401, { code: 'unauthorized', message: 'Sessão inválida ou expirada.' }))
    .mockResolvedValueOnce(httpResponse(401, { code: 'invalid_refresh_token', message: 'Sessão expirada.' }));

  await expect(updateMe({ theme: 'dark' })).rejects.toMatchObject({ code: 'unauthorized' });
  await new Promise<void>((resolve) => setImmediate(resolve));

  expect(useAppStore.getState().user).toBeNull();
  expect(await secureStore.getRefreshToken()).toBeNull();
});

it('desloga quando não há refresh token guardado (Keystore vazio)', async () => {
  useAppStore.setState({ user, status: 'authenticated' });
  fetchMock.mockResolvedValueOnce(httpResponse(401, { code: 'unauthorized', message: 'Sessão inválida ou expirada.' }));

  await expect(updateMe({ theme: 'dark' })).rejects.toMatchObject({ code: 'unauthorized' });
  await new Promise<void>((resolve) => setImmediate(resolve));

  expect(useAppStore.getState().user).toBeNull();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('mantém a sessão quando a renovação falha por motivo transitório', async () => {
  await useAppStore.getState().setSession(user, { accessToken: 'access-velho', refreshToken: 'refresh-valido' });
  fetchMock
    .mockResolvedValueOnce(httpResponse(401, { code: 'unauthorized', message: 'x' }))
    .mockResolvedValueOnce(httpResponse(429, { code: 'rate_limited', message: 'x' }));

  await expect(updateMe({ theme: 'dark' })).rejects.toMatchObject({ code: 'rate_limited' });
  expect(useAppStore.getState().user).toEqual(user);
  expect(await secureStore.getRefreshToken()).toBe('refresh-valido');
});
