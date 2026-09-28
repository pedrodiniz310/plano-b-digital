import { describe, expect, it } from 'vitest';
import {
  ARGON2_OPTIONS,
  HASH_PEAK_MEMORY_MIB,
  MAX_STORED_MEMORY_COST,
  hashPassword,
  verifyPassword,
} from './hash.js';

/** RSS medido do processo buildado logo após o boot, sem pool de conexão aberto. */
const BOOT_MEMORY_MIB = 75;
/** `fly.toml.example` → `[[vm]] memory_mb`. */
const MACHINE_MEMORY_MIB = 256;

describe('hashPassword', () => {
  it('grava o perfil caro do argon2id, não o mínimo do OWASP', async () => {
    const hash = await hashPassword('senha-forte-123');
    expect(hash).toMatch(/^\$argon2id\$/);
    // Memória e tempo altos, paralelismo 1: a VM tem 1 vCPU e as lanes extras
    // só custariam. Ver o comentário de `ARGON2_OPTIONS`.
    expect(hash).toContain('$m=65536,p=1,t=3$');
  });

  it('mantém o pico de memória do argon2 dentro do envelope de 256 MiB da máquina', () => {
    // 64 MiB × 2 slots = 128 MiB, batendo com os 128,2 MiB medidos em dois
    // verifies concorrentes. Quem segura o pico é `MAX_CONCURRENT_HASHES`: sem
    // o gate, o mesmo perfil com 4 requisições simultâneas derruba a máquina.
    expect(HASH_PEAK_MEMORY_MIB).toBe(128);
    // O envelope é o que força a conversa: mexer em `memoryCost` ou no número
    // de slots tem que caber aqui junto com o boot.
    expect(BOOT_MEMORY_MIB + HASH_PEAK_MEMORY_MIB).toBeLessThanOrEqual(MACHINE_MEMORY_MIB);
  });

  it('nunca grava mais barato do que o banco já guarda sem o pico acompanhar', () => {
    // O pico se calcula sobre o lado que VERIFICA. Se alguém baixar
    // `ARGON2_OPTIONS` e esquecer `MAX_STORED_MEMORY_COST`, o número
    // documentado despenca enquanto o processo segue alocando o valor antigo.
    expect(HASH_PEAK_MEMORY_MIB).toBe(
      (Math.max(ARGON2_OPTIONS.memoryCost, MAX_STORED_MEMORY_COST) / 1024) * 2
    );
    expect(MAX_STORED_MEMORY_COST).toBeGreaterThanOrEqual(ARGON2_OPTIONS.memoryCost);
  });
});

describe('verifyPassword', () => {
  it('confere a senha correta e recusa a errada', async () => {
    const hash = await hashPassword('senha-forte-123');
    expect(await verifyPassword(hash, 'senha-forte-123')).toBe(true);
    expect(await verifyPassword(hash, 'senha-forte-124')).toBe(false);
  });

  it('confere hash gravado com parâmetros diferentes dos atuais', async () => {
    // Esta é a propriedade que garante que mudar o custo não desloga ninguém:
    // `argon2.verify` obedece aos parâmetros do hash recebido, não aos nossos.
    // A fixture usa m=19456,t=2,p=1 — o perfil mínimo do OWASP, que chegou a
    // ser adotado e foi revertido — justamente para NÃO empatar com
    // `ARGON2_OPTIONS`: se empatar, o teste deixa de exercitar o que promete.
    // Senha de fixture, não é credencial de lugar nenhum.
    const outroPerfil =
      '$argon2id$v=19$m=19456,p=1,t=2$Xdov1pakIT0toEKYxwHcEw$Si/GACgV7vK3zMdAgHasrCzK8nE19zcmdp6E7TKxWrI';
    expect(outroPerfil).not.toContain(`$m=${ARGON2_OPTIONS.memoryCost},`);

    expect(await verifyPassword(outroPerfil, 'senha-de-fixture-1234')).toBe(true);
    expect(await verifyPassword(outroPerfil, 'senha-errada')).toBe(false);
  });
});
