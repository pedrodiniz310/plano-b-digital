export interface ConcurrencyGate {
  run<T>(task: () => Promise<T>): Promise<T>;
  /** Quantas tarefas ocupam slot agora — usado só em teste e diagnóstico. */
  readonly running: number;
}

/**
 * Teto de execuções simultâneas. Existe por causa do argon2: cada hash aloca
 * `memoryCost` de uma vez, então sem teto o número de requisições concorrentes
 * vira o multiplicador da memória do processo. O rate limit por IP não cobre
 * isso sozinho — várias origens somam.
 */
export function createConcurrencyGate(limit: number): ConcurrencyGate {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('createConcurrencyGate: limite precisa ser inteiro >= 1.');
  }

  let running = 0;
  const waiting: Array<() => void> = [];

  return {
    get running() {
      return running;
    },

    async run<T>(task: () => Promise<T>): Promise<T> {
      if (running < limit) {
        running += 1;
      } else {
        await new Promise<void>((resolve) => waiting.push(resolve));
      }

      try {
        return await task();
      } finally {
        // O slot passa direto pro próximo da fila. Decrementar e deixar que ele
        // readquira abriria uma janela pra um recém-chegado furar o limite.
        const next = waiting.shift();
        if (next) next();
        else running -= 1;
      }
    },
  };
}
