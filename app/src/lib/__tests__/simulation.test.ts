import { ROUBO_STEPS } from '../../content/simulations';
import { gradedStepCount, isCorrect, levelOf } from '../simulation';

it('grades choice, multi and order answers exactly while ignoring the intro', () => {
  expect(isCorrect(ROUBO_STEPS[0], null)).toBe(false);
  expect(isCorrect(ROUBO_STEPS[1], 1)).toBe(true);
  expect(isCorrect(ROUBO_STEPS[1], 0)).toBe(false);
  expect(isCorrect(ROUBO_STEPS[2], [0, 2, 4])).toBe(true);
  expect(isCorrect(ROUBO_STEPS[2], [4, 0, 2])).toBe(true);
  expect(isCorrect(ROUBO_STEPS[2], [0, 2])).toBe(false);
  expect(isCorrect(ROUBO_STEPS[2], [0, 2, 3])).toBe(false);
  expect(isCorrect(ROUBO_STEPS[2], [0, 2, 4, 4])).toBe(false);
  expect(isCorrect(ROUBO_STEPS[3], ['a', 'b', 'c'])).toBe(true);
  expect(isCorrect(ROUBO_STEPS[3], ['b', 'a', 'c'])).toBe(false);
  expect(isCorrect(ROUBO_STEPS[3], ['a', 'b'])).toBe(false);
  expect(gradedStepCount(ROUBO_STEPS)).toBe(5);
});

it('assigns result levels at the 80% and 50% thresholds', () => {
  expect(levelOf(4, 5)).toBe('Excelente resposta');
  expect(levelOf(3, 5)).toBe('Boa resposta');
  expect(levelOf(2, 5)).toBe('Reveja os passos');
  expect(levelOf(0, 0)).toBe('Reveja os passos');
});
