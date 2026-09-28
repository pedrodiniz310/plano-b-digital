import { describe, expect, it } from 'vitest';
import { baseScoreOf } from './assessmentScore.js';

function answersFor(option: number): Record<string, number> {
  return Object.fromEntries(Array.from({ length: 10 }, (_, index) => [String(index), option]));
}

describe('baseScoreOf', () => {
  it('returns 100 for all Sim answers', () => {
    expect(baseScoreOf(answersFor(0))).toBe(100);
  });

  it('returns 0 for all Não answers', () => {
    expect(baseScoreOf(answersFor(2))).toBe(0);
  });

  it('returns 60 for all Parcialmente answers', () => {
    expect(baseScoreOf(answersFor(1))).toBe(60);
  });

  it('calculates a mixed set of answers', () => {
    expect(baseScoreOf({ '0': 0, '1': 1, '2': 2, '3': 3, '4': 0, '5': 1, '6': 2, '7': 3, '8': 0, '9': 1 })).toBe(48);
  });
});
