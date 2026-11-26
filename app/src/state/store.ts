import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FontSizeKey, ThemeName } from '../theme/tokens';
import type { User } from '../types/auth';
import type { Answers } from '../lib/scoring';
import { asyncStorageAdapter, PERSIST_KEY } from './persist';
import { secureStore } from './secureStore';
import { logoutRemote } from '../api/auth';
import { ApiError, setSessionExpiredHandler } from '../api/client';
import { updateMe, type Me } from '../api/me';
import type { Op } from '../lib/outbox';

function savePreference(patch: Parameters<typeof updateMe>[0]) {
  if (!useAppStore.getState().user) return;
  void updateMe(patch).catch((error: unknown) => {
    console.warn(error instanceof ApiError ? error.code : 'network_error');
  });
}

interface PrefsSlice {
  theme: ThemeName;
  contrast: boolean;
  font: FontSizeKey;
  obDone: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleContrast: () => void;
  setFont: (font: FontSizeKey) => void;
  setObDone: (done: boolean) => void;
  applyMe: (me: Me) => void;
}

type SessionStatus = 'idle' | 'authenticating' | 'authenticated';

interface SessionSlice {
  user: User | null;
  emailMasked: string | null;
  status: SessionStatus;
  setAuthenticating: () => void;
  setSession: (user: User, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
}

interface AssessmentSlice {
  answers: Answers | null;
  baseScore: number | null;
  setAssessment: (answers: Answers, baseScore: number) => void;
}

interface PlanSlice {
  completedTaskIds: string[];
  setTaskCompleted: (id: string, completed: boolean) => void;
  setCompletedTasks: (ids: string[]) => void;
}

interface SimulationSlice {
  completedSimulationIds: string[];
  completeSimulation: (id: string) => void;
  setCompletedSimulations: (ids: string[]) => void;
}

interface ContactSlice {
  hasTrustedContact: boolean;
  setHasTrustedContact: (value: boolean) => void;
}

export interface LocalIncident {
  id: string;
  scenarioId: string;
  startedAtLocal: string;
  actions: Record<string, { clientTimestamp: string; completedAt?: string }>;
  closedAtLocal?: string;
  startedAtServer?: string;
  closedAtServer?: string;
}

interface IncidentSnapshot {
  activeIncident: LocalIncident | null;
  lastReport: LocalIncident | null;
  outbox: Op[];
}

interface IncidentSlice {
  activeIncident: LocalIncident | null;
  lastReport: LocalIncident | null;
  outbox: Op[];
  incidentOwnerId: string | null;
  retainedIncidents: Record<string, IncidentSnapshot>;
  startIncident: (id: string, scenarioId: string, now: string) => void;
  completeAction: (actionId: string, now: string) => void;
  finishIncident: (now: string) => void;
  applyIncidentSync: (id: string, patch: Partial<LocalIncident>) => void;
  acknowledgeOutbox: (snapshot: readonly Op[], remaining: Op[]) => void;
}

type AppStore = PrefsSlice & SessionSlice & AssessmentSlice & PlanSlice & SimulationSlice & ContactSlice & IncidentSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'light',
      contrast: false,
      font: 's',
      obDone: false,
      setTheme: (theme) => { set({ theme }); savePreference({ theme }); },
      toggleContrast: () => {
        const contrast = !useAppStore.getState().contrast;
        set({ contrast });
        savePreference({ contrast });
      },
      setFont: (font) => { set({ font }); savePreference({ fontSize: font }); },
      setObDone: (obDone) => set({ obDone }),
      applyMe: (me) => set((s) => ({
        theme: me.theme, contrast: me.contrast, font: me.fontSize,
        emailMasked: me.emailMasked,
        user: s.user ? { ...s.user, name: me.name, guest: me.guest } : null,
      })),

      user: null,
      emailMasked: null,
      status: 'idle',
      answers: null,
      baseScore: null,
      setAssessment: (answers, baseScore) => set({ answers, baseScore }),
      completedTaskIds: [],
      completedSimulationIds: [],
      completeSimulation: (id) => set((s) => ({
        completedSimulationIds: s.completedSimulationIds.includes(id)
          ? s.completedSimulationIds
          : [...s.completedSimulationIds, id],
      })),
      setCompletedSimulations: (ids) => set({ completedSimulationIds: [...new Set(ids)] }),
      hasTrustedContact: false,
      activeIncident: null,
      lastReport: null,
      outbox: [],
      incidentOwnerId: null,
      retainedIncidents: {},
      startIncident: (id, scenarioId, now) => set((s) => {
        if (s.outbox.length > 0 && (s.incidentOwnerId ?? s.user?.id) !== s.user?.id) return s;
        if (s.activeIncident && !s.activeIncident.closedAtLocal) return s;
        return {
          incidentOwnerId: s.user?.id ?? null,
          activeIncident: { id, scenarioId, startedAtLocal: now, actions: {} },
          outbox: [...s.outbox, { kind: 'create', incidentId: id, scenarioId }],
        };
      }),
      completeAction: (actionId, now) => set((s) => {
        const incident = s.activeIncident;
        if (!incident || incident.closedAtLocal || incident.actions[actionId]) return s;
        return {
          activeIncident: { ...incident, actions: { ...incident.actions, [actionId]: { clientTimestamp: now } } },
          outbox: [...s.outbox, { kind: 'action', incidentId: incident.id, actionId, clientTimestamp: now }],
        };
      }),
      finishIncident: (now) => set((s) => {
        const incident = s.activeIncident;
        if (!incident || incident.closedAtLocal) return s;
        return {
          activeIncident: null,
          lastReport: { ...incident, closedAtLocal: now },
          outbox: [...s.outbox, { kind: 'close', incidentId: incident.id }],
        };
      }),
      applyIncidentSync: (id, patch) => set((s) => {
        const apply = (incident: LocalIncident | null) => incident?.id === id ? {
          ...incident, ...patch,
          actions: patch.actions ? { ...incident.actions, ...patch.actions } : incident.actions,
        } : incident;
        return { activeIncident: apply(s.activeIncident), lastReport: apply(s.lastReport) };
      }),
      acknowledgeOutbox: (snapshot, remaining) => set((s) => ({
        outbox: [...remaining, ...s.outbox.slice(snapshot.length)],
      })),
      setHasTrustedContact: (hasTrustedContact) => set({ hasTrustedContact }),
      setTaskCompleted: (id, completed) => set((s) => ({
        completedTaskIds: completed
          ? s.completedTaskIds.includes(id) ? s.completedTaskIds : [...s.completedTaskIds, id]
          : s.completedTaskIds.filter((taskId) => taskId !== id),
      })),
      setCompletedTasks: (ids) => set({ completedTaskIds: [...new Set(ids)] }),
      setAuthenticating: () => set({ status: 'authenticating' }),
      setSession: async (user, tokens) => {
        await Promise.all([
          secureStore.setAccessToken(tokens.accessToken),
          secureStore.setRefreshToken(tokens.refreshToken),
        ]);
        // Outra conta no mesmo aparelho não herda o teste da anterior.
        set((s) => ({
          user,
          status: 'authenticated',
          obDone: true,
          ...(s.user?.id !== user.id ? (() => {
            const retainedIncidents = { ...s.retainedIncidents };
            const incidentOwnerId = s.incidentOwnerId ?? s.user?.id;
            if (s.outbox.length > 0 && incidentOwnerId && incidentOwnerId !== user.id) {
              retainedIncidents[incidentOwnerId] = {
                activeIncident: s.activeIncident, lastReport: s.lastReport, outbox: s.outbox,
              };
            }
            const own = incidentOwnerId === user.id
              ? { activeIncident: s.activeIncident, lastReport: s.lastReport, outbox: s.outbox }
              : retainedIncidents[user.id] ?? { activeIncident: null, lastReport: null, outbox: [] };
            delete retainedIncidents[user.id];
            return {
              answers: null, baseScore: null, completedTaskIds: [], completedSimulationIds: [], hasTrustedContact: false,
              emailMasked: null, ...own, incidentOwnerId: own.outbox.length > 0 ? user.id : null, retainedIncidents,
            };
          })() : {}),
        }));
      },
      logout: async () => {
        try {
          const refreshToken = await secureStore.getRefreshToken();
          if (refreshToken) await logoutRemote(refreshToken);
        } catch (error) {
          console.warn(error instanceof ApiError ? error.code : 'network_error');
        }
        await secureStore.clearSession();
        set((s) => ({
          user: null, emailMasked: null, status: 'idle', answers: null, baseScore: null,
          completedTaskIds: [], completedSimulationIds: [], hasTrustedContact: false,
          ...(s.outbox.length === 0 ? { activeIncident: null, lastReport: null, outbox: [], incidentOwnerId: null } : { incidentOwnerId: s.incidentOwnerId ?? s.user?.id ?? null }),
        }));
      },
    }),
    {
      name: PERSIST_KEY,
      storage: asyncStorageAdapter,
      // Segredos ficam fora do AsyncStorage — só o necessário pra restaurar a UI.
      partialize: (s) => ({
        theme: s.theme,
        contrast: s.contrast,
        font: s.font,
        obDone: s.obDone,
        user: s.user,
        emailMasked: s.emailMasked,
        answers: s.answers,
        baseScore: s.baseScore,
        completedTaskIds: s.completedTaskIds,
        completedSimulationIds: s.completedSimulationIds,
        hasTrustedContact: s.hasTrustedContact,
        activeIncident: s.activeIncident,
        lastReport: s.lastReport,
        outbox: s.outbox,
        incidentOwnerId: s.incidentOwnerId,
        retainedIncidents: s.retainedIncidents,
      }),
    }
  )
);

// Refresh recusado pelo servidor = sessão encerrada: sai localmente (tokens já
// foram apagados, então `logout` não chama a rede) e preserva o outbox do dono.
setSessionExpiredHandler(() => {
  if (useAppStore.getState().user) void useAppStore.getState().logout();
});
