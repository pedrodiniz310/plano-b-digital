# Decisões de entrega — confirmadas pelo Pedro

Data: 2026-08-13
Fase: pré-`ship`, durante a volta 2 do builder.

## D1 — Parâmetros do argon2: voltar ao original

**Decisão:** `ARGON2_OPTIONS` volta a `m=65536, t=3, p=4`.

Contexto medido pelo `pipe-sentinel` na segunda passada:

| perfil | pico c/ 2 slots | total c/ boot | custo ataque offline |
|---|---|---|---|
| `m=65536 t=3 p=4` (original) | 128.2 MiB | ~203 / 256 MiB | 5,05× |
| `m=19456 t=2 p=1` (mínimo OWASP) | 38.0 MiB | ~113 / 256 MiB | 1,00× (baseline) |

Razão: o `MAX_CONCURRENT_HASHES = 2` já resolve o vetor de OOM que motivou A2 —
o gate limita o agregado, não o custo unitário. Com o gate no lugar, o perfil
original cabe no envelope de 256 MiB de `fly.toml.example`. Além disso, hash
legado gravado em `m=65536` já custa 128 MiB hoje, então o teto de 38 MiB
anunciado em `hash.ts:28` era ficção enquanto existisse qualquer hash antigo
(achado M1-2).

**Consequência para o T9 (M1-2):** com legado e atual nos mesmos parâmetros, a
divergência entre teto documentado e realidade desaparece. O T9 deixa de ser
escolha entre rehash-on-login e corrigir o teto: basta o teto documentado e o
teste refletirem `m=65536` → 128.2 MiB.

**Consequência para A2:** `hash.test.ts` precisa continuar provando que hashes
gravados com outros parâmetros validam — a propriedade importa para qualquer
mudança futura de custo, independente de qual perfil está ativo agora.

## D2 — Repositório

`gh repo create plano-b-digital --private`, conta `pedrodiniz310`.

Privado, não público. O `pipe-sentinel` varreu duas vezes e não achou exposição
(0 críticos, nenhum segredo no histórico dos 2 commits nem nos 105 arquivos
exportáveis), mas achados de auth seguem abertos e o ADR-0003 está em
`proposta — pendente de implementação`.

Consequência lateral: enquanto privado, o achado M2-2 (LICENSE MIT dando
permissão de "sell" sobre o design system de terceiro em
`docs/design-handoff/src/_ds/`) fica latente. Ele **precisa** estar resolvido
antes de qualquer troca para público.

## D3 — Fatiamento dos PRs

Cinco PRs sobre `main` (que permanece nos 2 commits atuais como baseline):

| PR | branch | conteúdo |
|---|---|---|
| 1 | `docs/agents-md` | `AGENTS.md` |
| 2 | `feat/prisma-migration` | `backend/prisma/migrations/` |
| 3 | `chore/dev-tooling` | `dev.ps1`, `docs/GUIA-ANDROID-STUDIO-E-TERMINAL.md` |
| 4 | `docs/codex-workflow` | `docs/superpowers/plans/`, `docs/superpowers/specs/` |
| 5 | `fix/auditoria-seguranca` | correções das voltas 1 e 2 + testes; descrição = veredito |

O PR 5 existe porque as duas voltas do builder tocaram ~15 arquivos de código
(rate limit, hash, `app.ts`, `client.ts`, `prisma.config.ts`, `Dockerfile`,
README, LICENSE, ADR-0003) e isso não cabia nos 4 temáticos sem misturar
auditoria de segurança com documentação.

## D4 — Volta 3 do builder autorizada (excede o limite de 2 automáticas)

A terceira passada do `pipe-sentinel` reprovou com um ALTO novo (A1-3). Como as
duas voltas automáticas já tinham sido gastas, o caso subiu para o Pedro, que
autorizou uma volta extra com escopo fechado: **A1-3 + M1-3 + B1-3**.

## D5 — Argon2 `parallelism` revisto para 1

**Decisão:** `p=4` → `p=1`. `memoryCost: 65536` e `timeCost: 3` permanecem — o
D1 continua valendo no que motivou o D1.

Dado que não existia quando o D1 foi tomado, medido pelo sentinel com afinidade
fixada em um núcleo:

| perfil | custo | threads c/ 2 slots |
|---|---|---|
| `p=4` | 261,9 ms/op | 8 |
| `p=1` | 253,0 ms/op | 2 |

Vazão do serviço com o perfil `p=4`: 4,0 hash/s, contra 22,4 do perfil anterior.
Os 232 ms que o builder mediu na volta anterior eram de uma máquina de 20
núcleos, o que escondeu o efeito.

Razão: `parallelism` só compra resistência quando há núcleos para paralelizar.
Em VM de 1 vCPU as 4 lanes disputam o mesmo núcleo — custo de defesa igual, custo
de ataque igual, e 8 threads reservadas à toa. `fly.toml.example` não especifica
CPU, então o default pequeno é o que vale.



- Nada é empurrado para o GitHub antes de `verify` fechar em PASS (regra 4).
- `git push` só para os branches e o `main` acordados aqui. Nenhum force-push,
  nenhuma reescrita de histórico.
