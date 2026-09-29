# 0003 — Criptografia do Cofre de Preparação

- Data: 2026-08-07
- Estado: **aceita** (implementada em 2026-09-29)

## Estado da implementação

- `app/src/lib/vaultCrypto.ts` gera a chave e executa AES-256-GCM com nonce
  aleatório e AAD por usuário e item; `app/src/state/secureStore.ts` guarda a
  chave exclusivamente no armazenamento seguro do dispositivo.
- `app/src/screens/vault/VaultScreen.tsx` pede autenticação local, mantém o texto
  decifrado só em memória enquanto aberto e rebloqueia após 45 segundos sem
  atividade, ao sair da tela ou ao colocar o app em segundo plano.
- `backend/src/routes/vault.ts` armazena e devolve apenas `ciphertext`, `nonce`,
  `promptId` e `updatedAt`, com limite de 40 itens por usuário.
- `app/src/lib/__tests__/vaultCrypto.test.ts` e
  `backend/src/routes/vault-contact.test.ts` cobrem autenticação da cifra,
  isolamento por usuário e validação da API.

## Contexto

O Cofre guarda os dados mais sensíveis do produto (localização de documentos, IMEI,
instruções de recuperação de conta). O handoff de design é explícito: "o servidor
deve armazenar apenas texto cifrado; a chave deriva do dispositivo; nunca registre o
conteúdo em log" — tratar como cofre de senhas, não como perfil de usuário comum.
Sendo projeto de Cyber Security, esta é também a decisão mais provável de ser
escrutinada de perto.

## Decisão

Criptografia ponta a ponta **client-side**, com `@noble/ciphers` (AES-256-GCM,
pure-JS, auditada, sem binding nativo). Chave simétrica de 256 bits gerada no
primeiro uso do Cofre via `expo-crypto` (`getRandomBytes`), guardada
exclusivamente em `expo-secure-store` (Keychain no iOS, Keystore no Android) — nunca
transmitida, nunca derivada de senha. O servidor recebe e armazena só
`{ciphertext, nonce}` por item; não tem meio de decifrar. Biometria
(`expo-local-authentication`) desbloqueia só a *leitura local* do Cofre já
decifrado em memória — nunca substitui o login nem participa da criptografia.
Cada cifragem usa um nonce aleatório novo de 12 bytes e AAD
`planob.vault.v1:${userId}:${promptId}`, que liga o blob ao usuário e ao espaço
do catálogo. O servidor aceita até 40 itens por usuário; o rótulo de um item
personalizado fica dentro do texto cifrado, junto com o valor.

## Alternativas descartadas

- **Chave derivada da senha do usuário (PBKDF2/Argon2 client-side)** — significa que
  trocar a senha exige re-cifrar todo o cofre, e recuperação de senha ("esqueci
  meu acesso") vira também recuperação de chave, sem caminho óbvio. Chave
  aleatória device-bound evita acoplar dois problemas diferentes (autenticação vs.
  criptografia) na mesma decisão.
- **`react-native-libsodium` (ou libsodium via binding nativo)** — criptografia
  igualmente forte (secretbox), mas é módulo nativo: exige dev client / prebuild,
  o que tira o app do Expo Go e complica exatamente o fluxo de "rodar no emulador
  Android pra visualizar" que motivou este projeto agora. `@noble/ciphers` entrega
  AES-GCM auditado em JS puro, sem esse custo.
- **Cifrar no servidor com chave gerenciada por ele (encryption at rest comum)** —
  é o padrão pra dado sensível "normal", mas não é ponta a ponta: um servidor
  comprometido ou uma ordem judicial ao provedor exporia o conteúdo. O handoff pede
  explicitamente que o servidor não tenha meio de ler — decisão de produto, não só
  técnica.

## Consequências

- Fica mais fácil: nenhum módulo nativo custom no app inteiro por causa do cofre;
  o backend nunca precisa de rota nem de lógica de descriptografia — só guarda
  blob.
- Fica mais difícil: não existe "recuperar cofre esquecido" — é a mesma natureza de
  um gerenciador de senhas local. Perder ou trocar de aparelho sem passar pela
  migração de chave (fora do escopo do marco 1-8 atual) significa perder o
  conteúdo do cofre.
- Dívida assumida: sem mecanismo de backup/recuperação da chave. Fica registrado
  como limitação conhecida, não como bug. Sinal de que chegou a hora de endereçar:
  usuário real reportando perda de dado ao trocar de aparelho, ou a funcionalidade
  virar requisito explícito de um marco futuro.
