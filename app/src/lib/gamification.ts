/**
 * Pontos de gamificação — derivados, nunca somados/subtraídos imperativamente
 * (o protótipo faz `points + 20` / `points - 20` em 4 pontos diferentes do
 * código; aqui é sempre recalculado a partir dos mesmos fatos que
 * `readinessScore`/`achievements`, eliminando dessincronia). Valores do
 * handoff: teste +40, tarefa +20 cada, contato +30, simulação +60 cada.
 */
export function totalPoints(input: {
  assessmentDone: boolean;
  completedTaskCount: number;
  hasTrustedContact: boolean;
  completedSimulationCount: number;
}): number {
  return (
    (input.assessmentDone ? 40 : 0) +
    input.completedTaskCount * 20 +
    (input.hasTrustedContact ? 30 : 0) +
    input.completedSimulationCount * 60
  );
}
