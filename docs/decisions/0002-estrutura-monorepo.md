# 0002 — Estrutura de monorepo

- Data: 2026-08-07
- Estado: aceita

## Contexto

O padrão de projeto (`PADRAO.md`) documenta hoje um `src/` único por repo — não
cobre o caso de um app mobile e um backend que evoluem juntos, versionados juntos,
com um contrato de API entre os dois. Criar dois repos separados (`plano-b-digital-
app` e `plano-b-digital-backend`) é a alternativa mais próxima do padrão documentado.

## Decisão

Um repo só, com **npm workspaces**: `app/` (Expo) e `backend/` (Node), mais um
`package.json` raiz que só orquestra — sem código próprio. Os scripts
`check`/`test`/`build`/`verify` da raiz rodam `--workspaces --if-present`, então o
`ci.yml` copiado do template **não muda uma linha**: continua sendo
`npm ci && npm run verify` e nada mais.

## Alternativas descartadas

- **Dois repos separados** — replica o padrão documentado ao pé da letra, mas um
  projeto solo com app+backend acoplados (mesmo contrato de rotas, mesmo momento de
  release) ganha mais com histórico/PR unificado do que perde com o desvio do
  padrão. Versionar a API e o client dela em commits separados, em dois repos, é
  fricção real pra time de uma pessoa só.
- **Turborepo / Nx** — ferramentas de monorepo mais robustas (cache de build,
  pipelines declarativos), mas são complexidade que este projeto não precisa ainda:
  dois workspaces não justificam um orquestrador dedicado. Se o projeto crescer
  (mais packages compartilhados, ex. um `shared/` de tipos), reconsiderar.
- **`src/` único com app e backend miscigenados por pasta** (ex. `src/mobile/`,
  `src/api/`) — sem workspaces, cada lado teria que compartilhar um único
  `package.json`/`node_modules`, misturando dependências de RN (Metro, Expo) com as
  do Node (Fastify, Prisma). Gera conflito de versão e build mais lento sem
  necessidade.

## Consequências

- Fica mais fácil: `npm ci && npm run verify` na raiz continua valendo como gate
  único, sem exceção documentada em lugar nenhum — quem olha o `ci.yml` não precisa
  saber que por baixo tem dois workspaces.
- Fica mais difícil: bundler do Expo (Metro) precisa de configuração extra
  (`metro.config.js` com `watchFolders`) pra funcionar dentro de um workspace — é
  caminho documentado pelo Expo, não é decisão nova, só custo de setup.
- Dívida assumida: se um dia o app e o backend precisarem de times/deploys
  desacoplados, separar em dois repos exige reescrever histórico ou aceitar
  perder o do repo antigo. Sinal de que chegou a hora: mais de uma pessoa
  trabalhando em paralelo em lados diferentes, ou cadência de release divergente.
