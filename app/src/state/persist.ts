import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Storage não-secreto do Zustand — espelha o papel do `localStorage` do
 * protótipo (chave `planob:v1`), mas sem os campos sensíveis (esses vivem em
 * state/secureStore.ts).
 */
export const asyncStorageAdapter = createJSONStorage(() => AsyncStorage);

export const PERSIST_KEY = 'planob:v1';
