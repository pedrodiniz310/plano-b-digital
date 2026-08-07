import { describe, expect, it } from 'vitest';
import { generateRefreshToken, guestEmail, hashRefreshToken } from './tokens.js';

describe('generateRefreshToken', () => {
  it('gera token cru diferente do hash guardado', () => {
    const token = generateRefreshToken();
    expect(token.raw).not.toBe(token.hash);
    expect(token.raw).toHaveLength(64);
  });

  it('hash é determinístico pro mesmo token', () => {
    const token = generateRefreshToken();
    expect(hashRefreshToken(token.raw)).toBe(token.hash);
  });

  it('expira 30 dias no futuro', () => {
    const token = generateRefreshToken();
    const days = (token.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(days).toBeGreaterThan(29.9);
    expect(days).toBeLessThan(30.1);
  });
});

describe('guestEmail', () => {
  it('gera e-mails sintéticos únicos', () => {
    expect(guestEmail()).not.toBe(guestEmail());
    expect(guestEmail()).toMatch(/^guest-.+@planob\.local$/);
  });
});
