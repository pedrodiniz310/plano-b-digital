import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FontSizeKey, ThemeName } from '../theme/tokens';
import type { User } from '../types/auth';
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

type AppStore = PrefsSlice & SessionSlice;

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
      setAuthenticating: () => set({ status: 'authenticating' }),
      setSession: async (user, tokens) => {
        await Promise.all([
          secureStore.setAccessToken(tokens.accessToken),
          secureStore.setRefreshToken(tokens.refreshToken),
        ]);
        set({ user, status: 'authenticated', obDone: true });
      },
      logout: async () => {
        await secureStore.clearSession();
        set({ user: null, status: 'idle' });
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
      }),
    }
  )
);
