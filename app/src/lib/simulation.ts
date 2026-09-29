import type { SimulationStep } from '../content/simulations';

export type SimulationAnswer = number | number[] | string[];

export function isCorrect(step: SimulationStep, answer: SimulationAnswer | null): boolean {
  switch (step.type) {
    case 'intro':
      return false;
    case 'choice':
      return typeof answer === 'number' && step.options[answer]?.correct === true;
    case 'multi': {
      if (!Array.isArray(answer) || !answer.every((value) => typeof value === 'number')) return false;
      const selected = new Set(answer);
      return selected.size === answer.length &&
        selected.size === step.options.filter((option) => option.correct).length &&
        step.options.every((option, index) => selected.has(index) === option.correct);
    }
    case 'order':
      return Array.isArray(answer) && answer.length === step.order.length &&
        step.order.every((id, index) => answer[index] === id);
  }
}

export function gradedStepCount(steps: readonly SimulationStep[]): number {
  return steps.filter((step) => step.type !== 'intro').length;
}

export function levelOf(hits: number, total: number): 'Excelente resposta' | 'Boa resposta' | 'Reveja os passos' {
  const percent = total > 0 ? hits / total : 0;
  if (percent >= 0.8) return 'Excelente resposta';
  if (percent >= 0.5) return 'Boa resposta';
  return 'Reveja os passos';
}
