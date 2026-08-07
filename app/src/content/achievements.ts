import type { GlyphKey } from '../theme/icons';

export type AchievementId = 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6';

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
  glyph: GlyphKey;
}

/**
 * As 6 conquistas (`ACH` no protótipo) — só o texto de exibição. As
 * condições de desbloqueio são código, não conteúdo: ver lib/achievements.ts.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'a1', title: 'Primeiros Passos', description: 'Concluiu o Teste de Prontidão', glyph: 'star' },
  { id: 'a2', title: 'E-mail Protegido', description: 'Completou as tarefas do e-mail', glyph: 'mail' },
  { id: 'a3', title: 'Plano Preparado', description: 'Metade do plano concluída', glyph: 'plan' },
  { id: 'a4', title: 'Família Segura', description: 'Cadastrou um contato de confiança', glyph: 'users' },
  { id: 'a5', title: 'Pronto para Emergências', description: 'Concluiu uma simulação', glyph: 'play' },
  { id: 'a6', title: 'Guardião Digital', description: 'Prontidão acima de 80%', glyph: 'shield' },
];
