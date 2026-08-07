import { randomBytes, randomUUID, createHash } from 'node:crypto';

/**
 * Refresh token é opaco (não é JWT) — revogável de verdade apagando a linha
 * no banco, ao contrário de um JWT de refresh (que continua válido até
 * expirar mesmo se "revogado"). Só o hash SHA-256 fica no banco.
 */
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export function generateRefreshToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = randomBytes(32).toString('hex');
  return {
    raw,
    hash: hashRefreshToken(raw),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  };
}

export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function guestEmail(): string {
  return `guest-${randomUUID()}@planob.local`;
}
