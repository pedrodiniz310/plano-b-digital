import { gcm } from '@noble/ciphers/aes.js';
import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils.js';
import { getRandomBytes } from 'expo-crypto';
import { secureStore } from '../state/secureStore';

export type EncryptedEntry = { ciphertext: string; nonce: string };

export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function vaultAad(userId: string, promptId: string): string {
  return `planob.vault.v1:${userId}:${promptId}`;
}

export function generateVaultKey(): Uint8Array {
  return getRandomBytes(32);
}

function assertKey(key: Uint8Array): void {
  if (key.length !== 32) throw new Error('Chave do cofre inválida.');
}

export function encryptEntry(key: Uint8Array, plaintext: string, aad: string): EncryptedEntry {
  assertKey(key);
  const nonce = getRandomBytes(12);
  const ciphertext = gcm(key, nonce, utf8ToBytes(aad)).encrypt(utf8ToBytes(plaintext));
  return { ciphertext: encodeBase64(ciphertext), nonce: encodeBase64(nonce) };
}

export function decryptEntry(key: Uint8Array, entry: EncryptedEntry, aad: string): string {
  assertKey(key);
  const nonce = decodeBase64(entry.nonce);
  if (nonce.length !== 12) throw new Error('Nonce do cofre inválido.');
  return bytesToUtf8(gcm(key, nonce, utf8ToBytes(aad)).decrypt(decodeBase64(entry.ciphertext)));
}

let pendingKey: Promise<Uint8Array> | null = null;

export function getOrCreateVaultKey(): Promise<Uint8Array> {
  if (!pendingKey) {
    pendingKey = (async () => {
      const existing = await secureStore.getVaultKey();
      if (existing !== null) {
        const key = decodeBase64(existing);
        assertKey(key);
        return key;
      }
      const key = generateVaultKey();
      await secureStore.setVaultKey(encodeBase64(key));
      return key;
    })().finally(() => { pendingKey = null; });
  }
  return pendingKey;
}
