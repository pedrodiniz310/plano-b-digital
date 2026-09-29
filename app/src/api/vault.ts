import { apiRequest } from './client';
import type { EncryptedEntry } from '../lib/vaultCrypto';

export interface VaultItem extends EncryptedEntry {
  promptId: string;
  updatedAt: string;
}

export function fetchVaultItems(): Promise<{ items: VaultItem[] }> {
  return apiRequest<{ items: VaultItem[] }>('/vault/items');
}

export function saveVaultItem(promptId: string, entry: EncryptedEntry): Promise<VaultItem> {
  return apiRequest<VaultItem>(`/vault/items/${encodeURIComponent(promptId)}`, { method: 'PUT', body: entry });
}

export function deleteVaultItem(promptId: string): Promise<void> {
  return apiRequest<void>(`/vault/items/${encodeURIComponent(promptId)}`, { method: 'DELETE' });
}
