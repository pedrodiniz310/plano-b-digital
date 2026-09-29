import * as SecureStore from 'expo-secure-store';
import { secureStore } from '../../state/secureStore';
import { fetchMe, updateMe } from '../me';
import { logoutRemote } from '../auth';

jest.mock('expo-secure-store', () => {
  const keystore = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => keystore.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => { keystore.set(key, value); }),
    deleteItemAsync: jest.fn(async (key: string) => { keystore.delete(key); }),
  };
});

const fetchMock = jest.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

beforeEach(async () => {
  fetchMock.mockReset();
  await secureStore.clearSession();
  (SecureStore.getItemAsync as jest.Mock).mockClear();
});

it('fetches masked profile and PATCHes one preference using access auth', async () => {
  const me = { name: 'Pessoa', emailMasked: 'p•••@example.test', guest: false, theme: 'light', contrast: false, fontSize: 's' };
  await secureStore.setAccessToken('access');
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: async () => JSON.stringify(me) });
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: async () => JSON.stringify({ ...me, theme: 'dark' }) });
  await expect(fetchMe()).resolves.toEqual(me);
  await expect(updateMe({ theme: 'dark' })).resolves.toMatchObject({ theme: 'dark' });
  expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringContaining('/me'), expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ theme: 'dark' }), headers: expect.objectContaining({ Authorization: 'Bearer access' }) }));
});

it('sends logout with access auth and does not refresh on a rejected access token', async () => {
  await secureStore.setAccessToken('access');
  fetchMock.mockResolvedValueOnce({ ok: false, status: 401, text: async () => JSON.stringify({ code: 'unauthorized', message: 'Sessão expirada' }) });
  await expect(logoutRemote('refresh')).rejects.toMatchObject({ status: 401, code: 'unauthorized' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/logout'), expect.objectContaining({ method: 'POST', body: JSON.stringify({ refreshToken: 'refresh' }), headers: expect.objectContaining({ Authorization: 'Bearer access' }), signal: expect.any(AbortSignal) }));
});
