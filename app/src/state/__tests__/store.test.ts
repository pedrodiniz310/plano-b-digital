import { useAppStore } from '../store';
import { asyncStorageAdapter } from '../persist';
import { secureStore } from '../secureStore';
import { logoutRemote } from '../../api/auth';
import { updateMe } from '../../api/me';

jest.mock('../../api/auth', () => ({ logoutRemote: jest.fn(async () => {}) }));
jest.mock('../../api/me', () => ({ updateMe: jest.fn(async () => ({})) }));

jest.mock('../persist', () => ({
  PERSIST_KEY: 'test-store',
  asyncStorageAdapter: { getItem: jest.fn(() => null), setItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock('../secureStore', () => ({
  secureStore: {
    setAccessToken: jest.fn(async () => {}),
    setRefreshToken: jest.fn(async () => {}),
    getRefreshToken: jest.fn(async () => 'refresh'),
    clearSession: jest.fn(async () => {}),
  },
}));

const user = { id: 'user-1', name: 'Teste', email: 'teste@example.test', guest: false };
const tokens = { accessToken: 'access', refreshToken: 'refresh' };

beforeEach(() => {
  jest.clearAllMocks();
  useAppStore.setState({ user: null, emailMasked: null, status: 'idle', answers: null, baseScore: null, completedTaskIds: [], completedSimulationIds: [], hasTrustedContact: false, activeIncident: null, lastReport: null, outbox: [], incidentOwnerId: null, retainedIncidents: {} });
});

it('toggles task completion without duplicates', () => {
  const store = useAppStore.getState();
  store.setTaskCompleted('t1', true);
  store.setTaskCompleted('t1', true);
  expect(useAppStore.getState().completedTaskIds).toEqual(['t1']);
  store.setTaskCompleted('t1', false);
  expect(useAppStore.getState().completedTaskIds).toEqual([]);
});

it('clears task state on account switch and logout', async () => {
  await useAppStore.getState().setSession(user, tokens);
  useAppStore.getState().setCompletedTasks(['t1', 't2']);
  await useAppStore.getState().setSession(user, tokens);
  expect(useAppStore.getState().completedTaskIds).toEqual(['t1', 't2']);
  await useAppStore.getState().setSession({ ...user, id: 'user-2' }, tokens);
  expect(useAppStore.getState().completedTaskIds).toEqual([]);
  useAppStore.getState().setTaskCompleted('t3', true);
  await useAppStore.getState().logout();
  expect(useAppStore.getState().completedTaskIds).toEqual([]);
});

it('records incident operations locally in order and keeps completed actions append-only', async () => {
  await useAppStore.getState().setSession(user, tokens);
  const store = useAppStore.getState();
  store.startIncident('incident-1', 'celular', '2026-09-29T10:00:00.000Z');
  expect(asyncStorageAdapter?.setItem).toHaveBeenLastCalledWith('test-store', expect.objectContaining({
    state: expect.objectContaining({ activeIncident: expect.objectContaining({ id: 'incident-1' }), outbox: [expect.objectContaining({ kind: 'create' })] }),
  }));
  store.completeAction('c1', '2026-09-29T10:01:00.000Z');
  store.completeAction('c1', '2026-09-29T10:02:00.000Z');
  store.finishIncident('2026-09-29T10:03:00.000Z');
  expect(useAppStore.getState().activeIncident).toBeNull();
  expect(useAppStore.getState().lastReport?.actions.c1.clientTimestamp).toBe('2026-09-29T10:01:00.000Z');
  expect(useAppStore.getState().outbox.map((op) => op.kind)).toEqual(['create', 'action', 'close']);
});

it('keeps pending incident evidence for its owner across logout and account switch', async () => {
  await useAppStore.getState().setSession(user, tokens);
  useAppStore.getState().startIncident('incident-1', 'celular', '2026-09-29T10:00:00.000Z');
  await useAppStore.getState().logout();
  expect(useAppStore.getState().outbox).toHaveLength(1);
  expect(useAppStore.getState().activeIncident?.id).toBe('incident-1');
  await useAppStore.getState().setSession({ ...user, id: 'user-2' }, tokens);
  expect(useAppStore.getState().activeIncident).toBeNull();
  expect(useAppStore.getState().outbox).toEqual([]);
  expect(useAppStore.getState().retainedIncidents['user-1'].outbox).toHaveLength(1);
  await useAppStore.getState().setSession(user, tokens);
  expect(useAppStore.getState().outbox).toHaveLength(1);
  expect(useAppStore.getState().activeIncident?.id).toBe('incident-1');
});

it('revokes refresh token best effort before clearing local session', async () => {
  await useAppStore.getState().setSession(user, tokens);
  await useAppStore.getState().logout();
  expect(logoutRemote).toHaveBeenCalledWith('refresh');
  expect(secureStore.clearSession).toHaveBeenCalledTimes(1);
  (logoutRemote as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  await useAppStore.getState().setSession(user, tokens);
  await expect(useAppStore.getState().logout()).resolves.toBeUndefined();
  expect(secureStore.clearSession).toHaveBeenCalledTimes(2);
  expect(warning).toHaveBeenCalledWith('network_error');
  warning.mockRestore();
});

it('applies server preferences and patches changed preferences immediately', async () => {
  await useAppStore.getState().setSession(user, tokens);
  useAppStore.getState().applyMe({ name: 'Nome do servidor', emailMasked: 'p•••@example.test', guest: false, theme: 'dark', contrast: true, fontSize: 'g' });
  expect(useAppStore.getState()).toMatchObject({ theme: 'dark', contrast: true, font: 'g', emailMasked: 'p•••@example.test', user: { name: 'Nome do servidor' } });
  useAppStore.getState().setTheme('light');
  useAppStore.getState().toggleContrast();
  useAppStore.getState().setFont('m');
  expect(useAppStore.getState()).toMatchObject({ theme: 'light', contrast: false, font: 'm' });
  expect(updateMe).toHaveBeenCalledWith({ theme: 'light' });
  expect(updateMe).toHaveBeenCalledWith({ contrast: false });
  expect(updateMe).toHaveBeenCalledWith({ fontSize: 'm' });
});

it('keeps contact status for the same account and clears it on switch and logout', async () => {
  await useAppStore.getState().setSession(user, tokens);
  useAppStore.getState().setHasTrustedContact(true);
  await useAppStore.getState().setSession(user, tokens);
  expect(useAppStore.getState().hasTrustedContact).toBe(true);
  await useAppStore.getState().setSession({ ...user, id: 'user-2' }, tokens);
  expect(useAppStore.getState().hasTrustedContact).toBe(false);
  useAppStore.getState().setHasTrustedContact(true);
  await useAppStore.getState().logout();
  expect(useAppStore.getState().hasTrustedContact).toBe(false);
});

it('deduplicates completed simulations and clears them on account switch and logout', async () => {
  await useAppStore.getState().setSession(user, tokens);
  useAppStore.getState().completeSimulation('roubo');
  useAppStore.getState().completeSimulation('roubo');
  expect(useAppStore.getState().completedSimulationIds).toEqual(['roubo']);
  await useAppStore.getState().setSession(user, tokens);
  expect(useAppStore.getState().completedSimulationIds).toEqual(['roubo']);
  await useAppStore.getState().setSession({ ...user, id: 'user-2' }, tokens);
  expect(useAppStore.getState().completedSimulationIds).toEqual([]);
  useAppStore.getState().setCompletedSimulations(['roubo', 'roubo']);
  expect(useAppStore.getState().completedSimulationIds).toEqual(['roubo']);
  await useAppStore.getState().logout();
  expect(useAppStore.getState().completedSimulationIds).toEqual([]);
});
