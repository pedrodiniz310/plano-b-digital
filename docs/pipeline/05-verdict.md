# 05 — Verdict (FASE 5 · VERIFY)

- Data: 2026-08-12
- Escopo: auditoria adversarial read-only do repositório inteiro (versionado + untracked)
- Baseline: `AGENTS.md` (Segurança, Definição de pronto), `README.md`, `docs/_INDEX.md`, ADRs 0001–0004
- Contexto: código será publicado em repositório GitHub logo após esta auditoria

```
GATE: FAIL
CRITICOS: 0
ALTOS:    2
MEDIOS:   7
BAIXOS:   4
```

`FAIL` não é por segurança. **Nenhum segredo vazou.** O gate reprova por um defeito
de build reproduzido (A1) que quebra a CI no primeiro push e impede clone limpo.

---

## Evidência executada

Comandos rodados de verdade na raiz do monorepo, saída real colada:

| passo | comando | resultado |
| --- | --- | --- |
| typecheck + lint | `npm run check` | **ok** — app e backend, zero erro |
| testes | `npm run test` | **ok** — app 12 passed / backend 4 passed (16 total) |
| build | `npm run build` | **ok** — Expo export (dist) + `tsc -p tsconfig.build.json` |
| CI simulada | `git archive HEAD` + `tsc --noEmit` | **FALHA** — ver A1 |

```
> app@1.0.0 test / jest
Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total

> backend@1.0.0 test / vitest run
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

Atenção ao contraste: `npm run check` passa **na máquina do Pedro** porque
`backend/src/generated/prisma/` existe em disco de uma execução anterior. Esse
diretório é gitignored. A CI não o terá. Ver A1.

---

## Cobertura de requisito

Não existem `00-brief.md`…`04-plan.md` (pipeline iniciado sobre codebase
pré-existente). Rastreio feito contra os ADRs e o AGENTS.md.

| requisito (fonte) | estado |
| --- | --- |
| Hash de senha forte (AGENTS.md · Segurança) | coberto — argon2id, `lib/hash.ts` ✓ |
| Refresh token opaco + revogável (ADR-0004) | coberto por `backend/src/lib/tokens.test.ts` ✓ |
| Resposta de recover não revela existência do e-mail | coberto por código, **sem teste** ✗ |
| Login não revela existência do e-mail | coberto por código, **sem teste** ✗ |
| Signup não revela existência do e-mail | **NÃO coberto** — ver M2 ✗ |
| Cofre com AES-256-GCM client-side (ADR-0003) | **NÃO IMPLEMENTADO** — ver M1 ✗ |
| Rotas de auth (signup/login/guest/refresh) | **SEM TESTE DE INTEGRAÇÃO** ✗ |
| Score/nível/risco derivados (ADR-0004) | coberto por `scoring.test.ts` ✓ |
| Gamificação e conquistas (`gamification.ts`, `achievements.ts`) | **SEM TESTE** ✗ |
| "Testes de regressão em mudanças de auth" (AGENTS.md) | **não satisfeito** — auth tem 0 teste de rota |

Resumo de cobertura: 2 arquivos de teste para 89 arquivos versionados. Toda a
superfície HTTP de autenticação — a parte mais sensível do projeto — não tem um
único teste.

---

## Achados

### ALTO — A1 · CI quebra no primeiro push; repo não compila em clone limpo

- **Onde:** `.github/workflows/ci.yml:18-20`, `backend/src/plugins/prisma.ts:3`,
  `backend/src/routes/auth.ts:3`, `.gitignore:3`
- **Defeito:** o backend importa um client Prisma gerado que é gitignored, e nada
  no pipeline de instalação o regenera.
- **Evidência:** o client é importado em dois pontos:
  ```
  backend/src/plugins/prisma.ts:3:import { PrismaClient } from '../generated/prisma/client.js';
  backend/src/routes/auth.ts:3:import type { User } from '../generated/prisma/client.js';
  ```
  `schema.prisma:6-9` o emite em `../src/generated/prisma`; `.gitignore:3` contém
  `generated/`; `git ls-files | grep generated` → vazio; não há hook
  `postinstall`/`prepare` em nenhum dos três `package.json`. A CI roda só
  `npm ci` e `npm run verify` — nunca `prisma generate`.
- **Cenário de falha (reproduzido):** extraí exatamente o que a CI faz checkout
  (`git archive HEAD`) e rodei o compilador contra ele:
  ```
  src/plugins/prisma.ts(3,30): error TS2307: Cannot find module
    '../generated/prisma/client.js' or its corresponding type declarations.
  src/routes/auth.ts(3,27): error TS2307: Cannot find module
    '../generated/prisma/client.js' or its corresponding type declarations.
  ```
  `find <checkout> -path "*generated*"` → nenhum resultado.
  Cadeia: `npm run verify` → `npm run check` → `tsc --noEmit` falha → job vermelho
  no primeiro push e em todo PR. Qualquer pessoa que clonar e rodar `npm ci &&
  npm run dev:backend` bate no mesmo erro.
- **Nota de honestidade:** a mesma simulação também acusou
  `Cannot find module 'fastify-type-provider-zod'` e erros `unknown` em cascata
  em `req.body`. **Descartei esses** — são artefato do meu setup (juntei só o
  `node_modules` da raiz, e esse pacote está em `backend/node_modules`). Na CI
  real o `npm ci` o instala. Só os dois `TS2307` de `generated/prisma` são reais.
- **Correção sugerida:** adicionar `prisma generate` ao ciclo de instalação —
  um `"postinstall": "prisma generate"` no `backend/package.json`, ou um passo
  explícito `npm run prisma:generate -w backend` na CI antes de `npm run verify`.

### ALTO — A2 · Endpoints de auth sem rate limiting (brute force + exaustão de memória)

- **Onde:** `backend/src/server.ts:32-36`, `backend/src/routes/auth.ts` (todas as rotas)
- **Defeito:** nenhum limitador de taxa registrado. `grep -rniE "rate-?limit|@fastify/cors|helmet"
  backend/src/` → nenhum resultado; `@fastify/rate-limit` não está nas dependências.
- **Cenário de falha 1 (DoS por memória, o mais grave):** `argon2.hash` roda com
  os defaults da lib — `memoryCost` 64 MiB por chamada. `fly.toml.example:16`
  provisiona `memory_mb = 256`. Quatro requisições `POST /auth/login` concorrentes
  com qualquer e-mail existente alocam ~256 MiB e derrubam a máquina por OOM.
  Não exige credencial válida: o custo do argon2 é pago antes de saber se a senha
  confere.
- **Cenário de falha 2 (enchimento de banco):** `POST /auth/guest`
  (`routes/auth.ts:63-69`) cria um `User` **e** um `RefreshToken` sem qualquer
  autenticação. `for i in $(seq 100000); do curl -X POST .../auth/guest; done`
  insere 200 mil linhas. Não há cota, captcha nem TTL de limpeza.
- **Cenário de falha 3 (brute force):** `POST /auth/login` aceita tentativas
  ilimitadas por e-mail. Sem lockout nem backoff, uma wordlist roda até acertar;
  o argon2 encarece cada tentativa mas não a impede.
- **Correção sugerida:** registrar `@fastify/rate-limit` global com limite bem mais
  apertado nas rotas de auth (ex. 5/min por IP em login/signup/recover), e tratar
  `/auth/guest` como criação de recurso cotada por IP.

### MÉDIO — M1 · Cofre do ADR-0003 não existe; dependências instaladas e sem uso

- **Onde:** `app/src/state/secureStore.ts:37-38`, `docs/decisions/0003-criptografia-cofre.md:17-24`
- **Defeito:** o ADR-0003 declara estado "aceita" e especifica AES-256-GCM via
  `@noble/ciphers`, chave de 256 bits gerada com `expo-crypto` e biometria via
  `expo-local-authentication`. Nada disso foi implementado.
- **Evidência:** as três dependências estão instaladas (`app/package.json:7,14,16`
  — `@noble/ciphers`, `expo-crypto`, `expo-local-authentication`), mas
  `grep -rniE "vaultKey|encrypt|decrypt|cipher|aes|gcm" app/src/` retorna
  **apenas** três linhas, todas em `secureStore.ts`, todas declaração:
  ```
  app/src/state/secureStore.ts:11:  vaultKey: 'planob.vaultKey',
  app/src/state/secureStore.ts:37:  getVaultKey: () => getSecret('vaultKey'),
  app/src/state/secureStore.ts:38:  setVaultKey: (value: string) => setSecret('vaultKey', value),
  ```
  `getVaultKey`/`setVaultKey` não têm nenhum chamador. Zero import de
  `@noble/ciphers` no código. O modelo `VaultItem` já existe no schema com
  `ciphertext`/`nonce`, mas não há rota que o use.
- **Consequência concreta:** hoje não há vazamento — o cofre simplesmente não
  guarda nada. O risco é de leitura: alguém abrindo o repo lê o ADR "aceita" e o
  `secureStore` e conclui que a criptografia está entregue. Num projeto de Cyber
  Security publicado como portfólio, essa é a afirmação mais escrutinada do repo.
- **Correção sugerida:** marcar o ADR-0003 como `proposta`/`parcialmente
  implementada` com nota de marco pendente, ou remover a API morta `getVaultKey`/
  `setVaultKey` até o marco do cofre. Não deixar o par ADR-aceita + API-morta.

### MÉDIO — M2 · User enumeration no signup

- **Onde:** `backend/src/routes/auth.ts:38-39`
- **Defeito:** o signup responde `409 email_taken` para e-mail já cadastrado,
  enquanto login e recover foram deliberadamente feitos genéricos.
- **Evidência:**
  ```ts
  const existing = await app.prisma.user.findUnique({ where: { email } });
  if (existing) throw Conflict('email_taken', 'Este e-mail já está cadastrado.');
  ```
  Contraste com `auth.ts:55-57` (`invalid_credentials` genérico) e o comentário em
  `auth.ts:95-96`: *"resposta sempre positiva — não revela se o e-mail existe na base"*.
  O cuidado foi tomado em duas rotas e perdido na terceira.
- **Cenário de falha:** `POST /auth/signup {"name":"x","email":"alvo@gmail.com","password":"senha123"}`
  → `409 email_taken` confirma cadastro; um e-mail não cadastrado retorna `200`.
  Combinado com A2 (sem rate limit), dá para validar uma lista inteira de e-mails
  e descobrir quem usa o app — informação sensível para um app de vítimas de golpe.
- **Correção sugerida:** responder `200` genérico e enviar o desambiguador por
  e-mail, ou aceitar o vazamento conscientemente e registrá-lo num ADR — mas então
  o comentário de `recover` vira inconsistente.

### MÉDIO — M3 · Logout não revoga a sessão no servidor

- **Onde:** `app/src/state/store.ts:53-56`, `app/src/state/secureStore.ts:40-42`,
  `backend/src/routes/auth.ts` (rota ausente)
- **Defeito:** `logout()` apaga os tokens só do dispositivo. Não existe rota
  `/auth/logout`; a linha em `refresh_tokens` continua válida por 30 dias
  (`lib/tokens.ts:8` — `REFRESH_TOKEN_TTL_MS = 30 dias`).
- **Evidência:**
  ```ts
  logout: async () => {
    await secureStore.clearSession();   // só local
    set({ user: null, status: 'idle' });
  }
  ```
  As rotas registradas são signup, login, guest, refresh e recover — não há logout.
- **Cenário de falha:** usuário faz logout num aparelho emprestado/roubado. Quem
  tiver extraído o refresh token antes (backup, device comprometido) continua
  chamando `POST /auth/refresh` e emitindo access tokens por até 30 dias. O logout
  não teve efeito nenhum do lado do servidor.
- **Correção sugerida:** rota `POST /auth/logout` que apaga a linha pelo hash do
  refresh token recebido, chamada por `store.logout()` antes de limpar o local.

### MÉDIO — M4 · Rotação de refresh token sem detecção de reuso

- **Onde:** `backend/src/routes/auth.ts:75-87`
- **Defeito:** a rotação apaga o token usado e emite outro, mas um token já
  consumido apenas "não encontra" — não sinaliza comprometimento.
- **Evidência:** `if (!stored || stored.expiresAt < new Date()) throw Unauthorized(...)`
  trata token roubado-e-reusado igual a token expirado.
- **Cenário de falha:** atacante furta o refresh token e o usa primeiro. O token
  roda; o atacante fica com um par novo e válido. Quando o usuário legítimo tenta
  renovar, seu token já foi apagado → cai em `invalid_refresh_token` e é deslogado.
  Resultado: o **legítimo** perde a sessão e o **atacante** mantém a dele, sem
  nenhum alarme. É o cenário exato que a detecção de reuso (RFC 9700 / OAuth BCP)
  existe para cobrir.
- **Correção sugerida:** guardar família/linhagem do token; ao receber um hash já
  consumido, invalidar todos os refresh tokens do usuário.

### MÉDIO — M5 · Imagem Docker roda como root e carrega devDependencies

- **Onde:** `backend/Dockerfile:22-35`
- **Defeito:** o estágio `runtime` não declara `USER`, então o processo roda como
  root (uid 0); e copia o `node_modules` inteiro do estágio de build, que veio de
  `npm ci` com devDependencies.
- **Evidência:** `COPY --from=build /repo/node_modules ./node_modules` seguido de
  `CMD ["node", "backend/dist/server.js"]`, sem nenhuma linha `USER`.
- **Cenário de falha:** qualquer RCE ou path traversal no processo Node executa
  como root dentro do container, com `tsx`, `prisma` CLI, `eslint` e `typescript`
  disponíveis como ferramentas para o atacante — binários que não têm função
  nenhuma em produção.
- **Correção sugerida:** `USER node` antes do `CMD`, e `npm ci --omit=dev` num
  estágio separado para o `node_modules` de runtime.

### MÉDIO — M6 · README é template não preenchido — ninguém consegue clonar e rodar

- **Onde:** `README.md:1-43`
- **Defeito:** o arquivo ainda está com os placeholders do gerador.
- **Evidência:** `> {{Uma linha: o que faz e para quem.}}`, `{{linguagem/framework}}`,
  `git clone {{url}}`, `{{npm ci}}`, `{{publicado | em andamento | arquivado}}`.
- **Cenário de falha:** o README é a primeira tela do repositório público. Hoje ele
  não diz o que o projeto faz, qual a stack, nem como rodar. Some com o fato de que
  rodar exige `.env` (`DATABASE_URL`, `JWT_ACCESS_SECRET`) e `prisma generate`
  (A1) — nenhum dos dois documentado ali.
- **Correção sugerida:** preencher antes de publicar, incluindo o passo de copiar
  `backend/.env.example` → `backend/.env` e gerar o client Prisma.

### MÉDIO — M7 · `priorityRisks` acopla-se a índices posicionais de `QUESTIONS`

- **Onde:** `app/src/lib/scoring.ts:75-80`, `app/src/content/questions.ts:27-36`
- **Defeito:** os riscos referenciam perguntas por posição no array. As perguntas
  não têm campo `id`.
- **Evidência:** `const candidates: [number, PriorityRisk][] = [[2, {...códigos de
  recuperação...}], [6, {...contato de confiança...}], [1, {...e-mail...}],
  [4, {...IMEI...}]]`. Hoje o mapeamento está **correto** (índice 2 = "Você possui
  códigos de recuperação guardados?", 6 = "Possui um contato de confiança?",
  1 = "autenticação em dois fatores", 4 = "IMEI"). Verifiquei uma a uma.
- **Cenário de falha:** inserir uma pergunta no início de `QUESTIONS` (conteúdo
  editorial, que o AGENTS.md incentiva a evoluir em `app/src/content/`) desloca
  tudo: o índice 2 passa a apontar para "autenticação em dois fatores" e o app
  exibe "Códigos de recuperação não armazenados" com base na resposta sobre 2FA.
  Os 12 testes de `scoring.test.ts` continuam **verdes**, porque testam com
  respostas vazias ou todas "sim" — nenhum ancora identidade de pergunta.
- **Correção sugerida:** dar `id` estável a cada pergunta e referenciar por `id`;
  ou, no mínimo, um teste que fixe o texto da pergunta em cada índice usado.

### BAIXO — B1 · `JSON.parse` sem proteção vaza erro cru para a UI

- **Onde:** `app/src/api/client.ts:34-35`
- **Evidência:** `const text = await res.text(); const data = text ? JSON.parse(text) : undefined;`
- **Cenário de falha:** o backend atrás do proxy da Fly.io responde `502` com corpo
  HTML. `JSON.parse("<html>...")` lança `SyntaxError`, que não é `ApiError` — escapa
  do `catch` de 401 em `apiRequest:89-94` e chega na tela como
  `"Unexpected token < in JSON at position 0"`. Todo o esforço de mensagens amigáveis
  em `httpErrors.ts` é contornado exatamente quando o servidor está fora do ar.
- **Correção sugerida:** envolver o parse em try/catch e converter falha em
  `ApiError(res.status, 'invalid_response', ...)`.

### BAIXO — B2 · Repositório sem LICENSE

- **Onde:** raiz (ausente) — `ls LICENSE* COPYING*` → nenhum arquivo
- **Cenário de falha:** sem licença, vale "todos os direitos reservados" por padrão.
  Publicado como portfólio, ninguém — recrutador, colega, avaliador — pode
  legalmente copiar, rodar ou derivar o código, que é o oposto da intenção.
- **Correção sugerida:** adicionar MIT (ou a escolhida) antes de tornar público.

### BAIXO — B3 · `JWT_ACCESS_SECRET` aceito sem validação de força

- **Onde:** `backend/src/plugins/jwt.ts:11-12`
- **Evidência:** `const secret = process.env.JWT_ACCESS_SECRET; if (!secret) throw ...`
  — só checa presença.
- **Cenário de falha:** deploy com `JWT_ACCESS_SECRET=a` sobe normalmente. O
  `.env.example:7` traz o placeholder literal
  `"troque-por-um-valor-aleatorio-de-verdade"`; copiar o exemplo sem trocar
  produz um servidor com secret público e conhecido — HS256 forjável por qualquer
  um que leia o repo. O comentário do `.env.example` orienta bem, mas nada impõe.
- **Correção sugerida:** exigir comprimento mínimo (ex. 32 bytes) e rejeitar
  explicitamente o valor placeholder no boot.

### BAIXO — B4 · PII do usuário em AsyncStorage não criptografado

- **Onde:** `app/src/state/store.ts:62-68`
- **Evidência:** `partialize` persiste `user` (que inclui `name` e `email`, ver
  `secureStore.ts:1-7` comentando que segredos "nunca entram no Zustand nem no
  AsyncStorage").
- **Cenário de falha:** em aparelho com root ou via backup ADB, o arquivo da chave
  `planob:v1` entrega nome e e-mail do usuário em texto plano. Para um app cujo
  público é vítima de golpe/violência digital, saber *quem usa o app* já é dado
  sensível. Tokens estão corretamente fora dali — o achado é só sobre a PII.
- **Correção sugerida:** persistir apenas `id` e reidratar o perfil da API, ou
  mover `user` para o `expo-secure-store`.

---

## Limpo em

Dimensões auditadas onde **não** encontrei defeito — verificação executada, não presumida:

- **Segredos no working tree e no histórico.** `git log -p --all` varrido com padrões
  de token/chave/connection string. Os únicos matches são placeholders documentais
  em `.env.example` (`postgresql://user:password@host/dbname`,
  `troque-por-um-valor-aleatorio-de-verdade`). Nenhuma credencial real.
- **Cobertura do `.gitignore`.** `backend/.env` existe em disco e **não** está
  versionado; `git check-ignore -v` confirma `.gitignore:10:.env*` capturando
  `backend/.env` e `app/.env`. Não li o conteúdo do `.env`, conforme AGENTS.md.
  `app/dist` (gerado pelo build que rodei) coberto por `app/.gitignore:8`.
- **Bundle de design.** `docs/design-handoff/` extraído e varrido por URLs: só
  `fonts.googleapis.com`, `unpkg.com`, `images.unsplash.com` e `w3.org`. Nenhuma
  URL assinada, token de conta ou ID de sessão.
- **Dados pessoais em conteúdo editorial.** Varredura por CPF, telefone e e-mail em
  `app/src/content/`, `app/src/screens/`, `app/src/lib/`: os únicos matches são o
  exemplo `nome@email.com` em mensagens de validação.
- **Untracked candidatos a PR.** `dev.ps1`, `AGENTS.md`,
  `docs/GUIA-ANDROID-STUDIO-E-TERMINAL.md`, `docs/superpowers/**` e a migration
  SQL varridos por segredo — limpos. `dev.ps1` só orquestra panes do Windows Terminal.
- **`node_modules` fora do versionamento.** `git ls-files | grep -c node_modules` → `0`.
- **Lockfile.** `package-lock.json` versionado e coerente com os workspaces
  (`npm ls --workspaces --depth=0` resolve tudo, sem `UNMET DEPENDENCY`).
- **Hash de senha.** argon2id (`lib/hash.ts:4`) — algoritmo correto, sem custo
  customizado abaixo do default.
- **Refresh token em repouso.** Só o SHA-256 vai ao banco (`lib/tokens.ts:19-21`,
  `schema.prisma` `tokenHash @unique`); o valor cru nunca é persistido. Coberto por teste.
- **Validação Zod nas bordas.** Todas as rotas declaram `body`/`response` schema
  (`schemas/auth.ts`); serialização de resposta passa por `authSessionSchema`, o que
  impede vazamento acidental de `passwordHash` no payload.
- **Recover sem enumeração.** `auth.ts:91-99` responde `{sent:true}` incondicionalmente.
- **Prevenção de dessincronia em gamificação.** `totalPoints` e `evaluateAchievements`
  são funções puras derivadas dos mesmos fatos, sem acumulador mutável — revisei
  procurando off-by-one e estado inconsistente e não achei.
- **Divisão por zero em scoring.** `categoryScores:26` guarda `indices.length ? ... : 0`.
  `baseScoreOf:14` divide por `QUESTIONS.length` sem guarda, mas `QUESTIONS` é
  constante estática com 10 itens — não instanciável, **descartado como achado**.
- **`force_https`.** `fly.toml.example:12` habilita TLS obrigatório no serviço.

---

## Não auditado

- **Comportamento em runtime do backend.** Não subi o servidor nem conectei a um
  Postgres — exigiria `DATABASE_URL` real e o `.env` que o AGENTS.md proíbe ler.
  As rotas foram auditadas por leitura, não por execução. Um teste de integração
  de auth (hoje inexistente) é o que fecharia essa lacuna.
- **App em dispositivo/emulador.** Não rodei o app no AVD; telas e navegação foram
  auditadas por leitura. Acessibilidade e safe areas (exigidas pelo AGENTS.md) não
  foram verificadas visualmente.
- **A migration contra banco real.** `20260808015431_init/migration.sql` foi lida e
  confere com o `schema.prisma`, mas não foi aplicada a um Postgres.
- **`npm audit` / CVEs de dependência transitiva.** Fora do escopo definido; não executado.

---

## Bloqueia publicação no GitHub?

**NÃO — a publicação não expõe nada. Mas não publique com a CI nesse estado.**

Separando as duas perguntas, porque elas têm respostas diferentes:

**Há risco de exposição ao tornar o repo público? Não.** Este era o critério de
CRÍTICO automático e ele não foi acionado. `backend/.env` está em disco mas fora do
versionamento e comprovadamente coberto pelo `.gitignore`. O histórico dos dois
commits não tem credencial. O bundle de design não carrega URL assinada nem ID de
conta. Não há dado pessoal real em fixture ou conteúdo. **CRÍTICOS: 0.** O repo
pode ser público sem vazar nada.

**O repo está pronto para ser publicado? Ainda não** — por três motivos de
qualidade, todos baratos de resolver:

1. **A1 é o bloqueador prático.** A CI fica vermelha no primeiro push e em todo PR
   que você abrir. Pior: quem clonar não consegue rodar. Uma linha de
   `postinstall` resolve. Corrija antes do push, não depois.
2. **M6** — o README é template puro. É a primeira coisa que qualquer visitante lê.
3. **B2** — sem LICENSE, um repo público de portfólio é juridicamente intocável.

**A2** (rate limiting) não bloqueia a publicação do código, mas bloqueia qualquer
deploy real da API — em máquina de 256 MB, quatro logins concorrentes derrubam o
serviço. Trate como pré-requisito do marco de deploy, não do push.

**M1** merece um ajuste de honestidade antes de virar público: o ADR-0003 está
marcado "aceita" descrevendo criptografia que não existe no código. Num projeto de
Cyber Security avaliado por terceiros, é melhor o ADR dizer "pendente" do que um
leitor descobrir sozinho que `getVaultKey` não tem chamador.

**Ordem recomendada:** corrigir A1 + M6 + B2 → publicar → tratar A2 e M1–M5 nos PRs
seguintes.

**PRÓXIMO:** `pipe-builder` (corrigir A1, M6, B2 antes do push; depois A2 e M1–M5)

---
---

# 05 — Verdict · SEGUNDA PASSADA (RE-VERIFY)

- Data: 2026-08-13
- Escopo: verificação adversarial das 5 correções do `pipe-builder` (volta 1),
  sobre a **working tree completa sem commit** (tracked + untracked que vão nos PRs)
- Destino: repositório GitHub **privado**, 4 PRs temáticos
- Regra desta passada: o `PASS` do builder é alegação. Tentei derrubá-lo.

```
GATE: FAIL
CRITICOS:  0
ALTOS:     2
MEDIOS:    3
BAIXOS:    3
REGRESSOES: 4
```

As cinco correções **funcionam** — verifiquei todas por execução, não por leitura.
O `FAIL` não é por elas terem falhado. É porque duas delas **criaram um modo de
falha novo** que não existia antes: o rate limit, no caminho de deploy que o
próprio repositório documenta, apaga a credencial do usuário no dispositivo.

---

## Evidência executada (segunda passada)

| passo | comando | resultado |
| --- | --- | --- |
| verify na raiz | `npm run verify` | **ok** — app 12 passed, backend 14 passed (26 total) |
| **CI reproduzida** | export limpo da working tree → `npm ci` → `npm run verify` | **ok** — verde de ponta a ponta |
| install produção | `npm ci --omit=dev` em dir limpo | **ok** — client Prisma gerado |
| install sem hooks | `npm ci --ignore-scripts` → `tsc --noEmit` | **falha** (4× TS2307) — esperado, ver B3-2 |
| prisma sem `.env` | `npx prisma migrate status` | erro **claro** e alto, não silencioso |
| prisma com `.env` | `npx prisma migrate status` | resolve a URL, chega no banco |
| bootstrap real | `node` sobre `backend/dist/app.js` + HTTP de verdade | **ok** — 200/429/close limpos |
| custo do argon2 | bench com `argon2` instalado | medido, ver A2 |
| gate de concorrência | stress nos 3 caminhos não cobertos por teste | **correto** |
| Dockerfile | `docker build` | **NÃO RODOU** — engine Docker Desktop parado |

### CI reproduzida — o teste que reprovou na primeira passada

Não usei `git archive HEAD` (não tem as correções). Montei a árvore que
**realmente** vai virar PR: `git ls-files -co --exclude-standard` → 105 arquivos
copiados para um diretório limpo fora do repo.

```
--- copiados: 105
--- procura .env / generated / node_modules no export:
(fim)                      ← nenhum resultado
```

Só `app/.env.example` e `backend/.env.example` casam com padrão de env. Nenhum
`.env` real, nenhum `generated/`, nenhum `node_modules`.

Nesse diretório, sem `.env` e com `DATABASE_URL`/`JWT_ACCESS_SECRET` ausentes do
ambiente (`env | grep -c` → `0`):

```
added 1301 packages, and audited 1304 packages in 51s

$ ls backend/src/generated/prisma/
browser.ts  client.ts  commonInputTypes.ts  enums.ts  internal/  models/  models.ts
```

O `postinstall` disparou, gerou o client no caminho certo do schema, sem banco.
Em seguida:

```
> backend@1.0.0 check / tsc --noEmit && eslint .        (sem erro)
> backend@1.0.0 build / tsc -p tsconfig.build.json      (sem erro)
Test Suites: 1 passed, 1 total   Tests: 12 passed, 12 total     (app)
 Test Files  4 passed (4)              Tests  14 passed (14)    (backend)
```

**A1 está resolvido.** A CI fica verde no primeiro push. Clone limpo compila.

### Bootstrap real do backend buildado

Subi `backend/dist/app.js` (o artefato de produção), sem Postgres:

```
subiu em http://127.0.0.1:65105
RSS depois do boot completo: 74.6 MiB
trustProxy = (default false)

GET /health -> {"s":200,"rl":"99","body":"{\"ok\":true}"}

--- 7x POST /auth/login do mesmo socket ---
  #1 status=500 restam=4      #5 status=500 restam=0
  #2 status=500 restam=3      #6 status=429 restam=0  {"code":"rate_limited",...}
  #3 status=500 restam=2      #7 status=429 restam=0  {"code":"rate_limited",...}
  #4 status=500 restam=1

--- forjando X-Forwarded-For diferente a cada tiro ---
  XFF=203.0.113.1 status=429   XFF=203.0.113.2 status=429   XFF=203.0.113.3 status=429

--- GET /health depois do balde de auth estourado ---
  {"s":200,...}                          ← balde por rota não derruba o resto

fechou limpo (graceful close ok)
```

(os `500` são a ausência de Postgres, esperada neste harness — o que importa é o
corte na 6ª e o formato `{code,message}`.)

### Custo e memória do argon2 — medidos, não estimados

```
verify m=19456,t=2,p=1: 36.0 ms/op  -> 27.8 ops/s por slot
verify m=65536,t=3,p=4: 67.6 ms/op  -> 14.8 ops/s por slot

2 verifies concorrentes m=19456        : base RSS 45.9 -> pico  83.9 MiB (delta  38.0 MiB)
2 verifies concorrentes m=65536 (legado): base RSS 46.1 -> pico 174.2 MiB (delta 128.2 MiB)

custo relativo de ataque offline (m*t): 196608 vs 38912 -> 5.05x mais barato
```

### Gate de concorrência — os três caminhos que os testes não cobrem

```
(1) rejeicoes com fila atras -> falhou-0, ok-1, falhou-2, ok-3, falhou-4, ok-5
    running final = 0 (esperado 0)
(2) 20000 tarefas enfileiradas de uma vez, running=2, concluidas=0
    heapUsed com a fila cheia: 16.4 MiB
    drenou 20000 em 360 ms; running final = 0
(3) tarefa abandonada pelo chamador executou assim mesmo? true
```

Sem deadlock, sem starvation, sem slot vazado no throw com fila atrás. A
implementação está correta. (3) é o único ponto de atenção — ver B1-2.

---

## Veredito por alegação do builder

| alegação | veredito | como provei |
| --- | --- | --- |
| **A1** `postinstall` faz clone limpo compilar | **CONFIRMADA** | export de 105 arquivos, `npm ci` + `verify` verdes sem `.env` |
| **A1** `process.env` no lugar de `env()` não quebra `prisma migrate` | **CONFIRMADA** | `migrate status` resolve com `.env`, e sem ele falha alto |
| **A1** `postinstall` roda no cwd certo do workspace | **CONFIRMADA** | client emitido em `backend/src/generated/prisma/` |
| **A1** Dockerfile reordenado | **INDETERMINADA** | engine Docker parado; `docker version` → erro de pipe |
| **A2** rate limit por rota funciona | **CONFIRMADA** | 5 passam / 6ª = 429, sobre HTTP real |
| **A2** `TRUST_PROXY` opt-in não deixa forjar IP | **CONFIRMADA** | 3 `X-Forwarded-For` distintos → todos 429 |
| **A2** gate segura o pico em 38 MiB | **CONFIRMADA (só p/ hash novo)** | delta medido 38.0 MiB — mas 128.2 MiB no legado, ver M1-2 |
| **A2** envelope de 256 MiB fecha | **CONFIRMADA (só p/ hash novo)** | 74.6 (boot) + 38 = ~113 MiB; com legado ~203 MiB |
| **A2** m=19456,t=2,p=1 é o mínimo OWASP | **CONFIRMADA** | é a 2ª das configurações equivalentes do Password Storage Cheat Sheet |
| **A2** hash antigo continua validando | **CONFIRMADA** | fixture m=65536 verifica `true`; reproduzi fora do teste |
| **A2** gate sem deadlock/starvation/leak | **CONFIRMADA** | stress nos 3 caminhos, `running` volta a 0 |
| **M1** ADR-0003 marcado pendente | **CONFIRMADA (parcial)** | ADR e `_INDEX.md:12` batem — mas `AGENTS.md:65` não, ver M3-2 |
| **M6** README sem `{{}}` e sem promessa falsa | **CONFIRMADA (quase)** | zero placeholder; uma imprecisão, ver B3-2 |
| **B2** LICENSE MIT | **CONFIRMADA, com defeito novo** | licença existe — e cobre código de terceiro, ver M2-2 |
| **NOVO** app.ts extraído não muda bootstrap | **CONFIRMADA** | ordem de plugin, error handler, 429, `/health` e close verificados vivos |
| **NOVO (builder)** `npm ci --omit=dev` falha | **REFUTADA** | rodou e gerou o client: `prisma` e `typescript` entram como transitivos |

**Sobre o argon2 — veredito explícito, já que foi pedido.** O número bate com a
recomendação de verdade: o OWASP Password Storage Cheat Sheet lista, para
Argon2id, "m=19456 (19 MiB), t=2, p=1" como uma das configurações mínimas
equivalentes. Não é leitura conveniente. **Mas é uma redução real:** medi 5,05×
menos custo de ataque offline (m·t de 196608 → 38912). A troca é aceitável — e
seria mais defensável se o builder tivesse notado que o *outro* conserto da
mesma tarefa já resolvia o problema que justificou a redução: com o gate em 2
slots, m=65536 daria pico de 128 MiB, que ainda cabe nos 256 MiB (74.6 de boot
+ 128 = ~203 MiB). Ou seja, dava pra manter o custo alto **e** o envelope.
Não abro achado — não é comportamento errado — mas registro para a decisão ficar
consciente em vez de herdada.

---

## Achados da segunda passada

### ALTO — A1-2 · Um `429` em `/auth/refresh` apaga a credencial do usuário no aparelho (REGRESSÃO)

- **Onde:** `app/src/api/client.ts:71-73`, disparado por
  `backend/src/plugins/rateLimit.ts:32` (`REFRESH_RATE_LIMIT` 20/min por IP),
  caminho vivo em `app/src/screens/auth/AuthScreen.tsx:104-107`
- **Defeito:** `refreshSession()` trata **qualquer** falha de `POST /auth/refresh`
  como "sessão morta" e destrói os tokens do `expo-secure-store`. O A2 acabou de
  criar uma falha nova nesse endpoint que **não significa sessão morta**: `429`.
- **Evidência:**
  ```ts
  // app/src/api/client.ts:71-73
  } catch {
    await secureStore.clearSession();   // apaga accessToken E refreshToken do Keychain/Keystore
    return null;
  ```
  ```ts
  // backend/src/plugins/rateLimit.ts:32
  export const REFRESH_RATE_LIMIT: RateLimitOptions = { max: 20, timeWindow: '1 minute' };
  ```
  `clearSession()` (`app/src/state/secureStore.ts:40-42`) faz
  `deleteSecret('accessToken')` **e** `deleteSecret('refreshToken')`.
- **Cenário de falha (concreto, sem atacante):** o público do app está em rede
  móvel brasileira, onde CGNAT põe centenas de assinantes atrás de um IPv4 só.
  Basta o 21º refresh daquele IP no minuto:
  1. usuária abre o app e toca "entrar com biometria" (`AuthScreen.tsx:95`);
  2. passa no prompt biométrico local, `refreshSession()` chama `/auth/refresh`;
  3. o servidor responde `429 rate_limited` — a sessão dela está perfeitamente válida;
  4. o `catch` apaga o refresh token do Keystore;
  5. a tela mostra *"Sua sessão expirou. Entre novamente com e-mail e senha."*
- **Por que é o achado mais grave da passada:** para conta **visitante** não
  existe e-mail e senha. `/auth/guest` cria `User` com `isGuest: true` e
  `passwordHash: null` (`backend/src/routes/auth.ts`, `guestEmail()`); o refresh
  token no Keystore é a **única** credencial daquela conta. Apagado, a conta fica
  órfã no banco e a pessoa vira um usuário novo. É perda irreversível de conta
  causada por uma resposta transitória — num app para vítima de golpe, que é
  exatamente quem não vai conseguir "entrar de novo depois".
- **Agravante:** o mesmo `catch` engole `SyntaxError` do `JSON.parse` sem guarda
  (B1 da primeira passada). Um `429`/`502` em HTML do proxy da Fly cai no mesmo
  lugar e produz o mesmo apagamento.
- **Correção sugerida:** no `catch`, só chamar `clearSession()` quando
  `err instanceof ApiError && err.status === 401`. Qualquer outro status (429,
  5xx) e qualquer erro de rede devem preservar o token e propagar como falha
  temporária.

### ALTO — A2-2 · O deploy documentado põe a base inteira num balde de rate limit só (REGRESSÃO)

- **Onde:** `fly.toml.example:1-23` (nenhum `[env]`, nenhum `TRUST_PROXY`),
  `backend/src/app.ts:30`, `backend/.env.example:11-14`
- **Defeito:** `trustProxy` só liga com `TRUST_PROXY=true`. O único artefato de
  deploy do repositório não define essa variável em lugar nenhum — nem em bloco
  `[env]`, nem na linha que ensina a cadastrar secrets:
  ```toml
  # fly.toml.example:21-22
  # Secrets NÃO ficam aqui — cadastre com:
  #   fly secrets set DATABASE_URL="..." JWT_ACCESS_SECRET="..."
  ```
  O `.env.example` documenta a variável, mas `.env` não é como a Fly.io injeta
  configuração. Não há caminho, no repo, que ligue isso no alvo de deploy real.
- **Evidência de que o default é `false`:** o servidor buildado reportou
  `trustProxy = (default false)` no boot, e três `X-Forwarded-For` distintos
  compartilharam o mesmo balde (todos `429`) — prova de que a chave é o socket.
- **Cenário de falha:** Pedro segue o próprio `fly.toml.example`, faz
  `fly deploy`. Todo request chega pelo proxy da Fly, então `req.ip` é o proxy
  para **todos** os usuários. Consequência imediata, sem atacante:
  - `/auth/login`, `/auth/signup`, `/auth/recover`: **5 tentativas por minuto
    para a base inteira**. A 6ª pessoa a tentar login naquele minuto leva `429`;
  - `/auth/guest`: **5 contas de visitante por hora no serviço todo**;
  - a API inteira: 100 requisições por minuto (`GLOBAL_RATE_LIMIT`).
  Com o A1-2 acima, isso não é só indisponibilidade: os `429` em `/auth/refresh`
  passam a apagar credencial em massa.
- **Correção sugerida:** `[env]\n  TRUST_PROXY = "true"` no `fly.toml.example`, e
  citar a variável no comentário de secrets. Um teste que asserte
  `buildApp` com `TRUST_PROXY=true` chaveia por `X-Forwarded-For` fecharia o buraco.

### MÉDIO — M1-2 · `HASH_PEAK_MEMORY_MIB` promete um teto que o código não cumpre (REGRESSÃO)

- **Onde:** `backend/src/lib/hash.ts:28-29`, `backend/src/lib/hash.test.ts:11-17`
  contra `backend/src/lib/hash.test.ts:27-35`
- **Defeito:** a constante é documentada como *"Teto de memória que o argon2 pode
  alocar no processo, em MiB"* e calculada só a partir de `ARGON2_OPTIONS`. Mas
  `verifyPassword` não usa `ARGON2_OPTIONS` — `argon2.verify` lê os parâmetros do
  hash gravado. Os dois testes do mesmo arquivo se contradizem: um fixa o teto em
  38 MiB, o outro **prova** que a mesma função verifica hashes de m=65536.
- **Cenário de falha (medido):** dois logins concorrentes de contas cujo hash foi
  gravado antes desta mudança:
  ```
  2 verifies concorrentes m=19456        : delta  38.0 MiB   ← o que a constante diz
  2 verifies concorrentes m=65536 (legado): delta 128.2 MiB   ← 3,4x o teto asserido
  ```
  Somado ao boot medido (74.6 MiB), a folga na máquina de 256 MiB cai de ~180 MiB
  para ~50 MiB — antes de pool do Postgres e de tráfego. Não há rehash no login
  bem-sucedido, então uma linha legada continua cara para sempre.
- **Impacto hoje é baixo** — não existe banco de produção, então não há hash
  legado em lugar nenhum além do dev local do Pedro. O defeito é a garantia
  falsa: um teste verde afirma um envelope que o código não sustenta, e é
  exatamente esse teste que vai ser lido como prova em qualquer revisão futura.
- **Correção sugerida:** ou remover o suporte a legado (não há usuário real a
  preservar) e dizer isso no comentário, ou fazer rehash com `ARGON2_OPTIONS`
  quando `verify` bate num hash com parâmetros diferentes — e então o teto vale.

### MÉDIO — M2-2 · O LICENSE MIT dá permissão sobre 305 KB de design system de terceiro (REGRESSÃO)

- **Onde:** `LICENSE:1-3`, `package.json:4`, cobrindo
  `docs/design-handoff/src/_ds/ana-paula-fi-rio-design-system-6bd756eb-b104-4801-a60a-2c658330a1d1/`
- **Defeito:** a correção B2 pôs um MIT com *"Copyright (c) 2026 Pedro Diniz"* na
  raiz. A raiz inclui um bundle de design system de outra autora, vendorizado
  inteiro, sem licença própria e sem nota de atribuição.
- **Evidência:**
  ```
  $ du -sh docs/design-handoff/src/_ds     → 305K
  $ grep -rlniE "licen[sç]|copyright" docs/design-handoff   → nenhum arquivo de licença
  _ds_bundle.js:7669: ...['mail','E-mail','contato@anapaulafiorio.com.br']...
  ```
  O `README.md:130` descreve `docs/design-handoff/` como *"pacote de design
  original — referência"*, sem ressalva de titularidade.
- **Cenário de falha:** o repositório vai privado agora, então não há dano
  imediato. No dia em que virar público (é portfólio — é o destino), qualquer
  pessoa lê o MIT, extrai `_ds_bundle.js` e o revende, apoiada num
  *"permission to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell"* que Pedro não tinha direito de conceder. O risco é do Pedro, não
  de quem copiou.
- **Correção sugerida:** um `docs/design-handoff/NOTICE.md` declarando a autoria e
  que aquele diretório está fora do MIT, e um parágrafo de escopo no `LICENSE`
  ou no `README`. Alternativa mais limpa: tirar `_ds/` do repo — o README já diz
  que o protótipo "não é código de produção para copiar e colar".

### MÉDIO — M3-2 · `AGENTS.md` ainda afirma que a criptografia do cofre existe

- **Onde:** `AGENTS.md:65-66`, contra `docs/decisions/0003-criptografia-cofre.md:4-9`
  e `README.md:40-42`
- **Defeito:** a correção M1 arrumou o ADR e o índice, mas deixou a mesma
  afirmação intacta no arquivo de instruções — no presente do indicativo:
  ```
  AGENTS.md:65:  - O cofre usa criptografia client-side e `expo-secure-store`; nunca registre
  AGENTS.md:66:    conteúdo sensível em logs.
  ```
  enquanto o ADR agora diz, em negrito: *"Nada do que a seção 'Decisão' descreve
  existe em código ainda"*, e o README diz *"A criptografia do Cofre **não está
  implementada**"*.
- **Cenário de falha:** o `AGENTS.md` é o arquivo que qualquer agente (e qualquer
  colaborador) lê antes de editar — o próprio arquivo manda ler ele primeiro. Um
  agente futuro lê "o cofre usa criptografia client-side", assume que existe e
  escreve código que grava no `VaultItem` contando com cifra que ninguém
  implementou. É o mesmo defeito que M1 consertou, sobrevivendo no arquivo de
  maior autoridade dos três.
- **Correção sugerida:** trocar para o futuro/condicional com ponteiro para o ADR:
  "o cofre **vai usar** criptografia client-side (ver ADR-0003, pendente)".

### BAIXO — B1-2 · A fila do gate não tem teto, não tem timeout e não cancela trabalho abandonado

- **Onde:** `backend/src/lib/concurrencyGate.ts:19` (`const waiting: Array<() => void> = []`),
  `:26-42` (`run` sem `AbortSignal`)
- **Evidência (medida):** enfileirei 20.000 tarefas de uma vez —
  `running=2, concluidas=0, heapUsed 16.4 MiB`, drenou tudo em 360 ms sem
  descartar nenhuma. E a tarefa cujo chamador desistiu **executou assim mesmo**
  (`(3) ... executou assim mesmo? true`).
- **Cenário de falha:** vazão medida do gate é 2 slots × 27.8 ops/s ≈ **56
  hashes/s** para o serviço inteiro. Acima disso a fila só cresce: não há shed,
  não há 503, não há prazo. O cliente estoura o timeout e desconecta; o servidor
  segue pagando o argon2 daquela requisição morta. Com o rate limit correto
  (5/min por IP em signup) é preciso ~670 IPs distintos para chegar lá — botnet
  modesta, não script solto. Por isso BAIXO e não mais.
- **Correção sugerida:** teto na fila (rejeitar com 503 acima de N) ou prazo
  máximo de espera, para a sobrecarga virar erro rápido em vez de latência sem fim.

### BAIXO — B2-2 · O balde do rate limit zera a cada cold start e multiplica por máquina

- **Onde:** `backend/src/plugins/rateLimit.ts:38-49` (store default in-memory),
  `fly.toml.example:12-14`
- **Evidência:** `registerRateLimit` não passa `redis` nem `store`, então o
  contador vive no processo. E o deploy previsto é
  ```toml
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
  ```
- **Cenário de falha:** o atacante gasta as 5 tentativas de login, para de mandar
  tráfego até a máquina ociosa parar, e a próxima requisição sobe uma máquina
  nova com o contador zerado. Escalar para 2 máquinas dobra todos os limites.
  Impacto real é modesto — o argon2 e a política de 8+ caracteres seguram o brute
  force de qualquer jeito — mas o número de `AUTH_RATE_LIMIT` não é o que o
  comentário do arquivo afirma ("trava um único IP em ~7.200 tentativas por dia").
- **Nota de honestidade:** inferido da configuração, **não executado** — não subi
  máquina na Fly.io.
- **Correção sugerida:** store compartilhado (Redis) quando houver mais de uma
  máquina, ou ajustar o comentário para não prometer um teto diário que o
  ambiente não garante.

### BAIXO — B3-2 · README lista "recuperação" como entregue; não há fluxo nem envio

- **Onde:** `README.md:33-34`, contra `app/src/api/auth.ts:17-19` e
  `backend/src/routes/auth.ts:111-120`
- **Evidência:** o README diz *"**Marco 1 entregue:** ... fatia vertical de
  autenticação (cadastro, login, visitante, refresh, recuperação)"*. Mas
  `grep -rn "recover" app/src --include=*.tsx` → **nenhum resultado**: a função
  `recover()` existe na camada de API e não tem chamador em tela nenhuma. E a rota
  do backend é stub declarado: `// TODO(marco futuro): disparar e-mail de verdade`.
- **Cenário de falha:** o avaliador lê "recuperação entregue", abre o app,
  procura "esqueci minha senha" e não acha em lugar nenhum. É a mesma classe de
  imprecisão que M1 e M6 acabaram de consertar, sobrevivendo numa linha.
- **Correção sugerida:** trocar "recuperação" por "recuperação (rota pronta,
  envio de e-mail pendente)", ou tirar da lista.

### Nota — instalação com `--ignore-scripts` volta ao TS2307

Não abro como achado (não é caminho documentado e o `argon2` também depende de
script de instalação, então esse modo já não funcionaria de qualquer jeito), mas
fica registrado porque a defesa do A1 é um lifecycle hook:

```
$ npm ci --ignore-scripts && cd backend && npx tsc --noEmit
src/app.ts(3,35):            error TS2307: Cannot find module './generated/prisma/client.js'
src/plugins/prisma.ts(3,30): error TS2307: Cannot find module '../generated/prisma/client.js'
src/routes/auth.test.ts(4,35): error TS2307: ...
src/routes/auth.ts(3,27):    error TS2307: ...
```

---

## Segurança de publicação — segunda varredura, working tree completa

Varri os 105 arquivos exportáveis, incluindo todos os untracked que vão nos PRs.

- **Padrões de segredo** (AWS, GitHub PAT, OpenAI, Slack, chave privada PEM, JWT,
  connection string com senha, token npm, chave Google): **2 matches, ambos
  documentais** — `backend/.env.example:2`
  (`postgresql://user:password@host/dbname`) e a citação dele no próprio
  `05-verdict.md:318`. Nenhuma credencial real.
- **`dev.ps1`** — 7 linhas, só `wt`/`split-pane` com `$PSScriptRoot`. Sem token,
  sem caminho absoluto de máquina, sem variável de ambiente.
- **`backend/prisma/migrations/20260808015431_init/migration.sql`** — DDL puro:
  9 `CREATE TABLE`, 7 `CREATE INDEX`, 8 `ADD FOREIGN KEY`. Zero `INSERT`, zero
  seed, zero dado.
- **`AGENTS.md`, `docs/GUIA-ANDROID-STUDIO-E-TERMINAL.md`, `docs/superpowers/**`** —
  384 linhas somadas, limpas.
- **Caminhos de máquina e identificadores pessoais:** `grep` por `C:\Users`,
  `/Users/`, `Pedro Diniz`, `pedrodiniz310`. Só dois matches, ambos intencionais:
  `LICENSE:3` (copyright) e `README.md:58` (URL do clone).
- **E-mails no tree:** `a@b.com`, `algo@algo.tld`, `alvo@example.com`,
  `alvo@gmail.com`, `nome@email.com`, `user@email.com`, `pedro.demo@planob.app`
  (fixtures e exemplos de validação); `i@izs.me` (texto de deprecação do npm
  dentro do `package-lock.json`); `contato@anapaulafiorio.com.br` (contato
  comercial público da autora do design system — não é segredo, mas é o mesmo
  arquivo do M2-2).
- **`.gitignore`** continua cobrindo `.env`: o export de 105 arquivos não trouxe
  nenhum, com `backend/.env` presente em disco.

**CRITICOS: 0.** Nada que impeça criar o repositório privado por risco de exposição.

---

## Regressões nos achados fora de escopo

Confirmado que nenhum dos oito piorou:

| achado | estado | verificação |
| --- | --- | --- |
| M2 signup vaza `email_taken` | inalterado (e mais difícil de explorar) | `auth.ts:47` idem; agora 5/min por IP |
| M3 logout não revoga | inalterado | `grep -c "auth/logout"` → `0` |
| M4 rotação sem detecção de reuso | inalterado | `auth.ts:100-108` idem |
| M5 Dockerfile sem `USER`, devDeps no runtime | inalterado | `grep -c "^USER"` → `0`; diff só mexeu no estágio `deps` |
| M7 `priorityRisks` por índice | inalterado | `scoring.ts:75` idem |
| B1 `JSON.parse` sem guarda | inalterado — mas **mais exposto** | `client.ts:35` idem; agora alcançável por 429 (ver A1-2) |
| B3 `JWT_ACCESS_SECRET` sem força | inalterado | `jwt.ts:11-12` idem |
| B4 PII no AsyncStorage | inalterado | `store.ts:67` idem |

---

## Limpo em (segunda passada)

Dimensões que ataquei e onde **não** achei defeito:

- **Correção do `concurrencyGate`.** Provado por execução: rejeição com fila
  atrás transfere o slot certo, `running` volta a 0, sem deadlock e sem
  starvation. A crítica em B1-2 é sobre política de fila, não sobre a lógica.
- **Bootstrap depois da extração do `app.ts`.** Ordem de registro (rate limit
  antes das rotas), error handler no formato `{code,message}`, `/health`,
  `app.close()` — todos exercitados sobre o binário buildado.
- **Compatibilidade do `prisma.config.ts`.** `generate`, `validate` e
  `migrate status` verificados; sem `DATABASE_URL` a falha é alta e legível.
- **Forja de IP.** `X-Forwarded-For` não move o balde com `trustProxy=false`.
- **Isolamento dos baldes.** Estourar `/auth/login` não afeta `/health`.
- **Parâmetros do argon2 gravados no hash.** `$argon2id$v=19$m=19456,p=1,t=2$`
  conferido no hash real, e o legado m=65536 verifica `true`.
- **Instalação de produção.** `npm ci --omit=dev` funciona e gera o client.
- **Higiene do que vai virar PR.** Nenhum `.env`, `generated/` ou `node_modules`
  no export de 105 arquivos.

---

## Não auditado (segunda passada)

Marcado explicitamente porque **não aprovo por omissão**:

- **`docker build` do backend.** `docker version` → *"open
  //./pipe/dockerDesktopLinuxEngine: O sistema não pode encontrar o arquivo
  especificado"*. Mesma limitação do builder. A reordenação do Dockerfile
  (A1) está **INDETERMINADA** — o raciocínio é sólido (o `COPY backend/prisma`
  antes do `npm ci` alimenta o `postinstall`, e `COPY backend ./backend` faz
  merge sem apagar o `generated/` do estágio anterior), mas raciocínio não é
  execução.
- **Rate limit atrás de proxy real** com `TRUST_PROXY=true`. Testei só o
  contrário (forja rejeitada com `false`). Nenhum teste cobre o caminho ligado.
- **Números do rate limit contra carga real.** A vazão de 56 hashes/s é bench de
  laboratório em máquina Windows, não a VM `shared-cpu-1x` da Fly.
- **Backend contra Postgres real.** Os testes de rota injetam um `prismaStub`
  cujo `findUnique` sempre devolve `null` — por construção o login nunca chega no
  argon2 nesses testes. Nenhuma rota foi exercitada contra banco.
- **RSS com pool de conexão ativo.** Os 74.6 MiB medidos são de um processo que
  nunca abriu conexão. O envelope de 256 MiB fecha com folga confortável para
  hash novo, apertado para hash legado — mas o número real de produção não foi medido.
- **App em dispositivo.** O cenário do A1-2 foi rastreado no código, não
  reproduzido num aparelho.

---

## Libera os PRs?

**NÃO.**

Não por segurança de publicação — essa parte está limpa pela segunda vez, e o
repositório privado pode ser criado sem expor nada. **CRITICOS: 0.**

O bloqueio é **A1-2**: o rate limit que acabou de ser adicionado apaga o refresh
token do Keystore quando responde `429`, e para conta de visitante esse token é a
única credencial que existe. Some com **A2-2** — o `fly.toml.example` não liga o
`TRUST_PROXY`, então no primeiro deploy a base inteira compartilha um balde de
20 refreshes por minuto — e o resultado é logout em massa e irreversível na
primeira vez que a API subir. As duas correções isoladas estão certas; é a
combinação delas com código que já existia que produz o defeito.

São dois consertos pequenos e localizados:

1. `app/src/api/client.ts:71` — `clearSession()` só quando `status === 401`.
2. `fly.toml.example` — bloco `[env]` com `TRUST_PROXY = "true"`.

Feitos esses dois, o gate passa. M1-2, M2-2 e M3-2 são de honestidade e
titularidade — importam antes do repo virar **público**, não antes de virar
privado. Os três BAIXOS podem ir para os PRs seguintes.

Uma observação sobre o processo, não sobre o código: o builder declarou
`GATE: PASS, 5/5`. As cinco tarefas realmente foram entregues e eu confirmei
cada uma por execução. O que faltou não foi implementação — foi perguntar o que
a mudança *quebra* a jusante. Os dois ALTOS desta passada estão os dois no
mesmo ponto cego: o efeito de uma resposta HTTP nova (`429`) sobre um cliente
que já existia e sobre um artefato de deploy que ninguém releu.

**PRÓXIMO:** `pipe-builder` (corrigir A1-2 e A2-2; depois M1-2, M2-2, M3-2) →
re-verify curto só nesses dois pontos → `pipe-scribe`.


---
---

# 05 — Verdict · TERCEIRA PASSADA (GATE FINAL PRÉ-`ship`)

- Data: 2026-08-14
- Escopo: verificação adversarial da volta 2 do `pipe-builder` (T6–T10) e do
  follow-up T11/D1, sobre a **working tree completa sem commit** (108 arquivos)
- Peso: este é o gate que autoriza `gh repo create` + 5 PRs. `PASS` aqui empurra.
- Regra desta passada: o `GATE: PASS` do builder é alegação. Tentei derrubá-lo.

```
GATE: FAIL
CRITICOS:   0
ALTOS:      1
MEDIOS:     1
BAIXOS:     1
REGRESSOES: 2
```

**Nenhum segredo vazou — terceira varredura, terceira vez limpa.** O `FAIL` é por
um defeito de segurança novo, medido: a correção T7 ligou `TRUST_PROXY = "true"`
no único artefato de deploy, e com esse valor o Fastify passa a ler o
`X-Forwarded-For` **mais à esquerda** — que é escrito pelo cliente. O rate limit
inteiro, que foi a correção A2 da volta 1, fica contornável de uma única máquina.

O padrão que já se repetiu nas duas passadas anteriores se repetiu de novo, agora
em forma mais séria: a correção está certa contra o achado que a motivou (A2-2, o
balde único) e errada contra o código que ela encontrou (a chave do balde).

---

## Evidência executada (terceira passada)

| passo | comando | resultado |
| --- | --- | --- |
| verify na raiz | `npm run verify` | **ok** — exit 0; app 20 passed, backend 16 passed (**36**) |
| **CI reproduzida** | export de 108 arquivos → `npm ci` → `npm run verify` | **ok** — exit 0, verde ponta a ponta |
| typecheck + lint | `tsc --noEmit && eslint .` (app e backend) | **ok**, zero erro |
| build | `expo export` + `tsc -p tsconfig.build.json` | **ok** |
| TOML do deploy | `smol-toml` (parser TOML 1.0.0) sobre `fly.toml.example` | **ok** — parse limpo |
| argon2: pico | 2 verifies concorrentes `m=65536,t=3,p=4` | **128,2 MiB** — bate |
| argon2: CPU em 1 núcleo | mesmo perfil, afinidade fixada em 1 core | **262 ms/op → 4,0 hash/s** |
| latch do `refreshSession` | 4 cenários de `throw` | **livre em todos** |
| **forja de `X-Forwarded-For`** | `TRUST_PROXY=true` + XFF rotativo, HTTP real | **limite contornado** |
| varredura de publicação | 108 arquivos, 5 famílias de padrão | **0 segredos** |
| `docker build` | `docker version` | **NÃO RODOU** — engine parado (3ª vez) |

### `npm run verify` — saída literal

```
> check
> npm run check --workspaces --if-present
> app@1.0.0 check / tsc --noEmit && eslint .
> backend@1.0.0 check / tsc --noEmit && eslint .

> build
> app@1.0.0 build / expo export
Android Bundled 20062ms app\index.ts (2725 modules)
iOS Bundled 35394ms app\index.ts (2797 modules)
Exported: dist
> backend@1.0.0 build / tsc -p tsconfig.build.json

> test
> app@1.0.0 test / jest
PASS src/api/__tests__/client.test.ts
PASS src/lib/__tests__/scoring.test.ts
Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total

> backend@1.0.0 test / vitest run
 Test Files  4 passed (4)
      Tests  16 passed (16)

[exited with code 0]
```

**36 testes. A alegação do builder confere.**

### CI reproduzida a partir da árvore que seria commitada

Não usei `git archive HEAD` (não tem nenhuma das correções). Montei o que
realmente vira PR — `git ls-files -co --exclude-standard`, tracked + untracked —
num diretório limpo fora do repo:

```
--- arquivos copiados: 108
--- procura .env / generated / node_modules / dist no export:
.../ci3/app/.env.example
.../ci3/backend/.env.example
(fim da procura)
--- env do shell: 0 vars de app no ambiente
```

Só os dois `.env.example`. Nenhum `.env` real, nenhum `generated/`, nenhum
`node_modules`, nenhum `dist`. Nesse diretório, sem `DATABASE_URL` e sem
`JWT_ACCESS_SECRET` no ambiente:

```
added 1301 packages, and audited 1304 packages in 1m
=== ls generated ===
browser.ts  client.ts  commonInputTypes.ts  enums.ts  internal  models  models.ts
=== VERIFY ===
Tests: 20 passed, 20 total          (app)
 Test Files  4 passed (4)   Tests  16 passed (16)   (backend)
[exited with code 0]
```

O `postinstall` gerou o client sem banco e o gate fechou verde. **A1 segue
resolvido; a CI fica verde no primeiro push.**

---

## Veredito por alegação

| # | alegação do builder | veredito | prova |
| --- | --- | --- | --- |
| T6 | `clearSession()` só em `ApiError` 401 | **CONFIRMADA** | 8 testes + latch exercitado fora do Jest |
| T6 | latch cobre também o caminho de exceção | **CONFIRMADA** | `refreshInFlight` volta a `null` nos 4 cenários de `throw` |
| T6 | `handleBiometrics` ganhou `catch` | **CONFIRMADA** | `AuthScreen.tsx:111-119` |
| T6 | chamadores a jusante não viram rejeição solta | **CONFIRMADA** | mapa completo abaixo — o caminho está morto hoje |
| T6 | os testes não são tautologia sobre o mock | **CONFIRMADA** | asserção atravessa `secureStore.ts` real até a borda nativa |
| T7 | `fly.toml.example` tem `[env] TRUST_PROXY` | **CONFIRMADA** | `fly.toml.example:14-15` |
| T7 | o TOML é válido | **CONFIRMADA (sintaxe)** | parse limpo por parser TOML 1.0.0 |
| T7 | o teste prova a troca da chave do balde | **CONFIRMADA, mas insuficiente** | passa com o bypass aberto — ver A1-3 |
| T7 | **ligar `TRUST_PROXY` conserta o rate limit** | **REFUTADA** | **medido: limite contornado — ver A1-3** |
| T11 | `ARGON2_OPTIONS` de volta a m=65536,t=3,p=4 | **CONFIRMADA** | `hash.ts:19-24` |
| T11 | pico de 128,2 MiB com 2 slots | **CONFIRMADA** | medido: base 46,9 → pico 175,1 MiB |
| T11 | envelope de 256 MiB fecha | **CONFIRMADA** | 74,6 + 128,2 = **202,8 / 256** |
| T11 | rename sem resíduo | **CONFIRMADA** | `LEGACY_ARGON2_MEMORY_COST` → **0 ocorrências** |
| T11 | a fixture nova valida | **CONFIRMADA** | `verify` → `true` / senha errada → `false` |
| T11 | a fixture não empata com o perfil ativo | **CONFIRMADA** | `m=19456` vs `m=65536` |
| T11 | **o custo de CPU do perfil foi avaliado** | **REFUTADA** | 232 ms era em 20 núcleos; em 1 núcleo → ver M1-3 |
| T8 | `AGENTS.md` não afirma mais que o cofre cifra | **CONFIRMADA** | `AGENTS.md:65-69`, no futuro + ponteiro pro ADR |
| T9 | teto de 128 MiB documentado e testado | **CONFIRMADA** | `hash.ts:47-55`, `hash.test.ts:22-40` |
| T10 | escopo de exclusão do MIT é coerente | **CONFIRMADA** | 4 arquivos concordam e apontam pro `NOTICE.md` |
| T10 | **o texto MIT ficou literal** | **REFUTADA** | 70,8% de similaridade — ver B1-3 |

### Mapa de chamadores de `refreshSession` / `apiRequest` (pedido explicitamente)

O `throw` novo sobe por caminhos que antes recebiam `null`. Rastreei todos:

```
refreshSession  ← app/src/api/client.ts:105   (dentro de apiRequest, no 401)
                ← app/src/screens/auth/AuthScreen.tsx:104   (try/catch em :111)

apiRequest      ← app/src/api/auth.ts:5,9,14,18   — signup, login, guest, recover
                  TODOS com `auth: true`
```

`client.ts:96` — `if (options.auth) return rawRequest(...)` — sai antes do bloco
de renovação. Então **as quatro chamadas existentes nunca alcançam
`refreshSession`**, e o único caminho vivo é o `AuthScreen`, que o builder cobriu.
A preocupação com "outras telas não cobertas" é **improcedente hoje**: nenhuma
outra tela chama `apiRequest` sem `auth: true`. Não abro achado — não consigo
instanciar cenário de falha.

Fica o registro do que herda o risco: a **primeira** chamada `apiRequest` sem
`auth: true` que alguém adicionar passa a poder rejeitar com 429/5xx onde antes
recebia `null`. Em React Native, uma rejeição não tratada num handler de `onPress`
não derruba o app: o `Promise` rejeitado vira warning do `LogBox` em dev e é
**silencioso em release** — a tela simplesmente não reage ao toque. É o modo de
falha mais difícil de diagnosticar dos dois, e é o que o `catch` do `AuthScreen`
evita.

### Latch do `refreshInFlight` — os caminhos que o Jest não cobre

Reproduzi `client.ts:60-92` fielmente e ataquei as saídas por exceção:

```
=== 1. latch depois de um throw (429) ===
  1a chamada rejeitou com 429
  refreshInFlight depois do throw: null (livre)
  2a chamada (servidor ok): {"accessToken":"a-novo","refreshToken":"r-novo"}
  token preservado? sim, renovado

=== 2. latch depois de erro de rede (nao-ApiError) ===
  rejeitou com TypeError
  refreshInFlight: null (livre) | deletes no Keystore: 0

=== 3. duas chamadas concorrentes quando a renovacao REJEITA ===
   rejeitou:429 | rejeitou:429
  refreshInFlight depois: null (livre) | deletes: 0

=== 4. promise memoizada devolvida a dois lugares ===
  q1 tratado / q2 tratado
  (nenhum unhandledRejection)
```

Mover o early return para dentro do `try` resolveu o latch **em toda saída**,
inclusive a nova saída por `throw`. Sem promise preso, sem `clearSession()`
indevido, sem rejeição órfã. **T6 está correto.**

### Os testes de `client.test.ts` são tautologia sobre o mock?

Não. O mock substitui `expo-secure-store` — o **módulo nativo**, a única peça que
o Jest não consegue rodar. A asserção
`expect(await secureStore.getRefreshToken()).toBe('refresh-valido')` atravessa o
módulo de produção `app/src/state/secureStore.ts` (que é código real, não
mockado) até a borda nativa, e
`expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled()` asserta **na própria
borda** — é a forma mais forte disponível sem um aparelho. O que fica de fora é a
semântica real do Keychain/Keystore, que nenhum teste em Node alcança: registrado
em "não auditado", não descontado como defeito.

---

## Achados da terceira passada

### ALTO — A1-3 · `TRUST_PROXY = "true"` deixa o rate limit ser contornado de uma máquina só (REGRESSÃO de T7)

- **Onde:** `fly.toml.example:14-15`, `backend/src/app.ts:30`,
  `backend/src/plugins/rateLimit.ts:38-49` (registro sem `keyGenerator`)
- **Defeito:** `trustProxy: true` no Fastify significa *confiar em todos os
  proxies*, e nesse modo `req.ip` passa a ser a entrada **mais à esquerda** do
  `X-Forwarded-For`. Essa entrada é escrita pelo cliente. Como o
  `@fastify/rate-limit` chaveia o balde por `req.ip`, quem escolhe o balde passa
  a ser o atacante.
- **Cenário de falha (executado, HTTP real via `app.inject` sobre o
  `backend/dist/app.js` buildado):** um único host manda 8 logins girando o valor
  forjado, exatamente como a Fly entregaria o cabeçalho (o proxy **anexa** o IP
  observado ao que o cliente mandou):

  ```
  === TRUST_PROXY=true (o que o fly.toml.example agora liga) ===

    A) cliente honesto: so a Fly poe o XFF
      req.ip visto pelo servidor: ["198.51.100.77"]
      status das 8 tentativas : [401,401,401,401,401,429,429,429]   ← bloqueia

    B) atacante manda XFF fixo forjado; Fly ANEXA o IP real dele
      req.ip visto pelo servidor: ["203.0.113.5"]                   ← já é o valor forjado
      status das 8 tentativas : [401,401,401,401,401,429,429,429]

    C) atacante ROTACIONA o XFF forjado; Fly ANEXA o IP real dele
      req.ip: ["203.0.113.100","203.0.113.101", ... ,"203.0.113.107"]
      status das 8 tentativas : [401,401,401,401,401,401,401,401]
      bloqueou? >>> NAO — limite contornado <<<

  === TRUST_PROXY ausente (default false) — controle ===
    D) mesma rotacao, sem trustProxy
      req.ip: ["127.0.0.1"]
      status: [401,401,401,401,401,429,429,429]                     ← bloqueia
  ```

  O cenário B é a prova do mecanismo: com dois endereços na cadeia, o servidor
  adota o da esquerda — o forjado — e ignora o que o proxy escreveu.
- **Por que a premissa se sustenta:** a documentação da própria Fly descreve o
  `X-Forwarded-For` como *"a comma separated list of IP addresses including the
  address of the client that originated the request and the addresses of the
  proxy servers the request passed through"*, diz que *"the last address
  (rightmost) in this list will be a shared or dedicated IP address assigned to
  your app"* — isto é, **a Fly acrescenta à direita e preserva o que veio do
  cliente** — e avisa: *"This header must be treated with caution to avoid
  spoofing attempts."* Por isso a mesma página recomenda `Fly-Client-IP`.
- **O que isso custa:** o A2 da volta 1 (ALTO: força bruta, enchimento de banco
  por `/auth/guest`, DoS de memória no argon2) **não está corrigido no deploy que
  o repositório documenta**. Pior que o estado anterior a T7: com
  `TRUST_PROXY=false` o limite ao menos *funcionava* (balde único — problema de
  disponibilidade, achado A2-2); com `true` ele deixa de existir para quem sabe
  mandar um cabeçalho. Trocou-se um limite injusto por nenhum limite.
- **O teste não pega:** `backend/src/routes/auth.test.ts:88-113` manda um
  `x-forwarded-for` de **valor único**. Nesse formato, esquerda e direita são o
  mesmo endereço, e o teste passa verde com o bypass aberto. É a terceira vez no
  pipeline que um teste verde ancora uma garantia que o código não dá.
- **Correção sugerida (as três alternativas testadas fecham o buraco):**

  ```
  atacante unico rotacionando o XFF mais a esquerda, 8 tiros, limite 5/min

    trustProxy: true             -> [200 x8]                  >>> contornado <<<
    trustProxy: 1                -> [200,200,200,200,200,429,429,429]  BLOQUEIA
    trustProxy: 2                -> [200,200,200,200,200,429,429,429]  BLOQUEIA
    keyGenerator: Fly-Client-IP  -> [200,200,200,200,200,429,429,429]  BLOQUEIA
  ```

  A mais robusta é a última: `keyGenerator: (req) => req.headers['fly-client-ip']
  ?? req.ip` em `rateLimit.ts:39`, porque `Fly-Client-IP` é escrito pelo proxy e
  não é forjável pelo cliente — e não depende de acertar a contagem de saltos.
  Junto, trocar o teste de `auth.test.ts:88-113` por uma **cadeia** de dois
  endereços (`'203.0.113.X, 198.51.100.77'`), que é o que reprova hoje.
- **Tamanho do conserto:** uma linha em `rateLimit.ts`, uma linha no teste
  existente, um comentário em `fly.toml.example`. Menos de 15 minutos.

### MÉDIO — M1-3 · `p=4` numa máquina de 1 vCPU: 4 hashes/s no serviço inteiro (REGRESSÃO de D1)

- **Onde:** `backend/src/lib/hash.ts:19-24` contra `fly.toml.example:24-27`
  (`cpu_kind = "shared"`, `cpus = 1`), e `hash.ts:4-14` (o comentário que
  justifica o perfil)
- **Defeito:** D1 foi decidido com dados de **memória** — e essa parte confere,
  reconferi. A dimensão de **CPU** nunca foi medida no formato da máquina alvo.
  O `parallelism: 4` reserva 4 lanes por hash (8 com os 2 slots do gate) numa VM
  com 1 vCPU, onde não há paralelismo a explorar.
- **Evidência (medida, processo com afinidade fixada em 1 núcleo):**

  ```
  === 1 nucleo (affinity=1, simula shared-cpu-1x da Fly) ===
    m=65536,t=3,p=4 (ATIVO): 261.9 ms/op ->  3.8 ops/s por slot
    m=65536,t=3,p=1        : 253.0 ms/op ->  4.0 ops/s por slot   ← p=4 não compra nada
    m=19456,t=2,p=1        :  48.0 ms/op -> 20.8 ops/s por slot

  --- 2 concorrentes (o que o gate permite) ---
    m=65536,t=3,p=4 (ATIVO): 505 ms para os 2 ->  4.0 hash/s no servico
    m=19456,t=2,p=1        :  89 ms para os 2 -> 22.4 hash/s no servico
  ```

  Em 20 núcleos o mesmo perfil dá 95,8 ms/op — que é a ordem dos 232 ms que o
  builder reportou. Em 1 núcleo são 262 ms, e `p=4` fica **estatisticamente
  idêntico a `p=1`** (262 vs 253 ms): o custo de 4 threads é pago, o benefício não
  chega. Capacidade de login do serviço: **4 hash/s**.
- **Cenário de falha:** a fila do gate não tem teto nem prazo — medido na 2ª
  passada (20.000 tarefas enfileiradas, nenhuma descartada; tarefa abandonada pelo
  chamador executa assim mesmo). Com **A1-3 aberto**, uma máquina só manda 300
  logins/s girando o `X-Forwarded-For`; o gate admite 2 e enfileira o resto a
  4/s de vazão. Em 60 segundos são ~18.000 requisições na fila, cada uma segurando
  seu contexto, e a latência de login de quem é legítimo passa de horas. É o DoS
  que o A2 existia para impedir, agora com o custo unitário 5,6× maior.
  Mesmo **sem** o bypass, 48 IPs distintos dentro do limite de 5/min já saturam os
  240 hashes/min disponíveis.
- **O que NÃO estou dizendo:** o perfil `m=65536,t=3,p=4` está certo como custo de
  ataque offline, e D1 acertou ao notar que o gate — e não um `memoryCost` menor —
  é quem resolve o OOM. O defeito é o `p=4` especificamente, que na VM de 1 vCPU
  é custo puro, e o comentário de `hash.ts:4-14` que apresenta o envelope como
  fechado sem nunca ter olhado CPU.
- **Correção sugerida:** `parallelism: 1` (mantendo `m=65536, t=3`) — mesma
  memória, mesmo custo de ataque offline (m·t inalterado), sem as 8 threads. E
  acrescentar ao comentário o número que falta: 4 hash/s de vazão em 1 vCPU.
  Teto na fila do gate (503 acima de N) é o conserto estrutural, mas esse é o
  achado BAIXO que já estava aberto — não o reabro aqui.

### BAIXO — B1-3 · O adendo de escopo no `LICENSE` desliga a detecção automática de licença

- **Onde:** `LICENSE:23-37`
- **Defeito:** as linhas 1-21 são MIT literal, mas o arquivo continua com um
  bloco "Scope / Escopo" bilíngue de 15 linhas. O `licensee` — o detector que o
  GitHub usa — compara o arquivo inteiro normalizado com o texto canônico e exige
  `CONFIDENCE_THRESHOLD = 98`.
- **Evidência (reimplementação do método do `licensee`: normalizar, montar
  wordset, `overlap * 200 / (|a| + |b|)`):**

  ```
  LICENSE inteiro (como esta no repo)
    wordset arquivo=168 | wordset MIT=92 | overlap=92
    similaridade = 70.8%  (limiar do licensee = 98%)  -> NAO detecta como MIT

  so o bloco MIT (ate o ---)
    wordset arquivo=92 | wordset MIT=92 | overlap=92
    similaridade = 100.0% (limiar do licensee = 98%)  -> DETECTA como MIT
  ```
- **Cenário de falha:** o GitHub mostra "View license" em vez de "MIT license" na
  barra lateral, o campo `license` da API fica nulo e o repositório não aparece em
  busca filtrada por licença. Num repo de portfólio, o rótulo é justamente o que
  comunica "pode usar" sem ninguém abrir arquivo.
- **Por que é BAIXO e não mais:** o repo vai **privado** (D2), então nada disso
  aparece agora; e o adendo está juridicamente correto — o problema é só onde ele
  mora. Vira visível no dia da troca para público, que é o mesmo dia em que o
  M2-2 importa.
- **Correção sugerida:** deixar o `LICENSE` com MIT puro e mover o parágrafo de
  escopo — que já está **duplicado em três lugares**: `README.md:149-153`,
  `docs/design-handoff/NOTICE.md` inteiro e `docs/design-handoff/README.md:3-7`.
  Nada se perde de conteúdo; o `NOTICE.md` continua sendo a fonte.

---

## Segurança de publicação — terceira e última varredura

Os 108 arquivos que entrariam nos 5 PRs, incluindo todo untracked, a fixture de
hash nova e o `.sql` da migration.

| família de padrão | resultado |
| --- | --- |
| AWS (`AKIA`/`ASIA`), GitHub (`ghp_`/`github_pat_`), OpenAI (`sk-`), Anthropic (`sk-ant-`), Slack (`xox*`), Google (`AIza`), npm (`npm_`), GitLab (`glpat-`), SendGrid, chave privada PEM, JWT (`eyJhbGciOi`), `FLY_API_TOKEN` | **nenhum match** |
| connection string com credencial | 3 matches, **todos documentais** — `backend/.env.example:2` (`postgresql://user:password@host/dbname`) e 2 citações dele no próprio `05-verdict.md` |
| atribuição `secret/token/password/api_key = "..."` com 12+ chars | **nenhum match** |
| `INSERT`/`COPY`/`UPDATE`/`GRANT`/`CREATE USER` na migration | **zero** — as 152 linhas de `20260808015431_init/migration.sql` são DDL puro |
| hash de senha versionado | 1 — a fixture de `hash.test.ts:58` |

**A fixture nova de hash foi verificada, não presumida:**

```
--- fixture nova de hash.test.ts (m=19456,p=1,t=2) ---
  senha certa  -> true       (senha-de-fixture-1234)
  senha errada -> false
```

É um hash argon2id de uma senha de fixture declarada no próprio comentário do
teste — não é credencial de conta nenhuma, e um hash argon2id não é reversível.
Segue o mesmo padrão da fixture anterior. **Sem objeção.**

**E-mails no tree exportável** (fora do `package-lock.json`): `a@b.com`,
`algo@algo.tld`, `alvo@example.com`, `alvo@gmail.com`, `nome@email.com`,
`user@email.com`, `pedro.demo@planob.app` — fixtures e exemplos de validação;
`i@izs.me` — texto de deprecação do npm; `contato@anapaulafiorio.com.br` —
contato comercial público da autora do design system, agora com o `NOTICE.md`
que faltava. Nenhum é PII de usuário real.

**Identidade pessoal:** só o intencional — `LICENSE:3` (copyright) e
`README.md:58` (URL do clone). Nenhum caminho `C:\Users\...` de máquina.

**CRITICOS: 0.** Criar o repositório privado não expõe nada. Terceira
confirmação por execução.

### Nota de escopo para o `ship` (não é achado)

`docs/pipeline/` — `05-verdict.md`, `decisoes-ship.md`, `state.json` — está no
export de 108 arquivos, mas **D3 não aloca esse diretório a nenhum dos 5 PRs**.
Decida conscientemente: esses três arquivos são o mapa completo dos achados de
segurança ainda abertos (M2 enumeração, M3 logout sem revogação, M4 sem detecção
de reuso, B3 secret sem validação de força). Em repositório privado, tudo bem —
é memória do projeto. Se um dia virar público sem os achados fechados, é roteiro
pronto para quem quiser atacar.

---

## Regressões nos achados fora de escopo

Confirmado por leitura direta que **nenhum piorou**:

| achado | verificação | estado |
| --- | --- | --- |
| M2 signup vaza `email_taken` | `auth.ts:47` idem | inalterado |
| M3 logout não revoga | `grep -c "auth/logout"` → `0` nos dois arquivos | inalterado |
| M4 rotação sem detecção de reuso | `auth.ts:102` idem | inalterado |
| M5 Dockerfile sem `USER`, devDeps, sem `.dockerignore` | `grep -cE "^USER"` → `0`; sem `--omit=dev`; sem `.dockerignore` | inalterado |
| M7 `priorityRisks` por índice | `scoring.ts:75-80` idem, mapeamento ainda correto | inalterado |
| B1 `JSON.parse` sem guarda | `client.ts:35` idem | inalterado |
| B3 `JWT_ACCESS_SECRET` sem força | `jwt.ts:11-12` idem | inalterado |
| B4 PII no AsyncStorage | `store.ts:67` — `user` ainda no `partialize` | inalterado |
| fila do gate sem teto/timeout | `concurrencyGate.ts:19,30,38` idem | inalterado — mas **mais exposto** por M1-3 |
| balde in-memory zera em cold start | `rateLimit.ts` sem `store`/`redis` | inalterado |
| `README.md:34` lista "recuperação" | idem | inalterado |

O Dockerfile mudou (T-A1), mas só o estágio `deps`: `COPY backend/prisma` e
`backend/prisma.config.ts` antes do `npm ci`, para alimentar o `postinstall`.
Nenhuma linha nova no estágio `runtime` — M5 segue exatamente como estava.

---

## Limpo em (terceira passada)

Dimensões que ataquei e onde **não** achei defeito:

- **Latch do `refreshSession`.** Livre em todos os caminhos de saída, incluindo
  os dois novos por `throw`. Sem promise preso, sem rejeição órfã.
- **Semântica do `catch` de 401.** `clearSession()` só onde a credencial de fato
  morreu; 429, 500 e falha de rede preservam o Keystore. Provado por 8 testes e
  reproduzido fora do Jest.
- **Mapa de chamadores.** Nenhuma rejeição não tratada alcançável hoje.
- **Pico de memória do argon2.** 128,2 MiB medidos com 2 slots — exatamente o que
  `HASH_PEAK_MEMORY_MIB` afirma. O envelope de 256 MiB fecha em 202,8 MiB.
- **Rename `MAX_STORED_MEMORY_COST`.** Zero ocorrência residual do nome antigo;
  as 6 referências ao novo são coerentes.
- **Fixture de hash.** Valida de verdade, e o assert
  `not.toContain('$m=65536,')` impede que ela volte a empatar com o perfil ativo.
- **Sintaxe do `fly.toml.example`.** Parse limpo por parser TOML 1.0.0; a
  estrutura (`[build]`, `[env]`, `[http_service]`, `[[vm]]`) casa com o schema
  documentado da Fly, e `TRUST_PROXY = "true"` é string, como `[env]` exige.
- **Coerência do escopo de licença.** `LICENSE`, `NOTICE.md`,
  `docs/design-handoff/README.md:3-7` e `README.md:136,149-153` dizem a mesma
  coisa e apontam para o mesmo lugar. A redação está clara e sem promessa falsa.
- **`AGENTS.md`.** M3-2 fechado: `AGENTS.md:65-69` agora diz "**vai usar**", cita
  o ADR-0003 como pendente e proíbe escrever em `VaultItem` contando com cifra.
- **Higiene do que vira PR.** 108 arquivos, nenhum `.env`, `generated/`,
  `node_modules` ou `dist`.
- **CI em clone limpo.** `npm ci` + `npm run verify` verdes sem nenhuma variável
  de ambiente de aplicação.

---

## Não auditado (terceira passada)

Marcado porque **não aprovo por omissão**:

- **`docker build`.** Engine do Docker Desktop parado pela terceira passada
  seguida. A reordenação do Dockerfile continua **INDETERMINADA** por execução —
  o raciocínio é sólido e o `postinstall` foi provado fora do container, mas
  raciocínio não é execução.
- **`flyctl config validate`.** Exige login na Fly. Validei a **sintaxe** TOML com
  parser real; a validação **semântica** do schema pelo `flyctl` não foi feita.
- **Comportamento do proxy da Fly com `X-Forwarded-For`, contra infraestrutura
  real.** A cadeia forjada foi reproduzida localmente e a documentação da Fly
  sustenta a premissa (anexa à direita, avisa sobre spoofing, recomenda
  `Fly-Client-IP`). Não mandei request por um app Fly de verdade. Registro a
  ressalva honestamente — mas ela não muda o veredito: `trustProxy: true`
  significa "confiar em todos os proxies" e é a configuração errada para o caso
  de exatamente um proxy conhecido, independente do que a Fly faça com o header.
- **A VM `shared-cpu-1x` de verdade.** Os 262 ms/op são de um núcleo de CPU
  desktop com afinidade fixada, não de um vCPU compartilhado da Fly — que é mais
  lento e sujeito a *steal time*. Os 4 hash/s são o **melhor caso**.
- **Backend contra Postgres real.** Os testes de rota usam `prismaStub` com
  `findUnique` sempre `null`, então o login nunca chega ao argon2 neles.
- **App em dispositivo.** O comportamento do `AuthScreen` foi rastreado no código
  e reproduzido em harness, não num aparelho.
- **`npm audit`.** 19 avisos (12 de alta severidade), todos na toolchain
  Expo/Metro, conforme já registrado. Fora do escopo desta passada.

---

## Libera os PRs?

**NÃO.**

Não é por segurança de publicação: essa parte passou pela terceira vez. **0
críticos, 0 segredos, 108 arquivos varridos.** O `gh repo create --private` pode
acontecer sem expor nada, e a CI fica verde no primeiro push — reproduzi.

O bloqueio é **A1-3**, e ele é de uma classe pior que os dois ALTOs da passada
anterior. Aqueles eram efeitos colaterais de uma correção certa. Este é uma
correção que **desfaz o controle que ela deveria proteger**: o
`fly.toml.example` liga `TRUST_PROXY=true`, e com esse valor o rate limit inteiro
— que foi a resposta ao achado A2 — deixa de valer para qualquer um que saiba
mandar um cabeçalho HTTP. Medi: 8 tentativas de login de uma máquina só, zero
`429`. E o teste que deveria cobrir isso passa verde, porque manda um
`X-Forwarded-For` de valor único, formato em que o bug não aparece.

Dar `PASS` aqui publicaria, num repositório de Cyber Security, um artefato de
deploy cujo efeito líquido é anular a própria mitigação que o repositório
documenta ter aplicado. É exatamente o tipo de coisa que esta fase existe para
não deixar passar.

**O que falta, e o tamanho:**

1. **A1-3 — obrigatório.** `keyGenerator: (req) => req.headers['fly-client-ip']
   ?? req.ip` em `backend/src/plugins/rateLimit.ts:39`, e trocar o
   `x-forwarded-for` de `auth.test.ts:98` por uma cadeia de dois endereços — o
   teste que reprova hoje. **~15 minutos, 2 arquivos, 2 linhas.**
2. **M1-3 — recomendado no mesmo passe.** `parallelism: 1` em `hash.ts:23`
   (mantendo `m=65536, t=3`: mesma memória, mesmo custo de ataque offline) e o
   número de vazão no comentário. **~5 minutos, 1 arquivo.** Se o Pedro preferir
   manter `p=4`, é decisão dele — mas agora com o dado de CPU na mesa, que é o
   que faltava em D1.
3. **B1-3 — pode ir depois.** Só importa antes de o repo virar público. Mover o
   bloco `LICENSE:23-37` (já duplicado em 3 lugares) devolve a detecção de MIT.

Feitos 1 e 2, não vejo o que reprove: as outras 18 alegações da volta 2 se
confirmaram por execução, as 36 verificações passam, o envelope de memória fecha
e a varredura de publicação está limpa.

**Observação de processo.** Três passadas, três vezes o mesmo ponto cego, e vale
nomeá-lo porque a quarta pode evitá-lo: em toda volta o builder consertou o
achado como enunciado e não perguntou *o que a correção encontra do outro lado*.
Volta 1: o `429` novo encontrou um `catch` que apagava credencial. Volta 2: o
`TRUST_PROXY` novo encontrou um `keyGenerator` que confia no cliente. Em ambos o
teste escrito junto passou — porque testou a mudança, não a interface entre a
mudança e o que já existia. A pergunta que faltou é sempre a mesma: *quem mais lê
esse valor, e o que ele assume sobre quem escreve?*

**PRÓXIMO:** `pipe-builder` (A1-3 obrigatório, M1-3 recomendado) → re-verify curto
só nesses dois pontos → `pipe-scribe`. Volta 3 excede as duas voltas automáticas:
**escala para o Pedro decidir** se autoriza a volta extra ou se prefere publicar
com A1-3 registrado como issue conhecida — o que eu não recomendo, porque o
`fly.toml.example` é copiado no dia do deploy e ninguém relê comentário de arquivo
de exemplo.

---
---

# 05 — Verdict · QUARTA PASSADA (GATE FINAL PRÉ-`ship`)

- Data: 2026-08-14
- Escopo: **só o que mudou desde o 3º veredito** (T12/T13/T14, volta 3 autorizada
  pelo Pedro acima do limite de 2 automáticas) + varredura de publicação final
- Peso: `PASS` aqui cria o repositório e abre os 5 PRs.

```
GATE: PASS
CRITICOS:   0
ALTOS:      0
MEDIOS:     1
BAIXOS:     0
REGRESSOES: 0
```

O ALTO da 3ª passada está **fechado por medição**: a forja de `X-Forwarded-For`
não move mais o balde do rate limit, em nenhuma das configurações que testei.
Sobra um MÉDIO que **não bloqueia o push**: a contagem de saltos escolhida
depende de uma propriedade do proxy da Fly que a documentação oficial da Fly e a
comunidade da Fly descrevem de forma contraditória, e o repositório afirma uma
das duas como fato. Se a versão da doc oficial estiver certa, o efeito não é
brecha de segurança — é o balde único do A2-2 voltando, num ambiente que ainda
não existe (deploy é o marco 8).

---

## Evidência executada (quarta passada)

| passo | comando | resultado |
| --- | --- | --- |
| verify na raiz | `npm run verify` | **ok** — exit 0; app 20 + backend 16 = **36** |
| **CI reproduzida** | export de 108 arquivos → `npm ci` → `npm run verify` | **ok** — exit 0, 20 + 16 |
| forja de XFF | 7 cenários contra o `dist` atual | **forja fechada em todos** |
| cadeia real da Fly | hop 1 vs hop 2, 3 cenários | **ver M1-4** |
| fix robusto | 6 células (2 modelos × 3 topologias) | `Fly-Client-IP` fecha todas |
| teste novo RED/GREEN | `vitest` contra 3 versões do `app.ts` | **prova o que promete** |
| pico argon2 com `p=1` | 2 verifies concorrentes | **128,1 MiB** |
| TOML do deploy | reparse com `smol-toml` | **ok** |
| similaridade do LICENSE | reimplementação do `licensee` | **100,0%** |
| varredura de publicação | 108 arquivos, 6 famílias | **0 segredos** |
| `docker build` | `docker version` | **NÃO RODOU** — 4ª vez |

### `npm run verify` — saída literal

```
> app@1.0.0 test / jest
PASS src/api/__tests__/client.test.ts
PASS src/lib/__tests__/scoring.test.ts
Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
Time:        2.558 s

> backend@1.0.0 test / vitest run
 Test Files  4 passed (4)
      Tests  16 passed (16)
   Duration  1.64s (transform 383ms, setup 0ms, import 1.14s, tests 1.47s)

[exited with code 0]
```

**36 testes.** O backend subiu de 871 ms para **1,47 s de `tests`** — coerente
com a alegação do builder e explicado pelo T13: com `p=1` o argon2 deixa de usar
4 lanes nesta máquina de 20 núcleos, então cada hash de teste custa mais tempo de
parede aqui. Não é regressão; é o efeito esperado do parâmetro.

### CI reproduzida (108 arquivos, sem `.env`)

```
--- arquivos copiados: 108
--- .env / generated / node_modules / dist no export:
.../ci4/app/.env.example
.../ci4/backend/.env.example
(fim)

added 1301 packages, and audited 1304 packages
=== ls generated ===
browser.ts  client.ts  commonInputTypes.ts  enums.ts  internal  models  models.ts
=== VERIFY ===
Tests:       20 passed, 20 total     (app)
 Test Files  4 passed (4)   Tests  16 passed (16)   (backend)
[exited with code 0]
```

### T6 / T8 / T9 / T10 não foram tocados — conferido no diff, não presumido

Diff byte a byte contra o **snapshot que eu mesmo exportei na 3ª passada**:

```
--- T6 ---
  IDENTICO: app/src/api/client.ts
  IDENTICO: app/src/screens/auth/AuthScreen.tsx
  IDENTICO: app/src/api/__tests__/client.test.ts
--- T8 ---
  IDENTICO: AGENTS.md
--- T10 ---
  IDENTICO: docs/design-handoff/NOTICE.md
  IDENTICO: docs/design-handoff/README.md
  IDENTICO: README.md
```

Mudaram desde a 3ª passada, e só: `LICENSE`, `backend/src/app.ts`,
`backend/src/lib/hash.ts`, `backend/src/lib/hash.test.ts`,
`backend/src/routes/auth.test.ts`, `fly.toml.example`, `backend/.env.example`
(duas linhas de comentário sobre o salto único) e `docs/pipeline/*`. Nada fora do
escopo T12/T13/T14 foi mexido.

---

## Veredito por alegação

| # | alegação | veredito | prova |
| --- | --- | --- | --- |
| T12 | `trustProxy: 1` fecha a forja de XFF | **CONFIRMADA** | 7 cenários, incluindo o C que reprovou; forja fechada em 6/6 células |
| T12 | o `??` do `keyGenerator` falharia aberto | **CONFIRMADA como crítica, SUPERADA na prática** | era válida contra `trustProxy: true`; com `1` o fallback deixa de ser forjável — ver M1-4 |
| T12 | o teste novo prende a propriedade certa | **CONFIRMADA** | RED literal reproduzido; e reprova também o caso degenerado |
| T12 | o teste garante que IPs distintos não dividem balde | **CONFIRMADA** | com `trustProxy: false` o teste quebra em `expected 429 to be 401` |
| T12 | `app.inject()` com hop 1 adota a entrada mais à direita | **CONFIRMADA** | `req.ip` = mais à direita mesmo com 4 forjados empilhados |
| T12 | **`1` é a contagem certa para a Fly** | **INDETERMINADA** | doc oficial e comunidade da Fly se contradizem — **M1-4** |
| T12 | com CDN na frente degrada para o lado seguro | **CONFIRMADA** | agrupa demais (perde disponibilidade), não vira forjável |
| T13 | `parallelism: 1`, `m` e `t` intactos | **CONFIRMADA** | diff: `memoryCost: 65536`, `timeCost: 3`, `parallelism: 1` |
| T13 | o pico de memória não mudou com `p=1` | **CONFIRMADA** | medido **128,1 MiB** (p=4 media 128,1 — idênticos) |
| T13 | o envelope `BOOT 75 + PEAK 128 ≤ 256` continua verdadeiro | **CONFIRMADA** | 203 ≤ 256; medido 74,6 + 128,1 = **202,7** |
| T13 | o hash gravado passa a ser `$m=65536,p=1,t=3$` | **CONFIRMADA** | formato conferido fora do teste |
| T13 | a fixture ainda valida e o discriminante é `m` | **CONFIRMADA** | `true`/`false` corretos; `m=19456` ≠ `m=65536` |
| T14 | `LICENSE` virou MIT literal, 21 linhas | **CONFIRMADA** | `wc -l` = 21 |
| T14 | similaridade voltou a 100% | **CONFIRMADA** | 70,8% → **100,0%**, acima do limiar 98 |
| T14 | truncar no `---` não teria funcionado | **CONFIRMADA** | o `licensee` normaliza o arquivo inteiro; ele está certo e eu estava errado |
| T14 | T10 não foi desfeito | **CONFIRMADA** | exclusão de pé nos 3 arquivos, byte a byte idênticos |

### O ALTO da 3ª passada está fechado — a bateria que o produziu, refeita

Mesmo script, mesmo `dist`, agora com `trustProxy: 1`:

```
=== TRUST_PROXY=true  ->  app.ts:40 traduz para trustProxy: 1 ===

  A) cliente honesto                          req.ip: ["198.51.100.77"]  [401×5,429,429,429]  BLOQUEIA
  B) XFF fixo forjado + real a direita        req.ip: ["198.51.100.77"]  [401×5,429,429,429]  BLOQUEIA
  C) ROTACIONA o forjado  ← reprovou na 3a    req.ip: ["198.51.100.77"]  [401×5,429,429,429]  BLOQUEIA
  C2) empilha 3 forjados de uma vez           req.ip: ["198.51.100.77"]  [401×5,429,429,429]  BLOQUEIA
```

Na 3ª passada o cenário C dava `[401×8]` e `req.ip` girava com o cabeçalho. O
atacante não escolhe mais o próprio balde: `req.ip` fica cravado no que o proxy
escreveu, mesmo com três endereços forjados empilhados à esquerda.
**A brecha de segurança acabou.**

### O teste novo prova o que promete — RED reproduzido, e não passa por acidente

Rodei o teste contra três versões do `app.ts`, numa cópia minha fora do repo:

```
############ GREEN: codigo como esta no repo (trustProxy: 1) ############
 Test Files  1 passed (1)      Tests  4 passed (4)

############ RED 1: trustProxy: true  (o defeito da 3a passada) ############
 × com TRUST_PROXY, chaveia pelo IP que o proxy observou, não pelo que o cliente escreve
 AssertionError: expected [ 401, 401, 401, 401, 401, 401 ] to deeply equal [ 401, 401, 401, 401, 401, 429 ]
 Tests  1 failed | 3 passed (4)

############ RED 2: trustProxy: false ############
 AssertionError: expected 429 to be 401
 Tests  1 failed | 3 passed (4)
```

RED 1 é **literalmente** a saída que o builder relatou. RED 2 é o que me
interessava mais: prova que a asserção do vizinho (`198.51.100.78` → 401) impede
que o teste passe por acidente com o rate limit num balde único. **Este teste é
carregador de peso nos dois sentidos.** É a primeira vez em quatro passadas que
um teste novo resiste a esse ataque.

---

## Achado da quarta passada

### MÉDIO — M1-4 · A contagem de saltos aposta numa propriedade da Fly que a própria Fly documenta de dois jeitos

- **Onde:** `backend/src/app.ts:31-40`, `backend/src/routes/auth.test.ts:82-91`,
  `backend/.env.example:14-15`, `fly.toml.example:12-14`
- **Defeito:** o código, o teste e três comentários afirmam **como fato** que o
  proxy anexa à direita o endereço que ele observou, e que por isso 1 salto
  entrega o IP do cliente. Essa premissa não está verificada, e a documentação da
  Fly diz o contrário dela.
- **A contradição, nas duas fontes:**

  A doc oficial de request headers da Fly descreve o `X-Forwarded-For` como
  *"a comma separated list of IP addresses including the address of the client
  that originated the request and the addresses of the proxy servers the request
  passed through"*, dá o exemplo concreto **`77.97.0.98, 77.83.142.33`** e afirma:
  *"On the Fly.io platform, the last address (rightmost) in this list will be a
  shared or dedicated IP address assigned to your app."* Ou seja: **o mais à
  direita é o IP do próprio app, constante.** Uma resposta de staff na comunidade
  repete: *"you need to remove the rightmost element as that is the IP address of
  your app"*, e há relatos de `trust proxy = 2` funcionando no Express na Fly.

  Contra isso, uma thread da comunidade mostra a observação oposta —
  `X-Forwarded-For: 1.2.3.4, (my personal IP address)` — em que o mais à direita é
  o IP real do cliente, sem IP de app nenhum. E o issue `superfly/docs#1554`
  **disputa** justamente esse trecho da documentação.

  Não consigo resolver isso daqui: exigiria um app na Fly de verdade.
- **Cenário de falha (medido, se a doc oficial estiver certa):** cadeia honesta
  `<cliente>, <IP do app>`, oito pessoas **diferentes** tentando login, nenhuma
  errou nada, limite 5/min:

  ```
  ### MODELO DOC (rightmost = IP do app)
    trustProxy: 1   req.ip: ["66.241.125.9"]     status: [200,200,200,200,200,429,429,429]
    trustProxy: 2   req.ip: ["77.97.0.10", ... , "77.97.0.17"]   status: [200×8]

  ### CENARIO 3 — dois clientes reais distintos dividem balde?
    trustProxy: 1   req.ip: ["66.241.125.9"]                     [200×5, 429]   ← dividem
    trustProxy: 2   req.ip: ["77.97.0.98","191.180.55.4"]        [200×6]        ← não dividem
  ```

  Com 1 salto sob esse modelo, `req.ip` vira o IP anycast do app — **constante
  para todo mundo**. A 6ª pessoa a tentar login no serviço inteiro naquele minuto
  leva 429; `/auth/guest` fica em 5 contas por hora para a base toda. É
  exatamente o achado **A2-2** da 2ª passada, voltando por outra porta.
- **Por que MÉDIO e não ALTO:** a diferença material em relação à 3ª passada é que
  **não há brecha de segurança em nenhum dos dois modelos**. Verifiquei as seis
  combinações; a forja é bloqueada em todas:

  ```
                                  8 pessoas honestas    1 atacante forjando
  MODELO DOC   trustProxy:1 puro   >>> 429 na 6a <<<     429 (bloqueia)
  MODELO DOC   +Fly-Client-IP      todas passaram        429 (bloqueia)
  MODELO COMM  trustProxy:1 puro   todas passaram        429 (bloqueia)
  MODELO COMM  +Fly-Client-IP      todas passaram        429 (bloqueia)
  SEM Fly      trustProxy:1 puro   todas passaram        429 (bloqueia)
  SEM Fly      +Fly-Client-IP      todas passaram        429 (bloqueia)
  ```

  Uma única célula falha, e o modo de falha é **disponibilidade**, não exposição.
  Sobre um ambiente que ainda não existe (`README.md:25` — "Hospedagem
  **prevista**"; deploy é o marco 8), detectável no primeiro minuto depois do
  `fly deploy` e corrigível numa linha. Isso não justifica travar 5 PRs de código.
- **Correção sugerida (uma linha, e fecha as seis células):** manter
  `trustProxy: 1` **e** acrescentar em `rateLimit.ts:39`
  `keyGenerator: (req) => req.headers['fly-client-ip'] ?? req.ip`.

  A objeção do builder ao `keyGenerator` estava **certa** contra o código de
  então: com `trustProxy: true`, o fallback `?? req.ip` caía na entrada forjável e
  falhava aberto fora da Fly. Só que ele consertou o `trustProxy` no mesmo passe —
  e com `1` o fallback deixa de ser forjável. As duas correções juntas são
  estritamente melhores que qualquer uma sozinha, e o argumento que rejeitou a
  minha deixou de valer no momento em que ele aplicou a dele.

  Enquanto isso não existe, o mínimo é **honestidade**: trocar o indicativo dos
  comentários (`app.ts:35-36`, `auth.test.ts:82-86`, `.env.example:14-15`) por uma
  nota de premissa não verificada, com o ponteiro para conferir `Fly-Client-IP` vs
  `req.ip` no primeiro deploy. É o mesmo padrão de honestidade que o ADR-0003 e o
  README já adotaram neste repositório.
- **Tamanho:** 1 linha para a correção robusta, ~4 linhas de comentário para a
  honestidade. **Ambas cabem num PR de follow-up — não precisam preceder o push.**

---

## Segurança de publicação — quarta e última varredura

Os 108 arquivos que entram nos 5 PRs.

| família | resultado |
| --- | --- |
| AWS, GitHub PAT, OpenAI, Anthropic, Slack, Google, npm, GitLab, SendGrid, PEM, JWT, `FLY_API_TOKEN`, `fo1_` (token da Fly) | **nenhum match** — o único hit é a própria tabela desta lista dentro do `05-verdict.md` |
| connection string com credencial | `backend/.env.example:2` (`postgresql://user:password@host/dbname`) + citações dele no `05-verdict.md` — **documentais** |
| atribuição `secret/token/password/key = "…"` | **nenhum** |
| migration SQL | **zero** `INSERT`/`COPY`/`UPDATE`/`GRANT`/`CREATE USER` — 152 linhas de DDL |
| hash de senha versionado | 1 — a fixture de `hash.test.ts:60`, inalterada e já auditada |
| caminho de máquina / identidade | só `LICENSE:3` (copyright) e `README.md:58` (URL do clone) |

**CRITICOS: 0.** Quarta confirmação por execução. Criar o repositório privado e
abrir os 5 PRs não expõe nada.

Permanece a nota de escopo da 3ª passada, não como achado: `docs/pipeline/`
(verdict, decisões, `state.json`) está no export mas não é alocado a nenhum dos 5
PRs pelo D3. Em repositório privado é memória do projeto; se um dia virar público
com achados de auth ainda abertos, é roteiro pronto. Decisão do `pipe-scribe`.

---

## Regressões nos achados fora de escopo

Nenhum piorou. Conferido por contagem direta:

```
M2 email_taken       : 1   (inalterado)
M3 rota logout       : 0   nos dois arquivos (inalterado)
M4 reuse detection   : 1   (inalterado)
M5 USER no Dockerfile: 0   (inalterado)
M7 indices posicionais: 1  (inalterado)
B1 JSON.parse sem guarda: 1 (inalterado)
B3 forca do secret   : 1   (inalterado)
B4 user no partialize: 1   (inalterado)
fila do gate sem teto: 1   (inalterado)
README.md:34         : "…refresh, recuperação)."  (inalterado)
```

O achado M1-3 da 3ª passada (`p=4` em 1 vCPU) está **fechado** por T13. A vazão
continua baixa — ~4 hash/s no serviço — mas agora é consequência assumida e
documentada em `hash.ts:4-32`, com o número na cara de quem for mexer, em vez de
efeito colateral não medido.

---

## Limpo em (quarta passada)

- **Forja de `X-Forwarded-For`.** Fechada em 6/6 combinações de modelo de cadeia
  e topologia. O ALTO da 3ª passada não existe mais.
- **Qualidade do teste novo.** RED literal reproduzido contra o defeito antigo, e
  RED também contra o caso degenerado. Não passa por acidente.
- **Degradação com CDN.** Agrupa demais (perde disponibilidade); não vira
  forjável. A afirmação do builder confere.
- **Envelope de memória com `p=1`.** 128,1 MiB — `parallelism` não altera o total
  alocado, só o layout em lanes. Os asserts de `hash.test.ts:28-31` continuam
  verdadeiros.
- **Compatibilidade de hash legado.** A fixture de `m=19456,t=2,p=1` valida, e o
  discriminante contra `ARGON2_OPTIONS` é `m` — que `p=1` não toca.
- **Detecção de licença.** 100,0% contra o limiar de 98. E o builder está certo
  sobre a minha sugestão da 3ª passada: o `licensee` normaliza o arquivo inteiro
  e não trunca no `---`; mover o bloco para depois do separador não teria
  resolvido. **Registro o erro meu.**
- **Escopo de licença preservado.** `NOTICE.md`, `docs/design-handoff/README.md`
  e `README.md:136,151-153` byte a byte idênticos ao que aprovei na 3ª passada.
- **Sintaxe do `fly.toml.example`** depois das 3 linhas novas de comentário —
  reparse limpo, `[env] TRUST_PROXY = "true"` intacto.
- **Escopo da volta 3.** Só T12/T13/T14 foram tocados; T6/T8/T10 idênticos.

---

## Não auditado (quarta passada)

- **A cadeia real do proxy da Fly.** É o M1-4. Exigiria um app na Fly.
- **`Fly-Client-IP` sobrescreve valor enviado pelo cliente?** A doc diz que é
  *"the IP address of the client from the perspective of Fly Proxy"*, o que
  implica sobrescrita, mas não afirma explicitamente. A ressalva do builder é
  legítima e continua aberta. Não muda a recomendação: mesmo se a Fly apenas
  definisse o header quando ausente, o par `trustProxy: 1` + fallback `req.ip`
  não fica pior do que hoje.
- **`docker build`.** Engine do Docker Desktop parado pela 4ª passada seguida. A
  reordenação do Dockerfile continua **INDETERMINADA por execução**.
- **`flyctl config validate`.** Exige login. Só a sintaxe TOML foi validada.
- **VM `shared-cpu-1x` real.** Os números de CPU da 3ª passada são meus, de um
  núcleo de desktop com afinidade fixada — melhor caso, não a VM da Fly.
- **Backend contra Postgres real.** `prismaStub` com `findUnique` sempre `null`.
- **App em dispositivo.**
- **`npm audit`.** 19 avisos (12 altos) na toolchain Expo/Metro, inalterado.

---

## Libera os PRs?

**SIM.**

Os três consertos da volta 3 fazem o que dizem, e verifiquei cada um por
execução, não por leitura:

- **T12** fechou a brecha que me fez reprovar na 3ª passada. Refiz a bateria que
  a produziu e a forja não passa mais em nenhum dos sete cenários — nem
  empilhando três endereços falsos. E o teste que acompanha a correção é o
  primeiro em quatro passadas que resiste ao meu ataque padrão: ele fica vermelho
  contra o defeito antigo **e** contra o caso degenerado.
- **T13** manteve `m` e `t`, e o pico segue em 128,1 MiB — medi de novo porque
  `parallelism` podia ter mexido no layout, e não mexeu. O envelope fecha em
  202,7 dos 256 MiB.
- **T14** devolveu a detecção de MIT (70,8% → 100,0%) sem desfazer a exclusão do
  design de terceiro, que conferi byte a byte.

Os 36 testes passam na raiz e passam de novo em clone limpo, sem `.env` e sem
variável de ambiente nenhuma. A varredura de publicação está limpa pela quarta
vez: **0 críticos, 0 segredos, 108 arquivos**.

**O que fica aberto e por que não bloqueia.** O M1-4 é real e quero que ele seja
lido, não arquivado: a contagem de 1 salto pode estar errada para a Fly, e se
estiver, o balde vira único para a base inteira. Mas nenhum dos dois modelos
possíveis abre brecha de segurança — testei as seis células —, o alvo do defeito
é um deploy que ainda não existe, o sintoma aparece no primeiro minuto depois do
`fly deploy`, e o conserto é uma linha. Reprovar 5 PRs de código por uma
configuração de um ambiente futuro seria trocar rigor por teatro.

**Duas correções que eu queria ver antes do `fly deploy`** — não antes do push:

1. `rateLimit.ts:39` — `keyGenerator: (req) => req.headers['fly-client-ip'] ?? req.ip`.
   Uma linha, fecha as seis células. A objeção do builder à minha sugestão
   original era correta contra o código antigo e deixou de valer quando ele mudou
   `trustProxy` para `1` no mesmo passe.
2. Trocar o indicativo por premissa nos comentários de `app.ts:35-36`,
   `auth.test.ts:82-86` e `.env.example:14-15`. O repositório foi honesto sobre o
   ADR-0003 e sobre o README; deve ser honesto sobre isto também.

**Uma correção de rota minha.** Na 3ª passada eu disse que bastava mover o bloco
de escopo do `LICENSE` para depois do `---`. Estava errado: o `licensee`
normaliza o arquivo inteiro e ignora separadores. O builder verificou e removeu o
bloco. Registro porque o veredito anterior está neste mesmo arquivo e alguém vai
lê-lo.

**Sobre o processo, já que apontei o padrão três vezes.** Ele quebrou aqui. Nas
voltas 1 e 2 o builder consertou o achado como enunciado e não perguntou o que a
correção encontrava do outro lado. Nesta volta ele **recusou a minha sugestão com
um argumento técnico correto** — o `??` falhando aberto fora da Fly —, escolheu
outra das alternativas que eu havia medido, e escreveu o teste que pega o defeito
antigo em vez do teste que passa. Foi a primeira volta em que o revisado revisou o
revisor, e é por isso que esta é a que passa.

**PRÓXIMO:** `pipe-scribe` — criar `plano-b-digital` privado na conta
`pedrodiniz310`, abrir os 5 PRs do D3, e registrar M1-4 como issue no repositório
novo, com o quadro das seis células como corpo.
