import * as SecureStore from 'expo-secure-store';

/**
 * Segredos (tokens de sessão, chave do Cofre) nunca entram no Zustand nem no
 * AsyncStorage — só aqui, em Keychain (iOS) / Keystore (Android). Ver
 * docs/decisions/0003-criptografia-cofre.md.
 */
const KEYS = {
  accessToken: 'planob.accessToken',
  refreshToken: 'planob.refreshToken',
  vaultKey: 'planob.vaultKey',
} as const;

type SecretKey = keyof typeof KEYS;

async function getSecret(key: SecretKey): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS[key]);
}

async function setSecret(key: SecretKey, value: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS[key], value);
}

async function deleteSecret(key: SecretKey): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS[key]);
}

export const secureStore = {
  getAccessToken: () => getSecret('accessToken'),
  setAccessToken: (value: string) => setSecret('accessToken', value),
  clearAccessToken: () => deleteSecret('accessToken'),

  getRefreshToken: () => getSecret('refreshToken'),
  setRefreshToken: (value: string) => setSecret('refreshToken', value),
  clearRefreshToken: () => deleteSecret('refreshToken'),

  getVaultKey: () => getSecret('vaultKey'),
  setVaultKey: (value: string) => setSecret('vaultKey', value),

  async clearSession(): Promise<void> {
    await Promise.all([deleteSecret('accessToken'), deleteSecret('refreshToken')]);
  },
};
