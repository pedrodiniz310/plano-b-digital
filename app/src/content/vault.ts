import type { GlyphKey } from '../theme/icons';

export interface VaultPrompt {
  id: string;
  /** O que o usuário deveria guardar — não é o segredo em si. */
  title: string;
  glyph: GlyphKey;
  tag: string;
}

/**
 * Catálogo de sugestões do Cofre (`VAULT` no protótipo) — só o rótulo/tag do
 * que guardar. O protótipo tinha um valor de demonstração (`v`) por item;
 * não é portado aqui de propósito: em produção o Cofre é 100% preenchido
 * pelo usuário e cifrado no device (ver docs/decisions/0003-criptografia-
 * cofre.md) — não faz sentido código-fonte carregar segredo de exemplo.
 */
export const VAULT_PROMPTS: VaultPrompt[] = [
  { id: 'v1', title: 'Onde estão os códigos de recuperação', glyph: 'key', tag: 'Recuperação' },
  { id: 'v2', title: 'IMEI do aparelho principal', glyph: 'phone', tag: 'Aparelho' },
  { id: 'v3', title: 'Operadora e canal de bloqueio', glyph: 'globe', tag: 'Aparelho' },
  { id: 'v4', title: 'Canais oficiais do banco', glyph: 'bank', tag: 'Financeiro' },
  { id: 'v5', title: 'Localização dos documentos', glyph: 'doc', tag: 'Documentos' },
  { id: 'v6', title: 'Instruções para a família', glyph: 'users', tag: 'Família' },
];
