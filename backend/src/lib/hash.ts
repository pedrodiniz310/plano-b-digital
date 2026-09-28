import argon2 from 'argon2';
import { createConcurrencyGate } from './concurrencyGate.js';

/**
 * Parâmetros do argon2id — m=65536 (64 MiB), t=3, p=1. Memória alta e
 * paralelismo baixo: são decisões separadas, com razões separadas, e "corrigir"
 * uma delas isolada estraga a outra.
 *
 * **Memória alta.** Não baixe para o mínimo do OWASP (m=19456, t=2) achando que
 * é economia: o que estourava os 256 MiB da máquina (`fly.toml.example`) era o
 * número de hashes *simultâneos*, não o custo de cada um — problemas
 * diferentes, e o `MAX_CONCURRENT_HASHES` abaixo é quem resolve o primeiro. Com
 * o gate no lugar, o perfil caro cabe: 74,6 MiB de boot medido + 128,2 MiB de
 * pico ≈ 203 dos 256 MiB. Baixar m·t de 196608 para 38912 custaria 5,05× menos
 * esforço a um ataque offline, sem comprar folga que faça falta.
 *
 * **Paralelismo 1.** A VM é `shared-cpu-1x` — 1 vCPU (`fly.toml.example`). As
 * lanes do argon2 só rendem quando há núcleo para paralelizar; em 1 núcleo elas
 * disputam o mesmo e o custo das threads é pago sem retorno. Medido com
 * afinidade fixada em 1 núcleo: p=4 → 261,9 ms/op, p=1 → 253,0 ms/op —
 * estatisticamente idênticos. `p` não entra no custo de ataque offline (m·t
 * fica igual), então baixá-lo não enfraquece nada. Não suba `p` sem antes subir
 * `cpus` no `fly.toml`.
 *
 * **Vazão que isto implica:** ~4 hashes/s no serviço inteiro (2 slots do gate ×
 * ~4 ops/s por slot em 1 vCPU). É pouco, e é o número a olhar antes de mexer em
 * qualquer um dos três parâmetros. Em máquina de desktop o mesmo perfil mede
 * ~96 ms/op, o que esconde o efeito — não meça aqui.
 *
 * Mudar o custo não invalida hash já gravado: `argon2.verify` lê os parâmetros
 * do próprio hash (coberto em `hash.test.ts`).
 */
export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
} as const;

/**
 * Quantos hashes podem rodar ao mesmo tempo. O custo do argon2 é pago antes de
 * saber se a credencial confere, então o número de requisições concorrentes é
 * que decide a memória alocada — não a quantidade de logins válidos. É este
 * teto, e não um `memoryCost` menor, que mantém o processo dentro dos 256 MiB;
 * é ele que torna o perfil caro do argon2 viável na máquina pequena.
 */
export const MAX_CONCURRENT_HASHES = 2;

/**
 * Maior `memoryCost` já gravado em algum hash do banco. Hoje empata com
 * `ARGON2_OPTIONS` e por isso não muda conta nenhuma — existe justamente para o
 * dia em que os dois divergirem. `verifyPassword` não escolhe parâmetros, ele
 * obedece aos do hash que recebe; então quem baixar `ARGON2_OPTIONS` sem mexer
 * aqui verá o pico calculado despencar no papel enquanto o processo continua
 * alocando o valor antigo — que foi exatamente o defeito que esta constante
 * passou a impedir. Só encolha este número depois que não sobrar nenhuma linha
 * antiga no banco (não há rehash no login).
 */
export const MAX_STORED_MEMORY_COST = 65536;

/**
 * Pico de memória que o argon2 pode alocar no processo, em MiB: 128. Conta pelo
 * hash mais caro que ainda pode ser *verificado*, não pelo que gravamos — as
 * duas pontas só coincidem enquanto ninguém mexer no custo. Some os 74,6 MiB de
 * boot medidos e dá ~203 dos 256 MiB de `fly.toml.example`: cabe, com folga
 * curta e sem contar pool do Postgres.
 */
export const HASH_PEAK_MEMORY_MIB =
  (Math.max(ARGON2_OPTIONS.memoryCost, MAX_STORED_MEMORY_COST) / 1024) * MAX_CONCURRENT_HASHES;

const gate = createConcurrencyGate(MAX_CONCURRENT_HASHES);

export function hashPassword(plain: string): Promise<string> {
  return gate.run(() => argon2.hash(plain, ARGON2_OPTIONS));
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return gate.run(() => argon2.verify(hash, plain));
}
