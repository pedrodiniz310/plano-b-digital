# Instruções do projeto para o Codex

## Visão geral

`plano-b-digital` é um app mobile de prevenção e resposta a emergências
digitais, desenvolvido como projeto de faculdade de Cyber Security.

O repositório é um monorepo npm:

- `app/`: React Native com Expo managed workflow, TypeScript e React Navigation;
- `backend/`: Node.js com TypeScript, Fastify, Zod, Prisma e PostgreSQL;
- `docs/`: decisões arquiteturais, handoff visual e documentação operacional.

## Regra principal de trabalho

Antes de editar:

1. leia `README.md`, o índice de decisões em `docs/_INDEX.md` e os ADRs
   relevantes;
2. inspecione os arquivos diretamente envolvidos;
3. proponha o menor plano que satisfaça o pedido;
4. preserve alterações existentes que não pertencem à tarefa.

Depois de editar:

1. execute a verificação mais específica possível;
2. execute `npm run verify` quando a mudança atravessar os dois workspaces;
3. revise `git diff` e `git status`;
4. relate arquivos alterados, comandos executados e limitações encontradas.

## Comandos

Na raiz do repositório:

```powershell
npm ci
npm run dev:app
npm run dev:backend
npm run check
npm run test
npm run build
npm run verify
```

Para o app Android com um AVD já iniciado:

```powershell
npm run dev:app
# no terminal do Expo, pressione a
```

O app também possui `npm run android`, mas ele depende de um dispositivo ou
emulador visível pelo ADB. Para confirmar:

```powershell
adb devices
```

## Arquitetura e decisões

- O app permanece em Expo managed workflow enquanto os módulos necessários
  puderem rodar no Expo Go.
- O backend é a fonte de dados persistidos do usuário; o catálogo editorial
  permanece em `app/src/content/` conforme `docs/decisions/0004-modelo-de-dados-e-sync.md`.
- O cofre **vai usar** criptografia client-side sobre `expo-secure-store`, mas
  isso ainda não existe em código: `docs/decisions/0003-criptografia-cofre.md`
  está pendente e `getVaultKey`/`setVaultKey` não têm chamador. Não escreva nada
  em `VaultItem` contando com cifra que ninguém implementou. Em qualquer caso,
  nunca registre conteúdo sensível em logs.
- Não crie `android/` nem faça prebuild automaticamente. Isso muda o workflow
  e exige uma decisão arquitetural explícita.
- Preserve as convenções existentes antes de introduzir uma nova biblioteca ou
  padrão.

## Segurança

- Nunca leia, exiba ou versione segredos de `.env`.
- Não coloque tokens, chaves privadas ou dados reais de usuários em fixtures,
  screenshots ou mensagens de debug.
- Em mudanças de autenticação, cofre, criptografia ou sincronização, adicione
  testes de regressão e consulte os ADRs correspondentes.
- Trate comandos que apagam dados, fazem reset de banco, limpam o AVD ou
  sobrescrevem arquivos como ações que exigem confirmação.

## Padrão de implementação

- Faça mudanças pequenas e localizadas.
- Prefira funções puras para regras de domínio e testes determinísticos.
- Mantenha conteúdo editorial em `app/src/content/`.
- Para telas mobile, preserve acessibilidade dos controles, safe areas e o
  comportamento offline definido nos ADRs.
- Não substitua uma decisão documentada apenas para resolver um sintoma local;
  registre uma nova decisão quando o requisito realmente mudar.

## Definição de pronto

Uma tarefa está pronta quando:

- o comportamento pedido está implementado ou a documentação está atualizada;
- os testes e verificações relevantes passam;
- não há segredo ou arquivo gerado indevido no diff;
- a mudança respeita a arquitetura documentada;
- a resposta final informa evidências e qualquer limitação restante.
