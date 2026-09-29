import { sendIncidentOp } from '../../api/incidents';
import { useAppStore } from '../store';
import { syncOutbox } from '../syncIncidents';

jest.mock('../persist', () => ({
  PERSIST_KEY: 'test-store',
  asyncStorageAdapter: { getItem: jest.fn(() => null), setItem: jest.fn(), removeItem: jest.fn() },
}));
jest.mock('../secureStore', () => ({
  secureStore: { setAccessToken: jest.fn(async () => {}), setRefreshToken: jest.fn(async () => {}), clearSession: jest.fn(async () => {}) },
}));
jest.mock('../../api/incidents', () => ({ sendIncidentOp: jest.fn() }));

const user = { id: 'user-1', name: 'Teste', email: 'teste@example.test', guest: false };

beforeEach(async () => {
  (sendIncidentOp as jest.Mock).mockReset();
  useAppStore.setState({ user: null, status: 'idle', activeIncident: null, lastReport: null, outbox: [] });
  await useAppStore.getState().setSession(user, { accessToken: 'access', refreshToken: 'refresh' });
});

it('is single-flight and writes server timestamps to the closed report', async () => {
  const store = useAppStore.getState();
  store.startIncident('incident-1', 'celular', '2026-09-29T09:59:00.000Z');
  store.completeAction('c1', '2026-09-29T10:00:00.000Z');
  store.finishIncident('2026-09-29T10:01:00.000Z');
  const response = { id: 'incident-1', scenarioId: 'celular', startedAt: '2026-09-29T10:02:00.000Z', closedAt: null, actions: [] };
  (sendIncidentOp as jest.Mock)
    .mockResolvedValueOnce(response)
    .mockResolvedValueOnce({ actionId: 'c1', completedAt: '2026-09-29T10:03:00.000Z', clientTimestamp: '2026-09-29T10:00:00.000Z' })
    .mockResolvedValueOnce({ ...response, closedAt: '2026-09-29T10:04:00.000Z', actions: [{ actionId: 'c1', completedAt: '2026-09-29T10:03:00.000Z', clientTimestamp: '2026-09-29T10:00:00.000Z' }] });
  const first = syncOutbox();
  const second = syncOutbox();
  expect(second).toBe(first);
  await first;
  expect((sendIncidentOp as jest.Mock).mock.calls.map(([op]) => op.kind)).toEqual(['create', 'action', 'close']);
  expect(useAppStore.getState().outbox).toEqual([]);
  expect(useAppStore.getState().lastReport).toEqual(expect.objectContaining({
    startedAtServer: '2026-09-29T10:02:00.000Z', closedAtServer: '2026-09-29T10:04:00.000Z',
    actions: { c1: { clientTimestamp: '2026-09-29T10:00:00.000Z', completedAt: '2026-09-29T10:03:00.000Z' } },
  }));
});
