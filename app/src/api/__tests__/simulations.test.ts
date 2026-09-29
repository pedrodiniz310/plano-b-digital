import * as SecureStore from 'expo-secure-store';
import { secureStore } from '../../state/secureStore';
import { fetchSimulationResults, submitSimulationResult } from '../simulations';

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

it('GET /simulations/results reads user results with the access token', async () => {
  const body = { results: [{ simulationId: 'roubo', hits: 4, timeSeconds: 90, completedAt: '2026-09-29T12:00:00.000Z' }] };
  await secureStore.setAccessToken('test-token');
  fetchMock.mockResolvedValueOnce(httpResponse(body));

  await expect(fetchSimulationResults()).resolves.toEqual(body);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/simulations/results'),
    expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
  );
});

it('POST /simulations/:id/results sends only hits and time', async () => {
  const body = { simulationId: 'roubo', hits: 5, timeSeconds: 45, completedAt: '2026-09-29T12:00:00.000Z' };
  await secureStore.setAccessToken('test-token');
  fetchMock.mockResolvedValueOnce(httpResponse(body));

  await expect(submitSimulationResult('roubo', { hits: 5, timeSeconds: 45 })).resolves.toEqual(body);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/simulations/roubo/results'),
    expect.objectContaining({ method: 'POST', body: JSON.stringify({ hits: 5, timeSeconds: 45 }), headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
  );
});
