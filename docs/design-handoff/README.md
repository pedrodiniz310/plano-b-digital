# Handoff — Plano B Digital (app mobile)

## Visão geral

Aplicativo mobile de **prevenção e resposta a emergências digitais**: ajuda a pessoa a se preparar
antes de um incidente (roubo de celular, invasão de conta, golpe financeiro) e a agir com clareza
durante o incidente.

O protótipo cobre 20 telas navegáveis, do splash ao relatório de atendimento, com toda a lógica de
pontuação, progresso e persistência local funcionando.

Idioma da interface: **português do Brasil**, tratamento na segunda pessoa ("você"), tom calmo e
direto. Sem emoji na interface.

---

## Sobre os arquivos deste pacote

Os arquivos em `src/` são **referências de design construídas em HTML** — um protótipo que mostra a
aparência e o comportamento pretendidos. **Não são código de produção para copiar e colar.**

A tarefa é **recriar estas telas no ambiente do codebase de destino** (React Native, Flutter,
SwiftUI, Kotlin/Compose, ou React web) usando os padrões e bibliotecas já estabelecidos ali. Se
ainda não existe um codebase, escolha o framework mais adequado ao projeto — para um app mobile
real, **React Native ou Flutter** são os caminhos naturais — e implemente as telas nele.

O que deve ser aproveitado literalmente: **os valores** (cores, tipografia, espaçamentos, raios),
**a lógica de negócio** (fórmula de pontuação, conteúdo das tarefas e simulações) e **os textos**.
O que não deve ser aproveitado: a estrutura de DOM, o CSS inline e o runtime do protótipo.

## Fidelidade

**Alta fidelidade (hi-fi).** Cores, tipografia, espaçamentos, estados e microinterações são finais.
Recrie a UI com fidelidade visual usando os componentes do codebase de destino.

---

## Design tokens

### Cores — tema claro

| Token | Hex | Uso |
|---|---|---|
| `--pb-deep` | `#123B5D` | Azul profundo: avatares, cartões escuros, wordmark |
| `--pb-blue` | `#246BFD` | Ação primária, foco, progresso, seleção |
| `--pb-blue-ink` | `#1B54CC` | Hover do primário; texto azul sobre fundo claro |
| `--pb-tint` | `#EAF2FF` | Fundo de ícone/chip azul |
| `--pb-green` | `#2DBE78` | Sucesso, conclusão, rota alternativa |
| `--pb-amber` | `#F4B740` | Atenção, numerais editoriais, ✳ |
| `--pb-red` | `#E5484D` | Erro, emergência, ações destrutivas |
| `--pb-bg` | `#F7F9FC` | Fundo da tela |
| `--pb-surface` | `#FFFFFF` | Cartões, campos, folhas modais |
| `--pb-text` | `#172033` | Texto principal |
| `--pb-text2` | `#667085` | Texto secundário |
| `--pb-border` | `#E4EAF2` | Bordas e divisores |
| `--pb-soft` | `rgba(18,59,93,.06)` | Trilhos de progresso, fundos sutis |
| `--pb-shadow` | `0 1px 2px rgba(16,24,40,.04), 0 10px 28px rgba(16,24,40,.06)` | Elevação de cartão |

### Cores — tema escuro

| Token | Hex |
|---|---|
| `--pb-deep` | `#0B2540` |
| `--pb-blue` | `#4C8BFF` |
| `--pb-blue-ink` | `#77A6FF` |
| `--pb-tint` | `#16304E` |
| `--pb-green` | `#3ED08C` |
| `--pb-amber` | `#F6C560` |
| `--pb-red` | `#FF6B6E` |
| `--pb-bg` | `#0E1525` |
| `--pb-surface` | `#172033` |
| `--pb-card` | `#1D2939` |
| `--pb-text` | `#F1F5FB` |
| `--pb-text2` | `#94A3B8` |
| `--pb-border` | `#28364D` |
| `--pb-soft` | `rgba(255,255,255,.05)` |

### Tintas de texto (acessibilidade)

As cores de status acima são vibrantes demais para servirem de **texto** sobre fundo claro. Quando o
valor é usado como cor de tipo (badge de nível, porcentagem por área, número de prontidão), troque
pela tinta escura correspondente. Em tema escuro, use o valor vibrante original.

| Cor de preenchimento | Tinta de texto (tema claro) |
|---|---|
| `#2DBE78` verde | `#1B8A56` |
| `#246BFD` azul | `#1B54CC` |
| `#F4B740` âmbar | `#8A6100` |
| `#E5484D` vermelho | `#B02A2E` |

Alto contraste (`data-pb-contrast="on"`) escurece o texto secundário para `#3B4759` e reforça as
bordas para `#94A3B8` (no tema escuro: `#D2DCEA` e `#6B7C96`).

### Tipografia

**Poppins** (Google Fonts) em toda a interface. Pesos usados: 300 (descrições longas), 400 (corpo),
500 (rótulos e itens de lista), 600 (títulos e números).

| Papel | Tamanho | Peso | Entrelinha | Tracking |
|---|---|---|---|---|
| Display do splash | 31px | 600 | 1.1 | -0.03em |
| Título de tela | 25–26px | 600 | 1.2 | -0.03em |
| Título de seção / cartão | 19–24px | 600 | 1.25 | -0.02em a -0.03em |
| Item de lista | 14–15px | 500 | 1.35 | — |
| Corpo | 14.5–15px | 300–400 | 1.55–1.62 | — |
| Secundário | 12–13px | 300 | 1.5 | — |
| Rótulo de seção | 10–11px | 600 | 1 | 0.22em, caixa alta |
| Número grande (pontuação) | 44px | 600 | 1 | -0.04em |

Aplique `text-wrap: pretty` (ou equivalente) em títulos e parágrafos longos.

### Espaçamento, raios e sombras

- Margem lateral das telas: **26px** (tela de atendimento: 22px).
- Topo das telas: **62px** (abaixo da status bar); telas com nav inferior reservam **116px** embaixo.
- Espaço entre itens de lista: **9–11px**; entre blocos: **22–28px**.
- Raios: campo e botão **16–18px**, cartão **18–22px**, ícone quadrado **12–16px**, folha modal
  **28px** no topo, pílula **99px**.
- Altura de alvo: botão primário **56px**, secundário **50–54px**, campo **54px**, ícone-botão
  **42×42px**. Nada abaixo de 44px.
- Elevação: cartões usam borda de 1px em vez de sombra; só o botão primário
  (`0 10px 24px rgba(36,107,253,.24)`), os cartões escuros e as folhas modais recebem sombra.

### Movimento

Easing padrão `cubic-bezier(.22,1,.36,1)`. Entrada de tela: fade 300–400ms. Folha modal: `pbSheet`
320ms de baixo para cima, com backdrop `rgba(11,37,64,.42)`. Toast e diálogo: `pbPop` 280ms.
Barras de progresso animam em 400–800ms. Splash: três anéis em `pbRipple` 3.4s com defasagem de
0.9s, e o traço verde desenhado por `stroke-dashoffset` em 1.4s. Tudo desligado sob
`prefers-reduced-motion`.

---

## Telas

Ordem numerada conforme o painel de navegação do protótipo.

### 01 · Splash
Fundo claro. Escudo azul com "B" sobre disco branco, três anéis concêntricos pulsando, halo azul ao
topo e verde ao pé. Wordmark "Plano B Digital" em `--pb-deep` 31px/600, subtítulo "Prepare-se antes
que aconteça". Barra de carregamento 120×3px verde ao pé, com o aviso "Seus dados ficam apenas neste
aparelho" e ícone de cadeado. Avança sozinha em **2400ms**: vai para Onboarding na primeira execução,
ou direto para Login se o onboarding já foi concluído.

### 02 · Onboarding — 4 telas
Indicador de passos no topo (pílula de 26px na ativa, pontos de 6px nas demais) e "Pular introdução"
à direita. Ilustração de 236px: círculo tingido na cor do passo, anel pontilhado girando (34s), um
cartão-telefone inclinado e um quadrado de ícone 76px na cor de destaque. Abaixo: chip de categoria
em caixa alta, título 26px/600 e descrição 15px/300. Botão "Continuar" (último passo: "Começar") e,
no último, "Já tenho um plano" que leva direto ao login.

| # | Chip | Título | Destaque |
|---|---|---|---|
| 1 | Prevenção | Você está preparado para uma emergência digital? | `#246BFD` |
| 2 | Organização | Tenha um plano antes de precisar dele | `#123B5D` |
| 3 | Treino | Treine situações reais | `#2DBE78` |
| 4 | Resposta | Se algo acontecer, saiba o que fazer | `#F4B740` |

### 03 · Login e cadastro
Alternador segmentado "Criar conta" / "Entrar" (pílula de 4px de padding, aba ativa em superfície
branca com sombra). Campos: Nome (só cadastro), E-mail, Senha com botão de olho, Confirmar senha
(só cadastro). Medidor de força da senha em 3 níveis abaixo do campo. No modo Entrar, link "Esqueci
meu acesso". Divisor "ou", depois "Entrar com biometria" e "Continuar como visitante" (borda
tracejada). Rodapé em caixa `--pb-tint` avisando que nada é enviado ou verificado.

**Validação:** nome com 2+ caracteres; e-mail no padrão `algo@algo.tld`; senha com 8+ caracteres e,
no cadastro, ao menos um número; confirmação idêntica. Mensagens de erro em vermelho com ícone de
alerta, e a borda do campo passa a `#E5484D`. O erro some assim que o campo é editado.

**Força da senha:** 8+ caracteres = 1 ponto; letras e números = 1 ponto; 12+ caracteres ou símbolo =
1 ponto. 0–1 ponto "Senha fraca" vermelho (33%), 2 "Senha média" âmbar (66%), 3 "Senha forte" verde
(100%).

### 04 · Recuperar acesso
Campo de e-mail e botão "Enviar instruções". Após envio, estado de sucesso com marca de verificação
verde e o e-mail **mascarado** (duas primeiras letras + pontos + domínio). Nota em rodapé sobre o
contato de confiança poder ajudar a confirmar identidade.

### 05 · Biometria (folha modal)
Três estados: **escanear** (ícone de digital 104px em `--pb-tint`, linha de varredura em 1.6s,
botões "Cancelar" e "Simular falha"), **sucesso** (marca verde, "Identidade confirmada", segue
sozinho após 900ms) e **falha** (triângulo vermelho, "Tentar novamente" e "Usar e-mail e senha").
Do início ao sucesso: 1500ms; do sucesso à entrada: mais 900ms.

### 06 · Verificando
Spinner de 62px, rótulo contextual ("Criando seu espaço seguro", "Confirmando sua identidade",
"Preparando modo visitante") e subtítulo "Preparando seu ambiente local". Duração 1400ms.

### 07 · Tudo pronto
Cabeçalho com avatar (inicial do nome), saudação e e-mail mascarado; selo "Visitante" quando for o
caso. Cartão escuro em degradê apresentando o Teste de Prontidão com três métricas (10 perguntas,
3 min, 5 áreas). Lista "O que vem depois" com três itens. Botões "Iniciar teste" e "Fazer depois".

### 08 · Teste de Prontidão
Barra de progresso no topo com contador `01/10`. Chip da categoria da pergunta, enunciado 25px/600 e
quatro opções em rádio: **Sim · Parcialmente · Não · Não sei o que é isso**. A resposta avança
sozinha após 220ms. O botão de voltar retrocede uma pergunta; na primeira, sai do teste.

As 10 perguntas e suas categorias estão em `Q` no arquivo do protótipo — copie-as literalmente.

### 09 · Processando
Spinner e três linhas que acendem em sequência a cada 700ms: "Analisando suas respostas",
"Identificando riscos prioritários", "Montando seu Plano B". Total 2100ms.

### 10 · Resultado
Anel de 168px (raio 62, traço 14px, arredondado) com a pontuação 44px/600 ao centro. Badge do nível
e frase explicativa. Seção "Por área" com cinco barras (ícone, nome, porcentagem, trilho de 6px).
Seção "Riscos prioritários" com até três cartões numerados em itálico âmbar. Botões "Ver meu Plano B"
e "Ir para o início".

### 11 · Início
Saudação por horário + avatar de notificações com badge de contagem. Cartão escuro em degradê com
anel de prontidão (92px, raio 34, traço 9px), nível e contagem de tarefas/pontos. Botão de emergência
em vermelho translúcido. "Próximas tarefas": até três pendentes, cada uma abrindo direto o detalhe.
"Acesso rápido": grade 2×2 — Cofre, Contato, Simulações, Relatório.

### 12 · Meu Plano
Cartão de progresso geral (porcentagem 20px/600 azul + trilho de 8px). Sete categorias, cada uma com
ícone, nome, selo de prioridade (Crítica vermelha / Alta âmbar / Média neutra), barra de progresso e
contador `n/total`. Ao entrar numa categoria: cabeçalho com ícone e contagem, e a lista de tarefas
com caixa de seleção à esquerda (marca a tarefa) e o restante da linha abrindo o detalhe.

### 13 · Detalhe da tarefa (folha modal)
Título, bloco azul "Por que importa", bloco âmbar "Risco se ficar de fora", lista numerada
"Como fazer · N min" e botão "Marcar como concluída" / "Reabrir tarefa".

### 14 · Cofre de Preparação
**Bloqueado:** cadeado 112px, explicação e botão "Desbloquear com biometria" (varredura de 1400ms).
**Aberto:** botão "Bloquear" no topo, seis itens com ícone, rótulo, etiqueta de categoria em caixa
alta, valor mascarado (`••••`) e botão de olho para revelar. Rodapé com "Adicionar informação" em
borda tracejada. Rebloqueia sozinho após **45s** de inatividade.

### 15 · Contato de confiança
**Sem contato:** formulário com Nome, Relação, Telefone e "O que essa pessoa deve fazer" (área de
texto). Nome exige 2+ caracteres; telefone exige 10+ dígitos.
**Com contato:** cartão com avatar da inicial, nome, relação, telefone **mascarado**
(`(11) •••••-0000`) e observação; atalho para o Protocolo familiar e botão "Remover contato" com
diálogo de confirmação.

### 16 · Protocolo familiar
Cartão escuro com a **palavra de segurança** oculta por padrão e botão mostrar/ocultar. Quatro regras
combinadas, cada uma com título e explicação. Botão "Compartilhar com a família".

### 17 · Simulações
Oito cartões: ícone, título, selo de estado (Concluída verde / Disponível azul / Em breve neutro) e
metadados "Dificuldade · duração · +N pts". Os não jogáveis ficam a 72% de opacidade e exibem aviso.

### 18 · Simulação jogável — "Roubaram meu celular"
Seis etapas de quatro tipos:

1. **intro** — contexto da situação, botão "Começar simulação".
2. **choice** — escolha única (rádio quadrado).
3. **multi** — múltipla escolha com dica "Selecione as 3 corretas".
4. **order** — ordenação: tocar adiciona à sequência e mostra o número; tocar de novo remove.
5. **choice** — golpe da falsa central de atendimento.
6. **choice** — preservação de evidências.

O botão principal alterna entre "Confirmar resposta" (desabilitado até haver resposta válida) e
"Continuar" / "Ver resultado" depois do feedback. O feedback aparece como faixa verde (acerto) ou
âmbar (erro) com texto explicativo — **o erro nunca bloqueia o avanço**, apenas ensina. Sair pede
confirmação.

### 19 · Resultado da simulação
Marca de verificação, nível ("Excelente resposta" ≥80%, "Boa resposta" ≥50%, "Reveja os passos"),
três métricas (acertos, tempo, pontos) e quatro aprendizados. Botões "Voltar às simulações" e
"Refazer simulação".

### 20 · Modo Emergência — seleção
Chip vermelho "Modo Emergência", pergunta "O que aconteceu?" e nove cenários em lista. Layout mais
limpo e focado que o resto do app, mas com a mesma linguagem visual.

### 21 · Atendimento
Fundo em `--pb-surface` (inverte com o resto do app para sinalizar contexto). Cabeçalho com horário
de início e título do cenário; barra de progresso verde. Três grupos — **Agora** (primeiros minutos),
**Em seguida** (primeiras horas), **Depois** (primeiros dias) — com itens que trazem título,
orientação e, ao concluir, o **horário exato** ("Concluída às 14:32"). Rodapé com "Acionar contato de
confiança" e "Encerrar e gerar relatório".

### 22 · Relatório
Cartão de ações concluídas, **linha do tempo** com marcadores e horários, lista "Ainda pendente" (até
quatro itens) e botão "Exportar relatório".

### 23 · Perfil
Avatar, nome, selo de visitante, e-mail mascarado. Três métricas (prontidão, tarefas, pontos). Grade
2×2 de seis conquistas, apagadas a 55% quando bloqueadas. Preferências: modo escuro, alto contraste e
três tamanhos de fonte. Ações: refazer o teste, notificações, sair da conta (com confirmação).

### Navegação inferior
Cinco alvos: **Início · Meu Plano · [SOS] · Simulações · Perfil**. O SOS é um quadrado de 58px em
`--pb-red`, raio 22px, elevado sobre a barra, com sombra vermelha. Aparece apenas nas quatro telas
de aba; telas de fluxo (teste, simulação, emergência, cofre) ocupam a tela inteira.

### Notificações (folha modal)
Três itens com ícone, título, descrição e tempo relativo.

---

## Lógica de negócio

### Pontuação de prontidão

```
valorResposta = { sim: 1, parcial: 0.6, nao: 0, naosei: 0 }

base  = round( soma(valorResposta) / 10 * 100 )          // resultado do teste
score = min( 100, base + tarefasConcluidas * 4 + simulacoesConcluidas * 3 )
```

Por categoria: a mesma média, restrita às perguntas daquela categoria. Cores da barra: ≥70 verde,
≥40 âmbar, abaixo disso vermelho.

**Níveis:** ≥85 "Preparado" (verde) · ≥70 "Bem preparado" (azul) · ≥40 "Em construção" (âmbar) ·
abaixo "Início da jornada" (vermelho).

### Riscos prioritários
Derivados das respostas com valor menor que 1, nesta ordem de precedência, limitados a três:
códigos de recuperação (Q3) → contato de confiança (Q7) → proteção do e-mail (Q2) → IMEI (Q5).

### Pontos (gamificação)
Teste concluído **+40** · tarefa concluída **+20** (e −20 ao reabrir) · contato cadastrado **+30** ·
simulação concluída **+60**.

### Conquistas

| Conquista | Condição |
|---|---|
| Primeiros Passos | Teste de Prontidão concluído |
| E-mail Protegido | Todas as tarefas da área "Meu e-mail" concluídas |
| Plano Preparado | Metade das 15 tarefas concluídas |
| Família Segura | Contato de confiança cadastrado |
| Pronto para Emergências | Ao menos uma simulação concluída |
| Guardião Digital | Prontidão ≥ 80 |

### Conteúdo
Todo o conteúdo editorial está no arquivo do protótipo, em constantes no topo da classe de lógica —
copie literalmente:

- `Q` — 10 perguntas do teste, com categoria.
- `CATS` — 5 áreas de diagnóstico.
- `PC` — 7 categorias do plano, com prioridade.
- `T` — 15 tarefas: título, minutos, "por que importa", risco e 3 passos cada.
- `VAULT` — 6 itens do cofre.
- `SIMS` — 8 simulações com metadados.
- `STEPS` — 6 etapas da simulação jogável, com opções, gabarito e feedback.
- `EMS` / `EMPLAN` — 9 cenários de emergência e os planos de ação (`celular` detalhado com 13 ações;
  `generico` com 8).
- `ACH` — 6 conquistas · `NOTIF` — 3 notificações.

---

## Estado e persistência

O protótipo guarda tudo em `localStorage`, chave `planob:v1`:

```json
{
  "theme": "light",  "contrast": false, "font": "s",
  "obDone": true,
  "user": { "name": "Pedro", "email": "…", "guest": false },
  "answers": { "0": 0, "1": 2 },
  "base": 62,
  "tasks": { "t1": true, "t5": true },
  "points": 120,
  "simDone": { "roubo": true },
  "contact": { "name": "…", "rel": "…", "phone": "…", "email": "…", "note": "…" }
}
```

Estado efêmero (não persistido): tela atual, índice da pergunta, progresso da simulação, checklist e
log da emergência, cofre destravado, folhas modais abertas.

---

## Sugestão de backend

O protótipo não faz rede. Ao plugar o backend, estes são os limites naturais:

| Recurso | Endpoints | Observações |
|---|---|---|
| Autenticação | `POST /auth/signup` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/recover` | O protótipo simula tudo. Biometria deve usar a API nativa do dispositivo (Face ID / BiometricPrompt) e desbloquear um token local, nunca substituir a autenticação de servidor. |
| Perfil | `GET/PATCH /me` | Nome, e-mail, preferências (tema, contraste, fonte). |
| Diagnóstico | `POST /assessments` · `GET /assessments/latest` | Envia as 10 respostas; o cálculo de pontuação pode migrar para o servidor. |
| Plano | `GET /plan` · `PATCH /plan/tasks/:id` | Catálogo de tarefas do servidor + estado de conclusão por usuário. |
| Cofre | `GET/POST/PATCH/DELETE /vault/items` | **Criptografia ponta a ponta.** O servidor deve armazenar apenas texto cifrado; a chave deriva do dispositivo. Nunca registre o conteúdo em log. |
| Contato | `GET/PUT/DELETE /trusted-contact` | Idealmente com confirmação da outra parte. |
| Simulações | `GET /simulations` · `POST /simulations/:id/results` | Conteúdo versionado no servidor permite atualizar cenários sem publicar app. |
| Emergência | `POST /incidents` · `PATCH /incidents/:id/actions/:actionId` · `POST /incidents/:id/close` | Cada ação concluída grava horário do servidor — é isso que sustenta o relatório. |
| Relatório | `GET /incidents/:id/report` | Geração de PDF no servidor. |
| Notificações | `GET /notifications` · registro de push token | Lembretes de revisão periódica. |

Pontos de atenção:

- **O Modo Emergência precisa funcionar offline.** Quem acabou de perder o celular pode estar sem
  rede. Cacheie os planos de ação localmente e sincronize o incidente depois.
- **O Cofre é o dado mais sensível do produto.** Trate-o como cofre de senhas, não como perfil.
- Mascaramento de e-mail e telefone deve acontecer também no servidor, nas respostas de leitura.
- O log do incidente é evidência: horários vêm do servidor sempre que houver rede.

---

## Acessibilidade

- Alvos de toque nunca abaixo de 44px.
- Três tamanhos de fonte (100% / 109% / 120%) e modo de alto contraste.
- Cores de status têm tinta de texto separada (ver "Design tokens") para garantir 4.5:1 no tema claro.
- Todo ícone-botão tem rótulo acessível; a cor nunca é o único portador de significado (os estados
  sempre trazem ícone e texto).
- Animações respeitam `prefers-reduced-motion`.

---

## Assets

Nenhuma imagem externa. Todos os ícones são SVG inline de traço 1.8–2.2px, arredondados, no estilo
linear — equivalentes a Lucide/Phosphor. Ao recriar, use a biblioteca de ícones do codebase de
destino em vez de copiar os caminhos SVG.

Fonte: **Poppins**, do Google Fonts. Para produção offline, embarque os `.woff2`.

---

## Arquivos deste pacote

```
design_handoff_plano_b_digital/
├── README.md                          este documento
├── plano-b-digital-standalone.html    protótipo em arquivo único — abre offline em qualquer navegador
└── src/
    ├── Plano B Digital.dc.html        fonte do protótipo (template + classe de lógica)
    ├── support.js                     runtime que renderiza o arquivo acima
    ├── ios-frame.jsx                  moldura de iPhone usada na apresentação
    └── _ds/…                          tokens do design system (CSS) e bundle
```

Comece por `plano-b-digital-standalone.html` para navegar o app, e leia
`src/Plano B Digital.dc.html` para as constantes de conteúdo e a lógica de pontuação — a classe de
lógica fica no `<script>` ao final do arquivo.

O painel lateral com a lista de telas e os controles de tema existe apenas para apresentação do
protótipo; **não faz parte do produto**.
