import { EMERGENCY_PLANS, type EmergencyAction, type EmergencyPlan } from '../content/emergency';

/** Cenário → plano dedicado, ou `generico` se não houver um específico (7 dos 9 cenários caem aqui). */
export function planFor(scenarioId: string): EmergencyPlan {
  return scenarioId === 'celular' ? EMERGENCY_PLANS.celular : EMERGENCY_PLANS.generico;
}

export function allActions(plan: EmergencyPlan): EmergencyAction[] {
  return [...plan.now, ...plan.next, ...plan.later];
}
