export type Op =
  | { kind: 'create'; incidentId: string; scenarioId: string }
  | { kind: 'action'; incidentId: string; actionId: string; clientTimestamp: string }
  | { kind: 'close'; incidentId: string };

export interface FlushResult<T> {
  remaining: Op[];
  results: { op: Op; value: T }[];
  dropped: { op: Op; code: string }[];
}

function permanentError(error: unknown): error is { status: number; code: string } {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { status?: unknown; code?: unknown };
  return typeof candidate.status === 'number' && [400, 404, 409].includes(candidate.status) && typeof candidate.code === 'string';
}

/** Envia em FIFO. Erros permanentes saem da fila; os demais preservam a ordem. */
export async function flush<T>(queue: readonly Op[], send: (op: Op) => Promise<T>): Promise<FlushResult<T>> {
  const results: FlushResult<T>['results'] = [];
  const dropped: FlushResult<T>['dropped'] = [];
  for (let index = 0; index < queue.length; index += 1) {
    const op = queue[index];
    try {
      results.push({ op, value: await send(op) });
    } catch (error) {
      if (permanentError(error)) {
        dropped.push({ op, code: error.code });
        continue;
      }
      return { remaining: queue.slice(index), results, dropped };
    }
  }
  return { remaining: [], results, dropped };
}
