import { flush, type Op } from '../outbox';

const queue: Op[] = [
  { kind: 'create', incidentId: 'incident-1', scenarioId: 'celular' },
  { kind: 'action', incidentId: 'incident-1', actionId: 'c1', clientTimestamp: '2026-09-29T10:00:00.000Z' },
  { kind: 'close', incidentId: 'incident-1' },
];

it('sends all operations in FIFO order and empties the queue', async () => {
  const seen: Op[] = [];
  const result = await flush(queue, async (op) => { seen.push(op); return op.kind; });
  expect(seen).toEqual(queue);
  expect(result.remaining).toEqual([]);
  expect(result.results.map((entry) => entry.value)).toEqual(['create', 'action', 'close']);
});

it('keeps the failed operation and all later operations after a network failure', async () => {
  const seen: Op[] = [];
  const result = await flush(queue, async (op) => {
    seen.push(op);
    if (op.kind === 'action') throw new TypeError('network unavailable');
    return op.kind;
  });
  expect(seen).toEqual(queue.slice(0, 2));
  expect(result.remaining).toEqual(queue.slice(1));
  expect(result.results).toHaveLength(1);
});

it.each([400, 404, 409])('drops a %i poison pill, reports its code and continues', async (status) => {
  const result = await flush(queue, async (op) => {
    if (op.kind === 'action') throw { status, code: 'invalid_action' };
    return op.kind;
  });
  expect(result.remaining).toEqual([]);
  expect(result.dropped).toEqual([{ op: queue[1], code: 'invalid_action' }]);
  expect(result.results.map((entry) => entry.value)).toEqual(['create', 'close']);
});

it.each([401, 500, 503])('stops at a %i response', async (status) => {
  const result = await flush(queue, async (op) => {
    if (op.kind === 'action') throw { status, code: 'retry_later' };
    return op.kind;
  });
  expect(result.remaining).toEqual(queue.slice(1));
});

it('can replay an already-synced operation without duplicating the server result', async () => {
  const stored = new Map<string, string>();
  const send = async (op: Op) => {
    const key = JSON.stringify(op);
    if (!stored.has(key)) stored.set(key, new Date(0).toISOString());
    return stored.get(key)!;
  };
  const first = await flush(queue, send);
  const replay = await flush(queue, send);
  expect(replay.remaining).toEqual([]);
  expect(replay.results).toEqual(first.results);
  expect(stored.size).toBe(3);
});
