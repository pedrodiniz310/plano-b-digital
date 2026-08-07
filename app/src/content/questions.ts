import type { GlyphKey } from '../theme/icons';

export type CategoryId = 'dev' | 'email' | 'rec' | 'fin' | 'trust';

export interface DiagnosticCategory {
  id: CategoryId;
  name: string;
  glyph: GlyphKey;
}

/** As 5 áreas de diagnóstico (`CATS` no protótipo). */
export const CATEGORIES: DiagnosticCategory[] = [
  { id: 'dev', name: 'Proteção do aparelho', glyph: 'phone' },
  { id: 'email', name: 'Proteção do e-mail', glyph: 'mail' },
  { id: 'rec', name: 'Recuperação de contas', glyph: 'key' },
  { id: 'fin', name: 'Segurança financeira', glyph: 'bank' },
  { id: 'trust', name: 'Rede de confiança', glyph: 'users' },
];

export interface Question {
  text: string;
  categoryId: CategoryId;
}

/** As 10 perguntas do Teste de Prontidão (`Q` no protótipo), nesta ordem exata. */
export const QUESTIONS: Question[] = [
  { text: 'Você sabe a senha principal do seu e-mail?', categoryId: 'email' },
  { text: 'Seu e-mail possui autenticação em dois fatores?', categoryId: 'email' },
  { text: 'Você possui códigos de recuperação guardados?', categoryId: 'rec' },
  { text: 'Sabe como bloquear o chip do seu celular?', categoryId: 'dev' },
  { text: 'Possui o IMEI do aparelho registrado?', categoryId: 'dev' },
  { text: 'Usa senhas diferentes nas contas importantes?', categoryId: 'rec' },
  { text: 'Possui um contato de confiança?', categoryId: 'trust' },
  { text: 'Sabe como encerrar sessões abertas?', categoryId: 'rec' },
  { text: 'Conhece os canais oficiais do seu banco?', categoryId: 'fin' },
  { text: 'Seu aparelho possui bloqueio por biometria ou senha?', categoryId: 'dev' },
];

export type AnswerKey = 'sim' | 'parcial' | 'nao' | 'naosei';

export interface AnswerOption {
  key: AnswerKey;
  /** Peso na fórmula de pontuação — ver lib/scoring.ts. */
  value: number;
  label: string;
}

/** As 4 opções de resposta (`OPTS` no protótipo), nesta ordem exata. */
export const ANSWER_OPTIONS: AnswerOption[] = [
  { key: 'sim', value: 1, label: 'Sim' },
  { key: 'parcial', value: 0.6, label: 'Parcialmente' },
  { key: 'nao', value: 0, label: 'Não' },
  { key: 'naosei', value: 0, label: 'Não sei o que é isso' },
];
