# 0004 — Catálogo estático no app + sync offline do incidente

- Data: 2026-08-07
- Estado: aceita

## Contexto

O handoff de design sugere uma tabela de endpoints REST que devolveriam recursos
como `GET /plan` e `GET /simulations` — lida ao pé da letra, essa tabela sugere que
o catálogo de conteúdo (as 10 perguntas, as 15 tarefas, as 8 simulações etc.)
moraria no banco. Mas esse catálogo é conteúdo editorial versionado junto com o
app, não dado gerado pelo usuário — e o padrão de projeto deste autor tem como
regra central "fonte única": duplicar o mesmo conteúdo em app e banco diverge cedo
ou tarde. Separadamente, o Modo Emergência precisa funcionar sem rede (alguém que
acabou de perder o aparelho pode estar sem conexão).

## Decisão

O **catálogo** (`Q`, `CATS`, `PC`, `T`, `VAULT` catalog, `SIMS`, `STEPS`, `EMS`,
`EMPLAN`, `ACH`, `NOTIF`) vive só no app, em `app/src/content/*.ts`, tipado e
versionado junto com o código — inclusive os planos de ação de emergência
(`EMPLAN`), que por serem só 2 conteúdos reais (`celular` e `generico`) ficam
bundlados no app e portanto disponíveis offline por construção, sem cache dinâmico.
O **backend** guarda só estado do usuário, referenciando ids do catálogo por
string (`taskId: "t1"`, `simId: "roubo"`) — os endpoints da tabela do handoff
continuam existindo, mas devolvem estado (`{taskId, completed, completedAt}`), não
o catálogo. **Pontuação, nível e conquistas nunca são armazenados** — são
computados em tempo de leitura a partir de `Assessment` + `TaskState` +
`SimulationResult` + `TrustedContact`, mesma fórmula do protótipo original
(`score()`/`risks()`/`achievements()`), só que sem contador mutável (o protótipo
soma/subtrai pontos em 4 pontos do código; produção deriva sempre do mesmo dado
fonte, eliminando a classe de bug "pontos dessincronizam"). Só o **log do
incidente** (`IncidentAction`) precisa de sincronização de verdade: fila local
(outbox) em AsyncStorage grava ação + timestamp otimista enquanto offline; ao
surge uma oportunidade de nova tentativa, sincroniza com o servidor, que
carimba `completedAt` autoritativo na chegada — é esse timestamp que sustenta o
relatório final.

## Alternativas descartadas

- **Catálogo servido pelo backend** (leitura literal da tabela do handoff) —
  permitiria atualizar cenários sem publicar nova versão do app, mas duplica fonte
  de verdade sem necessidade agora; o próprio handoff descreve isso como vantagem
  futura, não requisito do v1.
- **Pontos como contador mutável no banco** (replicando o `+20`/`-20` do
  protótipo) — replica um padrão que já é frágil no próprio protótipo (qualquer
  chamada perdida ou duplicada dessincroniza o contador). Computar sob demanda
  custa uma query a mais e elimina a categoria de bug inteira.
- **Sincronizar todo o app via fila offline genérica** (não só o incidente) — mais
  simétrico, mas sobre-engenharia: as outras telas (tarefas, cofre, contato) não
  têm o requisito explícito de "funcionar sem rede" que o Modo Emergência tem.

## Consequências

- Nota de implementação (Marco 6): a fila é reenviada após cada operação,
  durante a verificação de sessão e quando o app volta ao primeiro plano.
  Essa estratégia de tentativas dispensa um observador de rede;
  o app não espera pela conexão para iniciar, concluir ações ou encerrar o atendimento.

- Fica mais fácil: atualizar conteúdo (nova pergunta, nova tarefa) é PR só no app,
  sem migration; pontuação nunca fica inconsistente com os fatos que a compõem.
- Fica mais difícil: mudar o catálogo exige nova versão publicada do app (sem
  mecanismo de atualização remota de conteúdo) — aceitável neste estágio.
- Dívida assumida: se o catálogo precisar mudar com frequência sem depender de
  release de app (ex. novos cenários de emergência), migrar pra "catálogo
  servido" vira necessário. Sinal de que chegou a hora: mais de uma atualização de
  conteúdo por mês sem mudança de código relacionada.
