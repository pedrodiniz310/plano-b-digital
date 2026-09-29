import * as SecureStore from 'expo-secure-store';
import { secureStore } from '../../state/secureStore';
import { fetchPlan, setTaskCompleted } from '../plan';

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

function httpResponse(body: unknown) {
  return { ok: true, status: 200, text: async () => JSON.stringify(body) };
}

beforeEach(async () => {
  await secureStore.clearSession();
  fetchMock.mockReset();
  (SecureStore.getItemAsync as jest.Mock).mockClear();
});

it('GET /plan reads only task state with the access token', async () => {
  const body = { tasks: [{ taskId: 't1', completed: true, completedAt: '2026-09-28T12:00:00.000Z' }] };
  await secureStore.setAccessToken('test-token');
  fetchMock.mockResolvedValueOnce(httpResponse(body));

  await expect(fetchPlan()).resolves.toEqual(body);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/plan'),
    expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
  );
});

it('PATCH /plan/tasks/:taskId sends the boolean and returns server completion time', async () => {
  const body = { taskId: 't15', completed: true, completedAt: '2026-09-28T12:00:00.000Z' };
  await secureStore.setAccessToken('test-token');
  fetchMock.mockResolvedValueOnce(httpResponse(body));

  await expect(setTaskCompleted('t15', true)).resolves.toEqual(body);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/plan/tasks/t15'),
    expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ completed: true }), headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
  );
});
