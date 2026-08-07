# 0001 — Escolha de stack

- Data: 2026-08-07
- Estado: aceita

## Contexto

Existe um protótipo de design em HTML (fora deste repo, referenciado em
`docs/design-handoff/`) com as 20 telas, tokens visuais e lógica de negócio do
Plano B Digital, um app de prevenção/resposta a emergências digitais. É projeto de
faculdade (curso de Cyber Security), mantido por uma pessoa só, sem orçamento pra
infra paga. Decisão de produto já tomada fora deste ADR: recriar em app mobile de
verdade (não PWA), com backend completo (não mock) — o cofre de senhas e o log de
incidente exigem dado real e seguro, não dá pra fingir isso só no cliente.

## Decisão

**App:** React Native com Expo (managed workflow), TypeScript.
**Backend:** Node + TypeScript, Fastify + Zod (`fastify-type-provider-zod`) pra
validação de schema na borda.
**Banco:** Postgres gerenciado na Neon, acessado via Prisma.
**Hospedagem do backend:** Fly.io.
**Hash de senha:** Argon2id (pacote `argon2`).

## Alternativas descartadas

- **Flutter** — cross-platform tão válido quanto RN, mas Dart é uma stack nova pra
  aprender só pra este projeto; RN com TS reaproveita o TypeScript que já vai ser
  usado no backend.
- **PWA / web responsivo** — reaproveitaria mais HTML/CSS do protótipo, mas biometria
  nativa, push notification real e a sensação de "app instalado" ficam limitadas;
  o pedido original era ver isso rodando como app de verdade num emulador Android.
- **Bare React Native (sem Expo)** — controle total sobre módulos nativos, mas exige
  Android Studio/Xcode configurados desde o dia 1 e prebuild manual. Expo managed
  cobre biometria, secure storage e crypto (ver [[0003-criptografia-cofre]]) sem
  nenhum módulo nativo customizado — só entra prebuild se/quando precisar de algo
  que Expo Go não cobre (ex: push notification real, marco 7).
- **Express no lugar de Fastify** — mesmo resultado de validação de schema exigiria
  middleware manual (`zod` + wrapper próprio); Fastify já integra isso.
- **Fly Postgres no lugar de Neon** — Fly Postgres é Postgres auto-gerenciado
  rodando como app Fly: backups, upgrades e monitoramento ficam por sua conta. Neon
  é serviço gerenciado de verdade (backup automático, tier gratuito, zero ops) — e
  app/banco não precisarem estar no mesmo provedor não pesa nessa escala.
- **bcrypt no lugar de Argon2id** — mais simples de instalar (pure JS em algumas
  implementações), mas Argon2id é a recomendação atual da OWASP e este é
  especificamente um projeto de segurança — vale o sinal e o custo é só uma linha a
  mais de toolchain no Dockerfile do backend.

## Consequências

- Fica mais fácil: todo o time (uma pessoa) trabalha em TypeScript ponta a ponta;
  Expo Go permite testar no emulador/celular sem build nativo; Neon e Fly.io têm
  tier gratuito suficiente pra este estágio.
- Fica mais difícil: qualquer necessidade futura de módulo nativo fora do que Expo
  Go cobre exige migrar pra um dev client (prebuild) — não é reversível em 10 min,
  mas é um caminho documentado pelo próprio Expo.
- Dívida assumida: nenhuma conta (Neon/Fly.io/Expo/EAS) existe ainda — CD real fica
  configurado em código mas não dispara até essas contas existirem e os secrets
  serem cadastrados no GitHub. Sinal de que chegou a hora: início do marco 8.
