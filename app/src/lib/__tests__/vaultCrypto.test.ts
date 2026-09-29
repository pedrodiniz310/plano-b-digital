import { decryptEntry, encodeBase64, encryptEntry, generateVaultKey, getOrCreateVaultKey, vaultAad } from '../vaultCrypto';
import { secureStore } from '../../state/secureStore';

jest.mock('expo-crypto', () => ({
  getRandomBytes: (length: number) => {
    const nodeCrypto = jest.requireActual<{ randomBytes: (size: number) => Uint8Array }>('crypto');
    return new Uint8Array(nodeCrypto.randomBytes(length));
  },
}));
jest.mock('../../state/secureStore', () => ({ secureStore: { getVaultKey: jest.fn(), setVaultKey: jest.fn() } }));

const key = new Uint8Array(32).fill(7);
const aad = vaultAad('user-1', 'v1');
const plaintext = JSON.stringify({ value: 'código secreto' });

beforeEach(() => jest.resetAllMocks());

it('generates a 32-byte key and stores it only in SecureStore', async () => {
  expect(generateVaultKey()).toHaveLength(32);
  jest.mocked(secureStore.getVaultKey).mockResolvedValueOnce(null);
  const created = await getOrCreateVaultKey();
  expect(created).toHaveLength(32);
  expect(secureStore.setVaultKey).toHaveBeenCalledWith(expect.any(String));
});

it('reuses a stored key and refuses a malformed stored key', async () => {
  jest.mocked(secureStore.getVaultKey).mockResolvedValueOnce(encodeBase64(key));
  expect(await getOrCreateVaultKey()).toEqual(key);
  expect(secureStore.setVaultKey).not.toHaveBeenCalled();
  jest.mocked(secureStore.getVaultKey).mockResolvedValueOnce('AA==');
  await expect(getOrCreateVaultKey()).rejects.toThrow('Chave do cofre inválida.');
  expect(secureStore.setVaultKey).not.toHaveBeenCalled();
});

it('round-trips UTF-8 and uses a fresh nonce for each encryption', () => {
  const one = encryptEntry(key, plaintext, aad);
  const two = encryptEntry(key, plaintext, aad);
  expect(decryptEntry(key, one, aad)).toBe(plaintext);
  expect(one.nonce).not.toBe(two.nonce);
  expect(one.ciphertext).not.toBe(two.ciphertext);
});

it('rejects tampering, another slot, another user, and another key', () => {
  const entry = encryptEntry(key, plaintext, aad);
  const flip = (value: string) => `${value[0] === 'A' ? 'B' : 'A'}${value.slice(1)}`;
  expect(() => decryptEntry(key, { ...entry, ciphertext: flip(entry.ciphertext) }, aad)).toThrow();
  expect(() => decryptEntry(key, { ...entry, nonce: flip(entry.nonce) }, aad)).toThrow();
  expect(() => decryptEntry(key, entry, vaultAad('user-1', 'v2'))).toThrow();
  expect(() => decryptEntry(key, entry, vaultAad('user-2', 'v1'))).toThrow();
  expect(() => decryptEntry(new Uint8Array(32).fill(8), entry, aad)).toThrow();
});
