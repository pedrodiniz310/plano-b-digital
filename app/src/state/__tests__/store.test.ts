import { useAppStore } from '../store';

jest.mock('../persist', () => ({
  PERSIST_KEY: 'test-store',
  asyncStorageAdapter: { getItem: jest.fn(() => null), setItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock('../secureStore', () => ({
  secureStore: {
    setAccessToken: jest.fn(async () => {}),
    setRefreshToken: jest.fn(async () => {}),
    clearSession: jest.fn(async () => {}),
  },
}));

const user = { id: 'user-1', name: 'Teste', email: 'teste@example.test', guest: false };
const tokens = { accessToken: 'access', refreshToken: 'refresh' };

beforeEach(() => {
  useAppStore.setState({ user: null, status: 'idle', answers: null, baseScore: null, completedTaskIds: [], completedSimulationIds: [], hasTrustedContact: false });
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
