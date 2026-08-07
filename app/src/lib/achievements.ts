import { ACHIEVEMENTS, type AchievementDef, type AchievementId } from '../content/achievements';
import { TASKS } from '../content/plan';

export interface AchievementProgressInput {
  assessmentDone: boolean;
  completedTaskIds: ReadonlySet<string>;
  hasTrustedContact: boolean;
  completedSimulationCount: number;
  readinessScore: number;
}

const EMAIL_TASK_IDS = TASKS.filter((t) => t.planCategoryId === 'email').map((t) => t.id);

/**
 * Condição de desbloqueio por conquista — dado, não mais `if` posicional
 * hardcoded (o protótipo checava isso inline em `achievements()`).
 */
const CONDITIONS: Record<AchievementId, (input: AchievementProgressInput) => boolean> = {
  a1: (i) => i.assessmentDone,
  a2: (i) => EMAIL_TASK_IDS.every((id) => i.completedTaskIds.has(id)),
  a3: (i) => i.completedTaskIds.size >= Math.ceil(TASKS.length / 2),
  a4: (i) => i.hasTrustedContact,
  a5: (i) => i.completedSimulationCount > 0,
  a6: (i) => i.readinessScore >= 80,
};

export interface AchievementProgress extends AchievementDef {
  unlocked: boolean;
}

export function evaluateAchievements(input: AchievementProgressInput): AchievementProgress[] {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: CONDITIONS[achievement.id](input),
  }));
}
