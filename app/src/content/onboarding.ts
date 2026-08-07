import type { GlyphKey } from '../theme/icons';

export interface OnboardingSlide {
  chip: string;
  title: string;
  description: string;
  accent: string;
  tint: string;
  glow: string;
  /** Ângulo de rotação da ilustração, ex. `-5deg` — usado direto em `transform`. */
  rotate: string;
  glyph: GlyphKey;
}

/** Os 4 passos do onboarding (`OB` no protótipo), nesta ordem exata. */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    chip: 'Prevenção',
    title: 'Você está preparado para uma emergência digital?',
    description: 'Descubra como proteger suas contas, seus dados e sua família antes que um incidente aconteça.',
    accent: '#246BFD',
    tint: 'rgba(36,107,253,.10)',
    glow: 'rgba(36,107,253,.30)',
    rotate: '-5deg',
    glyph: 'shield',
  },
  {
    chip: 'Organização',
    title: 'Tenha um plano antes de precisar dele',
    description: 'Organize contas prioritárias, contatos de confiança e etapas de recuperação.',
    accent: '#123B5D',
    tint: 'rgba(18,59,93,.10)',
    glow: 'rgba(18,59,93,.28)',
    rotate: '4deg',
    glyph: 'plan',
  },
  {
    chip: 'Treino',
    title: 'Treine situações reais',
    description: 'Simule o roubo do celular, a invasão de uma conta e outras emergências digitais.',
    accent: '#2DBE78',
    tint: 'rgba(45,190,120,.12)',
    glow: 'rgba(45,190,120,.28)',
    rotate: '-3deg',
    glyph: 'play',
  },
  {
    chip: 'Resposta',
    title: 'Se algo acontecer, saiba o que fazer',
    description: 'Use checklists simples e acompanhe cada ação durante uma emergência.',
    accent: '#F4B740',
    tint: 'rgba(244,183,64,.14)',
    glow: 'rgba(244,183,64,.30)',
    rotate: '5deg',
    glyph: 'check',
  },
];
