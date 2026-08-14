# Fluxo Codex, Expo e Android Studio

## Objetivo

Deixar o repositório autoexplicativo para o Codex CLI e documentar um fluxo
repetível para desenvolver o app Expo com o Android Emulator visível ao lado do
Windows Terminal.

## Contexto atual

O projeto é um monorepo npm com dois workspaces:

- `app/`: React Native com Expo managed workflow e TypeScript;
- `backend/`: Node.js com TypeScript, Fastify, Prisma e PostgreSQL.

Não existe uma pasta nativa `android/`. O Android Studio será usado para
gerenciar e executar o AVD `Pixel_8`; o app será iniciado pelo Expo no
terminal.

## Decisão

Criar dois arquivos de orientação:

1. `AGENTS.md` na raiz, com contexto do domínio, arquitetura, comandos,
   regras de segurança e checklist de verificação para o Codex;
2. `docs/GUIA-ANDROID-STUDIO-E-TERMINAL.md`, com o procedimento operacional
   para iniciar o AVD, validar o ADB, iniciar o Metro e organizar as janelas.

O script existente `dev.ps1` permanecerá inalterado. Ele é útil para abrir
backend e app em painéis do Windows Terminal, mas não deve tentar controlar uma
janela gráfica do emulador.

## Fluxo de execução

1. Abrir o `Pixel_8` pelo Device Manager ou pelo comando do SDK.
2. Confirmar que `adb devices` mostra o emulador como `device`.
3. Executar `npm run dev:app` na raiz.
4. Pressionar `a` no terminal do Expo para abrir o app.
5. Usar o Android Studio/Running Devices ou a janela do emulador à direita e o
   terminal à esquerda.

## Segurança e limites

- Não criar uma pasta `android/` sem uma decisão explícita de migrar o workflow
  Expo managed para prebuild/dev client.
- Não versionar `.env`, chaves, tokens ou dados do emulador.
- Não executar comandos destrutivos no AVD ou no banco sem confirmação explícita.
- Toda alteração de código deve preservar o gate `npm run verify` quando a
  ferramenta e as dependências locais permitirem.

## Critérios de aceitação

- O Codex encontra instruções de projeto na raiz sem depender da conversa.
- Uma pessoa consegue iniciar o app seguindo somente o guia operacional.
- O guia explica a diferença entre Expo, Android Studio, AVD e ADB.
- O guia inclui diagnóstico para `No Android connected device found`.
- O estado anterior do repositório continua preservado fora dos arquivos novos.
