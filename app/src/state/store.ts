import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FontSizeKey, ThemeName } from '../theme/tokens';
import type { User } from '../types/auth';
import type { Answers } from '../lib/scoring';
import { asyncStorageAdapter, PERSIST_KEY } from './persist';
import { secureStore } from './secureStore';

interface PrefsSlice {
  theme: ThemeName;
  contrast: boolean;
  font: FontSizeKey;
  obDone: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleContrast: () => void;
  setFont: (font: FontSizeKey) => void;
  setObDone: (done: boolean) => void;
}

type SessionStatus = 'idle' | 'authenticating' | 'authenticated';

interface SessionSlice {
  user: User | null;
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

type AppStore = PrefsSlice & SessionSlice & AssessmentSlice & PlanSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'light',
      contrast: false,
      font: 's',
      obDone: false,
      setTheme: (theme) => set({ theme }),
      toggleContrast: () => set((s) => ({ contrast: !s.contrast })),
      setFont: (font) => set({ font }),
      setObDone: (obDone) => set({ obDone }),

      user: null,
      status: 'idle',
      answers: null,
      baseScore: null,
      setAssessment: (answers, baseScore) => set({ answers, baseScore }),
      completedTaskIds: [],
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
          ...(s.user?.id !== user.id ? { answers: null, baseScore: null, completedTaskIds: [] } : {}),
        }));
      },
      logout: async () => {
        await secureStore.clearSession();
        set({ user: null, status: 'idle', answers: null, baseScore: null, completedTaskIds: [] });
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
        answers: s.answers,
        baseScore: s.baseScore,
        completedTaskIds: s.completedTaskIds,
      }),
    }
  )
);
