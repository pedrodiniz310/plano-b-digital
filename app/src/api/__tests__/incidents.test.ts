import { secureStore } from '../../state/secureStore';
import { closeIncident, completeIncidentAction, createIncident, fetchIncident } from '../incidents';

jest.mock('expo-secure-store', () => {
  const values = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => values.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => { values.set(key, value); }),
    deleteItemAsync: jest.fn(async (key: string) => { values.delete(key); }),
  };
});

const fetchMock = jest.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;
const response = { id: 'incident-1', scenarioId: 'celular', startedAt: '2026-09-29T10:00:00.000Z', closedAt: null, actions: [] };
function ok(body: unknown) { return { ok: true, status: 200, text: async () => JSON.stringify(body) }; }

beforeEach(async () => { await secureStore.clearSession(); await secureStore.setAccessToken('token'); fetchMock.mockReset(); });

it('sends create, action, close and read with auth and the required payloads', async () => {
  fetchMock.mockResolvedValueOnce(ok(response));
  await expect(createIncident('incident-1', 'celular')).resolves.toEqual(response);
  expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/incidents'), expect.objectContaining({ method: 'POST', body: JSON.stringify({ id: 'incident-1', scenarioId: 'celular' }), headers: expect.objectContaining({ Authorization: 'Bearer token' }) }));

  const action = { actionId: 'c1', completedAt: '2026-09-29T10:01:00.000Z', clientTimestamp: '2026-09-29T09:59:00.000Z' };
  fetchMock.mockResolvedValueOnce(ok(action));
  await expect(completeIncidentAction('incident-1', 'c1', action.clientTimestamp)).resolves.toEqual(action);
  expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/incidents/incident-1/actions'), expect.objectContaining({ method: 'POST', body: JSON.stringify({ actionId: 'c1', clientTimestamp: action.clientTimestamp }) }));

  fetchMock.mockResolvedValueOnce(ok({ ...response, closedAt: '2026-09-29T10:02:00.000Z' }));
  await closeIncident('incident-1');
  expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/incidents/incident-1/close'), expect.objectContaining({ method: 'POST' }));

  fetchMock.mockResolvedValueOnce(ok(response));
  await expect(fetchIncident('incident-1')).resolves.toEqual(response);
  expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/incidents/incident-1'), expect.objectContaining({ method: 'GET' }));
});
