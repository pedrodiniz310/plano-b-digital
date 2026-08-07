import { QUESTIONS } from '../../content/questions';
import { baseScoreOf, levelOf, priorityRisks, readinessScore, type Answers } from '../scoring';

const ALL_SIM: Answers = Object.fromEntries(QUESTIONS.map((_q, i) => [i, 0]));

describe('baseScoreOf', () => {
  it('dá 100 quando todas as respostas são "sim"', () => {
    expect(baseScoreOf(ALL_SIM)).toBe(100);
  });

  it('dá 0 quando não há respostas', () => {
    expect(baseScoreOf({})).toBe(0);
  });

  it('pondera resposta "parcial" (0.6) proporcionalmente', () => {
    const answers: Answers = { 0: 1 }; // índice 1 = 'parcial'
    expect(baseScoreOf(answers)).toBe(6); // round(0.6/10*100)
  });
});

describe('readinessScore', () => {
  it('soma reforço de tarefas e simulações, capado em 100', () => {
    expect(readinessScore({ baseScore: 90, completedTaskCount: 5, completedSimulationCount: 5 })).toBe(100);
    expect(readinessScore({ baseScore: 50, completedTaskCount: 2, completedSimulationCount: 1 })).toBe(61);
  });

  it('trata baseScore nulo (teste ainda não feito) como 0', () => {
    expect(readinessScore({ baseScore: null, completedTaskCount: 0, completedSimulationCount: 0 })).toBe(0);
  });
});

describe('levelOf', () => {
  it.each([
    [85, 'Preparado'],
    [70, 'Bem preparado'],
    [40, 'Em construção'],
    [0, 'Início da jornada'],
  ])('score %i vira "%s"', (score, label) => {
    expect(levelOf(score).label).toBe(label);
  });
});

describe('priorityRisks', () => {
  it('sem respostas, retorna os 3 primeiros na ordem de precedência do handoff', () => {
    const risks = priorityRisks({});
    expect(risks.map((r) => r.title)).toEqual([
      'Códigos de recuperação não armazenados',
      'Nenhum contato de confiança configurado',
      'E-mail principal sem proteção suficiente',
    ]);
  });

  it('resposta "parcial" (peso < 1) ainda conta como risco', () => {
    // índice 2 = pergunta de códigos de recuperação; opção 1 = 'parcial'.
    const risks = priorityRisks({ 2: 1 });
    expect(risks.some((r) => r.title === 'Códigos de recuperação não armazenados')).toBe(true);
  });

  it('todas as respostas "sim" não geram nenhum risco', () => {
    expect(priorityRisks(ALL_SIM)).toEqual([]);
  });
});
