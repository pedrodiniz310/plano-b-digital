import type { GlyphKey } from '../theme/icons';

export interface NotificationSeed {
  id: string;
  title: string;
  description: string;
  glyph: GlyphKey;
}

/**
 * Avisos editoriais locais (`NOTIF` no protótipo). Sem horário inventado,
 * gatilho remoto, estado lido/não lido ou push.
 */
export const NOTIFICATIONS: NotificationSeed[] = [
  { id: 'n1', title: 'Revise as sessões do seu e-mail', description: 'Confira os dispositivos conectados à sua conta.', glyph: 'mail' },
  { id: 'n2', title: 'Seu contato de confiança ainda não foi cadastrado', description: 'É a tarefa de maior impacto agora', glyph: 'users' },
  { id: 'n3', title: 'Treine uma simulação', description: 'Pratique decisões antes de uma emergência.', glyph: 'play' },
];
