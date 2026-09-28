# plano-b-digital

> App mobile que prepara uma pessoa para emergências digitais — conta invadida,
> celular roubado, golpe em andamento — e a guia passo a passo quando acontece.

## Problema

Quem tem a conta invadida ou o celular roubado descobre na pior hora que não sabe
o que fazer primeiro: não tem os códigos de recuperação, não lembra o IMEI, não
combinou nada com ninguém de confiança. As orientações existem, mas espalhadas em
artigos que ninguém lê antes de precisar — e, no meio do pânico, ler não é o que
a pessoa consegue fazer.

O Plano B Digital inverte a ordem: mede o preparo antes do incidente, transforma
o resultado num plano de ações concretas e, no dia do problema, vira um roteiro
guiado em vez de uma página de texto.

## Stack

- **App:** React Native com Expo (managed workflow), TypeScript, React Navigation,
  Zustand
- **Backend:** Node 22, TypeScript, Fastify, Zod (`fastify-type-provider-zod`),
  Prisma
- **Banco:** PostgreSQL (Neon no plano gratuito)
- **Hospedagem prevista:** Fly.io para a API (ver `fly.toml.example`)
- **Senhas:** Argon2id

O porquê de cada escolha está em
[`docs/decisions/0001-escolha-de-stack.md`](docs/decisions/0001-escolha-de-stack.md).

## Estado

Em andamento desde 2026-08. **Marco 1 entregue:** monorepo, modelo de dados e a
fatia vertical de autenticação (cadastro, login, visitante, refresh, recuperação).

As telas de Splash, Onboarding, Auth e Início são reais; o restante da navegação
(Plano, Cofre, Simulações, Emergência, Perfil) ainda usa `PlaceholderScreen`. O
catálogo editorial dessas telas já existe em `app/src/content/`, e a lógica de
pontuação e de conquistas em `app/src/lib/` — o que falta é a interface e as
rotas de sincronização. A criptografia do Cofre **não está implementada**: ver o
aviso no topo de
[`docs/decisions/0003-criptografia-cofre.md`](docs/decisions/0003-criptografia-cofre.md).

## Pré-requisitos

- **Node 22** (o backend usa `process.loadEnvFile()`, nativo a partir do 20.6)
- **Um PostgreSQL** — Neon no plano gratuito resolve; qualquer Postgres 14+ serve
- **Emulador Android** com um AVD iniciado, ou o app **Expo Go** num celular na
  mesma rede Wi-Fi

Não é preciso Android Studio para rodar o backend nem os testes. Para o app no
emulador, veja
[`docs/GUIA-ANDROID-STUDIO-E-TERMINAL.md`](docs/GUIA-ANDROID-STUDIO-E-TERMINAL.md).

## Setup do zero

```bash
git clone https://github.com/pedrodiniz310/plano-b-digital.git
cd plano-b-digital
npm ci
```

O `npm ci` já roda `prisma generate` (hook `postinstall` do workspace `backend`)
e cria o client Prisma em `backend/src/generated/prisma/`. Esse diretório é
gerado, não versionado — se algum import de `../generated/prisma/client.js`
quebrar, rode `npm run prisma:generate -w backend`.

Configure os dois ambientes:

```bash
cp backend/.env.example backend/.env
cp app/.env.example app/.env
```

Em `backend/.env`:

- `DATABASE_URL` — connection string do seu Postgres;
- `JWT_ACCESS_SECRET` — **troque o placeholder.** Gere um de verdade com
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`;
- `TRUST_PROXY` — deixe `false` na sua máquina. É **obrigatório** ligar quando
  há proxy confiável na frente (Fly.io, nginx): é ele que faz o rate limit
  enxergar o IP de cada pessoa em vez de jogar a base inteira num balde só. E é
  **perigoso** ligar sem proxy — aí qualquer um forja o IP de origem pelo
  cabeçalho `X-Forwarded-For` e o limite deixa de valer. No deploy da Fly ele já
  vem no bloco `[env]` do `fly.toml.example`.

Em `app/.env`, `EXPO_PUBLIC_API_URL` já vem apontando para `http://10.0.2.2:3000`,
que é como o emulador Android enxerga o `localhost` da sua máquina. Num celular
físico, troque pelo IP local da máquina que roda o backend.

Crie o schema no banco:

```bash
npm run prisma:migrate -w backend
```

Suba os dois processos, em terminais separados:

```bash
npm run dev:backend   # http://localhost:3000 — confira em /health
npm run dev:app       # abre o Expo; tecle "a" para lançar no emulador Android
```

## Comandos

Todos na raiz do repositório.

| comando | o que faz |
| --- | --- |
| `npm run dev:app` | Expo dev server do app |
| `npm run dev:backend` | API em watch mode (`tsx watch`) |
| `npm run check` | `tsc --noEmit` + ESLint nos dois workspaces |
| `npm run test` | Jest (app) e Vitest (backend) |
| `npm run build` | `expo export` (app) e `tsc` (backend) |
| `npm run verify` | `check` + `build` + `test` — é o que a CI roda |

Escopo por workspace com `-w`: `npm run test -w backend`.

`npm run verify` é o gate único da CI (`.github/workflows/ci.yml`). Rode antes de
abrir PR; se ele passa em clone limpo, passa lá.

## Estrutura

| caminho | o que mora aqui |
| --- | --- |
| `app/src/screens/` | telas, uma pasta por fluxo |
| `app/src/content/` | catálogo editorial (perguntas, tarefas, simulações) — texto, não código de regra |
| `app/src/lib/` | regras de domínio puras (pontuação, conquistas, emergência) |
| `app/src/state/` | Zustand + `expo-secure-store`; segredos nunca vão para o AsyncStorage |
| `app/src/api/` | cliente HTTP tipado, com renovação de sessão |
| `backend/src/routes/` | rotas HTTP com schema Zod na borda |
| `backend/src/plugins/` | Prisma, JWT e rate limit como plugins Fastify |
| `backend/src/lib/` | hash de senha, tokens, erros HTTP |
| `backend/prisma/` | schema e migrations |
| `docs/decisions/` | ADRs |
| `docs/design-handoff/` | pacote de design original — referência, não fonte de verdade; **fora do MIT**, ver [`NOTICE.md`](docs/design-handoff/NOTICE.md) |

O catálogo de conteúdo fica no app e não no banco de propósito; o raciocínio está
em [`docs/decisions/0004-modelo-de-dados-e-sync.md`](docs/decisions/0004-modelo-de-dados-e-sync.md).

## Decisões

Registradas em [`docs/decisions/`](docs/decisions/). Comece pelo índice em
[`docs/_INDEX.md`](docs/_INDEX.md).

Convenções de trabalho no repositório (segurança, definição de pronto, padrão de
implementação) estão em [`AGENTS.md`](AGENTS.md).

## Licença

[MIT](LICENSE), com uma exceção: `docs/design-handoff/` é pacote de design de
terceiro, incluído só como referência e **não coberto** pelo MIT — os direitos
seguem com seus autores. Ver [`docs/design-handoff/NOTICE.md`](docs/design-handoff/NOTICE.md).
