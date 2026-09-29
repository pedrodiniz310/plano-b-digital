import type { GlyphKey } from '../theme/icons';

export type Difficulty = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Simulation {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  durationLabel: string;
  stepsCount: number;
  points: number;
  glyph: GlyphKey;
  /** Só `roubo` tem `STEPS` reais no marco 1 — as demais são metadado "em breve". */
  playable: boolean;
}

/** As 8 simulações (`SIMS` no protótipo). */
export const SIMULATIONS: Simulation[] = [
  { id: 'roubo', title: 'Roubaram meu celular', category: 'Aparelho', difficulty: 'Iniciante', durationLabel: '6 min', stepsCount: 6, points: 60, glyph: 'phone', playable: true },
  { id: 'zap', title: 'Meu WhatsApp foi invadido', category: 'Contas', difficulty: 'Iniciante', durationLabel: '5 min', stepsCount: 5, points: 50, glyph: 'chat', playable: false },
  { id: 'email', title: 'Meu e-mail foi comprometido', category: 'Contas', difficulty: 'Intermediário', durationLabel: '7 min', stepsCount: 6, points: 70, glyph: 'mail', playable: false },
  { id: 'auth', title: 'Perdi acesso ao autenticador', category: 'Contas', difficulty: 'Intermediário', durationLabel: '5 min', stepsCount: 5, points: 55, glyph: 'key', playable: false },
  { id: 'pix', title: 'Fiz um Pix para um golpista', category: 'Fraudes', difficulty: 'Intermediário', durationLabel: '6 min', stepsCount: 6, points: 65, glyph: 'card', playable: false },
  { id: 'familia', title: 'Um familiar pediu dinheiro por mensagem', category: 'Família', difficulty: 'Iniciante', durationLabel: '4 min', stepsCount: 4, points: 45, glyph: 'users', playable: false },
  { id: 'social', title: 'Minha rede social foi invadida', category: 'Contas', difficulty: 'Iniciante', durationLabel: '5 min', stepsCount: 5, points: 50, glyph: 'globe', playable: false },
  { id: 'docs', title: 'Meus documentos foram expostos', category: 'Privacidade', difficulty: 'Avançado', durationLabel: '8 min', stepsCount: 7, points: 80, glyph: 'doc', playable: false },
];

interface StepBase {
  title: string;
}

export interface IntroStep extends StepBase {
  type: 'intro';
  description: string;
}

export interface ChoiceOption {
  label: string;
  correct: boolean;
}

export interface ChoiceStep extends StepBase {
  type: 'choice';
  options: ChoiceOption[];
  feedbackOk: string;
  feedbackNo: string;
}

export interface MultiStep extends StepBase {
  type: 'multi';
  hint: string;
  options: ChoiceOption[];
  feedbackOk: string;
  feedbackNo: string;
}

export interface OrderItem {
  id: string;
  label: string;
}

export interface OrderStep extends StepBase {
  type: 'order';
  hint: string;
  items: OrderItem[];
  /** Sequência correta, como ids de `items`. */
  order: string[];
  feedbackOk: string;
  feedbackNo: string;
}

export type SimulationStep = IntroStep | ChoiceStep | MultiStep | OrderStep;

/**
 * As 6 etapas da simulação jogável "Roubaram meu celular" (`STEPS` no
 * protótipo, simulação `roubo`), nesta ordem exata.
 */
export const ROUBO_STEPS: SimulationStep[] = [
  {
    type: 'intro',
    title: 'Você acabou de perceber que seu celular foi roubado',
    description: 'O aparelho está desbloqueado e contém aplicativos bancários, e-mail e redes sociais. Cada minuto conta — e a ordem das ações importa mais do que a pressa.',
  },
  {
    type: 'choice',
    title: 'O que você deve proteger primeiro?',
    options: [
      { label: 'Minha rede social', correct: false },
      { label: 'Meu e-mail principal', correct: true },
      { label: 'O aplicativo de música', correct: false },
      { label: 'A galeria de fotos', correct: false },
    ],
    feedbackOk: 'Correto. O e-mail principal costuma ser utilizado para recuperar o acesso às demais contas.',
    feedbackNo: 'Quase. Proteger o e-mail principal vem antes: é por ele que o golpista redefine a senha de todas as outras contas.',
  },
  {
    type: 'multi',
    title: 'Quais ações fazem parte da contenção imediata?',
    hint: 'Selecione as 3 corretas',
    options: [
      { label: 'Bloquear o chip na operadora', correct: true },
      { label: 'Publicar um aviso nas redes sociais', correct: false },
      { label: 'Encerrar as sessões abertas do e-mail', correct: true },
      { label: 'Trocar a foto do perfil', correct: false },
      { label: 'Avisar o banco sobre o risco de fraude', correct: true },
    ],
    feedbackOk: 'Isso. Chip, e-mail e banco são a tríade da primeira hora.',
    feedbackNo: 'Publicações e ajustes de perfil podem esperar. Chip, e-mail e banco vêm primeiro.',
  },
  {
    type: 'order',
    title: 'Coloque as três primeiras ações na ordem certa',
    hint: 'Toque para montar a sequência',
    items: [
      { id: 'a', label: 'Proteger o e-mail principal' },
      { id: 'b', label: 'Bloquear o chip com a operadora' },
      { id: 'c', label: 'Avisar o banco e travar transações' },
    ],
    order: ['a', 'b', 'c'],
    feedbackOk: 'Boa sequência. Primeiro a conta que recupera as outras, depois o canal dos códigos, depois o dinheiro.',
    feedbackNo: 'A ordem ideal é: e-mail principal, bloqueio do chip e, então, o banco.',
  },
  {
    type: 'choice',
    title: 'Você recebe uma ligação: dizem ser do seu banco e pedem a senha para "cancelar" uma transferência.',
    options: [
      { label: 'Informo a senha para agilizar', correct: false },
      { label: 'Desligo e ligo para o canal oficial que registrei', correct: true },
      { label: 'Peço que enviem um link por mensagem', correct: false },
    ],
    feedbackOk: 'Exato. Nenhum banco pede senha por telefone. Ligar para o canal oficial é sempre a saída segura.',
    feedbackNo: 'Cuidado: bancos nunca pedem senha por telefone. O caminho seguro é desligar e ligar para o canal oficial.',
  },
  {
    type: 'choice',
    title: 'Antes de encerrar, o que garante seus direitos depois?',
    options: [
      { label: 'Apagar as conversas para evitar exposição', correct: false },
      { label: 'Registrar o boletim de ocorrência e guardar comprovantes', correct: true },
      { label: 'Esperar alguns dias para ver o que acontece', correct: false },
    ],
    feedbackOk: 'Isso mesmo. Registro e evidências sustentam contestações e bloqueios definitivos.',
    feedbackNo: 'Preservar evidências e registrar o ocorrido é o que sustenta contestações no banco e nas plataformas.',
  },
];

/** Quatro aprendizados do resultado (`vSimResult` no protótipo). */
export const ROUBO_LEARNINGS = [
  'O e-mail principal é a primeira conta a proteger.',
  'Bloquear o chip interrompe os códigos por SMS.',
  'Nenhum banco pede senha por telefone.',
  'Registro e evidências sustentam contestações.',
] as const;
