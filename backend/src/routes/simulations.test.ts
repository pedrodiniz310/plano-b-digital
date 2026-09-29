import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import type { PrismaClient } from '../generated/prisma/client.js';

process.env.JWT_ACCESS_SECRET ??= 'segredo-de-teste-sem-valor-fora-daqui';

type Row = { userId: string; simulationId: string; hits: number; timeSeconds: number; completedAt: Date };

function prismaStub() {
  const rows: Row[] = [];
  const prisma = {
    simulationResult: {
      findMany: async ({ where }: { where: { userId: string } }) => rows.filter((row) => row.userId === where.userId),
      upsert: async (args: {
        where: { userId_simulationId: { userId: string; simulationId: string } };
        create: Row;
        update: Pick<Row, 'hits' | 'timeSeconds' | 'completedAt'>;
      }) => {
        const { userId, simulationId } = args.where.userId_simulationId;
        let row = rows.find((item) => item.userId === userId && item.simulationId === simulationId);
        if (row) Object.assign(row, args.update);
        else {
          row = args.create;
          rows.push(row);
        }
        return row;
      },
    },
  } as unknown as PrismaClient;
  return { prisma, rows };
}

let app: FastifyInstance | null = null;

async function startApp(prisma: PrismaClient): Promise<FastifyInstance> {
  app = await buildApp({ prisma, logger: false });
  await app.ready();
  return app;
}

async function authHeader(server: FastifyInstance, userId = 'user-1') {
  return { authorization: `Bearer ${await server.jwt.sign({ sub: userId })}` };
}

afterEach(async () => {
  await app?.close();
  app = null;
});

describe('rotas de resultados das simulações', () => {
  it('requires authentication on GET and POST', async () => {
    const server = await startApp(prismaStub().prisma);
    const get = await server.inject({ method: 'GET', url: '/simulations/results' });
    const post = await server.inject({ method: 'POST', url: '/simulations/roubo/results', payload: { hits: 4, timeSeconds: 60 } });
    expect(get.statusCode).toBe(401);
    expect(post.statusCode).toBe(401);
  });

  it('rejects unknown ids and invalid hit/time values', async () => {
    const server = await startApp(prismaStub().prisma);
    const headers = await authHeader(server);
    const invalidCases = [
      { id: 'outro', payload: { hits: 4, timeSeconds: 60 } },
      { id: 'roubo', payload: { hits: -1, timeSeconds: 60 } },
      { id: 'roubo', payload: { hits: 21, timeSeconds: 60 } },
      { id: 'roubo', payload: { hits: 1.5, timeSeconds: 60 } },
      { id: 'roubo', payload: { hits: 4, timeSeconds: -1 } },
      { id: 'roubo', payload: { hits: 4, timeSeconds: 7201 } },
      { id: 'roubo', payload: { hits: 4, timeSeconds: 1.5 } },
      { id: 'roubo', payload: { hits: '4', timeSeconds: 60 } },
    ];
    for (const { id, payload } of invalidCases) {
      const response = await server.inject({ method: 'POST', url: `/simulations/${id}/results`, headers, payload });
      expect(response.statusCode).toBe(400);
    }
  });

  it('upserts a result with server time and scopes reads and writes by user', async () => {
    const { prisma, rows } = prismaStub();
    const server = await startApp(prisma);
    const headers = await authHeader(server);
    const before = Date.now();
    const first = await server.inject({ method: 'POST', url: '/simulations/roubo/results', headers, payload: { hits: 3, timeSeconds: 72 } });
    const after = Date.now();
    expect(first.statusCode).toBe(200);
    expect(first.json()).toEqual({ simulationId: 'roubo', hits: 3, timeSeconds: 72, completedAt: expect.any(String) });
    expect(new Date(first.json().completedAt).getTime()).toBeGreaterThanOrEqual(before);
    expect(new Date(first.json().completedAt).getTime()).toBeLessThanOrEqual(after);

    rows.push({ userId: 'other-user', simulationId: 'roubo', hits: 1, timeSeconds: 30, completedAt: new Date(0) });
    const get = await server.inject({ method: 'GET', url: '/simulations/results', headers });
    expect(get.statusCode).toBe(200);
    expect(get.json()).toEqual({ results: [first.json()] });

    const second = await server.inject({ method: 'POST', url: '/simulations/roubo/results', headers, payload: { hits: 5, timeSeconds: 50 } });
    expect(second.statusCode).toBe(200);
    expect(second.json()).toEqual({ simulationId: 'roubo', hits: 5, timeSeconds: 50, completedAt: expect.any(String) });
    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.userId === 'other-user')?.hits).toBe(1);
    expect(rows.find((row) => row.userId === 'user-1')?.hits).toBe(5);
  });
});
