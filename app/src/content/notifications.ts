import type { GlyphKey } from '../theme/icons';

export interface NotificationSeed {
  id: string;
  title: string;
  description: string;
  /** Rótulo relativo de demonstração ("há 2 h") — não é timestamp real ainda. */
  whenLabel: string;
  glyph: GlyphKey;
}

/**
 * As 3 notificações de demonstração (`NOTIF` no protótipo). Decorativas por
 * enquanto — sem gatilho real nem estado lido/não lido (marco 7 decide se
 * isso vira notificação push de verdade via `expo-notifications`).
 */
export const NOTIFICATIONS: NotificationSeed[] = [
  { id: 'n1', title: 'Revise as sessões do seu e-mail', description: 'Faz 3 meses desde a última verificação', whenLabel: 'há 2 h', glyph: 'mail' },
  { id: 'n2', title: 'Seu contato de confiança ainda não foi cadastrado', description: 'É a tarefa de maior impacto agora', whenLabel: 'ontem', glyph: 'users' },
  { id: 'n3', title: 'Nova simulação disponível', description: 'Um familiar pediu dinheiro por mensagem', whenLabel: 'há 3 dias', glyph: 'play' },
];
