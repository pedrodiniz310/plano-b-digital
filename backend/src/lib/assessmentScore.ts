export const ASSESSMENT_QUESTION_COUNT = 10;

export const OPTION_SCORES = [1, 0.6, 0, 0] as const;

export function baseScoreOf(answers: Record<string, number>): number {
  const total = Object.values(answers).reduce((score, optionIndex) => score + OPTION_SCORES[optionIndex]!, 0);
  return Math.round((total / ASSESSMENT_QUESTION_COUNT) * 100);
}
