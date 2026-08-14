# Codex, Expo e Android Studio Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> subagent-driven-development or executing-plans.

**Goal:** Tornar o repositório autoexplicativo para o Codex e documentar o
fluxo de execução do Expo no AVD `Pixel_8` com o terminal visível ao lado.

**Architecture:** A mudança é somente documental. `AGENTS.md` define as regras
persistentes do agente na raiz; o guia operacional explica o limite entre Expo,
ADB, Android Studio e o emulador. Nenhum código mobile, backend ou workflow
Expo será alterado.

**Tech Stack:** Markdown, npm workspaces, React Native com Expo managed
workflow, Android Emulator, ADB, Fastify, Prisma e TypeScript.

---

## Task 1: Add repository-level Codex instructions

**File:** `AGENTS.md`

**Implementation:** Criar instruções para visão geral, comandos raiz,
arquitetura, segurança, padrão de implementação e definição de pronto. Incluir
explicitamente que o app continua em Expo managed workflow e que não se deve
criar `android/` sem decisão arquitetural.

**Verification:**

```powershell
Test-Path AGENTS.md
Select-String -Path AGENTS.md -Pattern "npm run verify","Não crie `android/`","Definição de pronto"
# Expected: True e três padrões encontrados.
```

**Commit:** `docs(codex): add repository agent instructions`

## Task 2: Add Android Studio and terminal guide

**File:** `docs/GUIA-ANDROID-STUDIO-E-TERMINAL.md`

**Implementation:** Documentar a preparação do `Pixel_8`, validação com
`adb devices`, execução de `npm run dev:app`, uso da tecla `a`, divisão de
janelas, modo Running Devices e diagnóstico para dispositivo ausente/offline.
Registrar também que os avisos `Export-Clixml` do PowerShell não pertencem ao
Expo.

**Verification:**

```powershell
Test-Path docs\GUIA-ANDROID-STUDIO-E-TERMINAL.md
Select-String -Path docs\GUIA-ANDROID-STUDIO-E-TERMINAL.md -Pattern "adb devices","npm run dev:app","Win + Right","No Android connected device found"
# Expected: True e quatro padrões encontrados.
```

**Commit:** `docs(android): document expo emulator workflow`

## Task 3: Record design and implementation decisions

**Files:**

- `docs/superpowers/specs/2026-08-09-codex-android-studio-terminal-workflow-design.md`
- `docs/superpowers/plans/2026-08-09-codex-android-studio-terminal-workflow.md`

**Implementation:** Registrar escopo, decisão de manter `dev.ps1` inalterado,
limites de segurança e critérios de aceitação. Não adicionar arquivos nativos
Android nem modificar alterações preexistentes do repositório.

**Verification:**

```powershell
rg -n "TODO|TBD|\{\{" docs\superpowers\specs docs\superpowers\plans
# Expected: nenhum resultado.

git status --short
# Expected: os arquivos novos desta tarefa aparecem como untracked junto das alterações preexistentes; nenhum arquivo existente é modificado.
```

**Commit:** `docs(workflow): record codex and android workflow design`
