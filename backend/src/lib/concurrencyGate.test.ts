import { describe, expect, it } from 'vitest';
import { createConcurrencyGate } from './concurrencyGate.js';

/** Deixa o event loop drenar as continuações pendentes. */
const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('createConcurrencyGate', () => {
  it('nunca deixa passar mais tarefas simultâneas que o limite', async () => {
    const gate = createConcurrencyGate(2);
    const liberar: Array<() => void> = [];
    let simultaneas = 0;
    let pico = 0;

    const tarefa = () =>
      gate.run(async () => {
        simultaneas += 1;
        pico = Math.max(pico, simultaneas);
        await new Promise<void>((resolve) => liberar.push(resolve));
        simultaneas -= 1;
      });

    const todas = Array.from({ length: 5 }, tarefa);
    await flush();
    expect(pico).toBe(2);

    while (liberar.length > 0) {
      liberar.shift()?.();
      await flush();
    }

    await Promise.all(todas);
    expect(pico).toBe(2);
    expect(gate.running).toBe(0);
  });

  it('devolve o slot quando a tarefa rejeita', async () => {
    const gate = createConcurrencyGate(1);

    await expect(gate.run(async () => Promise.reject(new Error('falhou')))).rejects.toThrow('falhou');
    expect(gate.running).toBe(0);
    await expect(gate.run(async () => 'liberou')).resolves.toBe('liberou');
  });

  it('recusa limite abaixo de 1, que travaria tudo em silêncio', () => {
    expect(() => createConcurrencyGate(0)).toThrow();
  });
});
