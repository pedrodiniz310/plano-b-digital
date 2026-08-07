import { ANSWER_OPTIONS, CATEGORIES, QUESTIONS, type CategoryId } from '../content/questions';

/** Índice da pergunta (posição em QUESTIONS) → índice da opção escolhida (posição em ANSWER_OPTIONS). */
export type Answers = Record<number, number>;

function optionValue(answers: Answers, questionIndex: number): number {
  const optionIndex = answers[questionIndex];
  return optionIndex === undefined ? 0 : (ANSWER_OPTIONS[optionIndex]?.value ?? 0);
}

/** Pontuação-base do Teste de Prontidão (0-100). Fórmula do handoff: `round(soma/10*100)`. */
export function baseScoreOf(answers: Answers): number {
  const sum = QUESTIONS.reduce((total, _q, i) => total + optionValue(answers, i), 0);
  return Math.round((sum / QUESTIONS.length) * 100);
}

/** Pontuação por área de diagnóstico (0-100 cada), mesma fórmula restrita à categoria. */
export function categoryScores(answers: Answers): Record<CategoryId, number> {
  const out = {} as Record<CategoryId, number>;
  for (const cat of CATEGORIES) {
    const indices = QUESTIONS.reduce<number[]>((acc, q, i) => {
      if (q.categoryId === cat.id) acc.push(i);
      return acc;
    }, []);
    const sum = indices.reduce((total, i) => total + optionValue(answers, i), 0);
    out[cat.id] = indices.length ? Math.round((sum / indices.length) * 100) : 0;
  }
  return out;
}

/**
 * Prontidão "ao vivo" (0-100): pontuação-base + reforço por tarefas e
 * simulações concluídas, capado em 100. Derivada sempre destes 3 fatos —
 * nunca armazenada (ver docs/decisions/0004-modelo-de-dados-e-sync.md).
 */
export function readinessScore(input: {
  baseScore: number | null;
  completedTaskCount: number;
  completedSimulationCount: number;
}): number {
  const base = input.baseScore ?? 0;
  return Math.min(100, base + input.completedTaskCount * 4 + input.completedSimulationCount * 3);
}

export interface ReadinessLevel {
  label: string;
  color: string;
  description: string;
}

/** As 4 faixas de prontidão do handoff, nesta ordem. */
export function levelOf(score: number): ReadinessLevel {
  if (score >= 85) return { label: 'Preparado', color: '#2DBE78', description: 'Você tem um plano sólido. Mantenha a revisão em dia.' };
  if (score >= 70) return { label: 'Bem preparado', color: '#246BFD', description: 'Boa base construída. Faltam poucos pontos críticos.' };
  if (score >= 40) return { label: 'Em construção', color: '#F4B740', description: 'Você já deu passos importantes, mas há brechas relevantes.' };
  return { label: 'Início da jornada', color: '#E5484D', description: 'Há riscos importantes em aberto. Comece pelas tarefas críticas.' };
}

export interface PriorityRisk {
  title: string;
  description: string;
}

/**
 * Riscos prioritários, ordem de precedência fixa (códigos de recuperação →
 * contato de confiança → proteção do e-mail → IMEI), máx. 3. Uma resposta
 * "parcial" (peso 0.6) também conta como risco — não só "não"/"não sei".
 */
export function priorityRisks(answers: Answers): PriorityRisk[] {
  const flagged = (questionIndex: number) => {
    const optionIndex = answers[questionIndex];
    return optionIndex === undefined || (ANSWER_OPTIONS[optionIndex]?.value ?? 0) < 1;
  };

  const candidates: [number, PriorityRisk][] = [
    [2, { title: 'Códigos de recuperação não armazenados', description: 'Sem eles, uma conta com dois fatores pode ficar inacessível para sempre.' }],
    [6, { title: 'Nenhum contato de confiança configurado', description: 'Ninguém poderá confirmar sua identidade ou agir junto com você.' }],
    [1, { title: 'E-mail principal sem proteção suficiente', description: 'Quem entra no seu e-mail recupera a senha de quase todas as outras contas.' }],
    [4, { title: 'IMEI do aparelho não registrado', description: 'O bloqueio definitivo do aparelho depende desse número.' }],
  ];

  return candidates.filter(([i]) => flagged(i)).map(([, risk]) => risk).slice(0, 3);
}
