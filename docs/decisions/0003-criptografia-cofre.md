# 0003 — Criptografia do Cofre de Preparação

- Data: 2026-08-07
- Estado: aceita

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
primeiro uso do Cofre via `expo-crypto` (`getRandomBytesAsync`), guardada
exclusivamente em `expo-secure-store` (Keychain no iOS, Keystore no Android) — nunca
transmitida, nunca derivada de senha. O servidor recebe e armazena só
`{ciphertext, nonce}` por item; não tem meio de decifrar. Biometria
(`expo-local-authentication`) desbloqueia só a *leitura local* do Cofre já
decifrado em memória — nunca substitui o login nem participa da criptografia.

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
