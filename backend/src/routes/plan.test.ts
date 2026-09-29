import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import type { PrismaClient } from '../generated/prisma/client.js';

process.env.JWT_ACCESS_SECRET ??= 'segredo-de-teste-sem-valor-fora-daqui';

type Row = { userId: string; taskId: string; completed: boolean; completedAt: Date | null };

function prismaStub() {
  const rows: Row[] = [];
  const prisma = {
    taskState: {
      findMany: async ({ where }: { where: { userId: string } }) => rows.filter((row) => row.userId === where.userId),
      upsert: async (args: {
        where: { userId_taskId: { userId: string; taskId: string } };
        create: Row;
        update: Pick<Row, 'completed' | 'completedAt'>;
      }) => {
        const { userId, taskId } = args.where.userId_taskId;
        let row = rows.find((item) => item.userId === userId && item.taskId === taskId);
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

describe('rotas do plano', () => {
  it('requires authentication on GET and PATCH', async () => {
    const server = await startApp(prismaStub().prisma);
    const get = await server.inject({ method: 'GET', url: '/plan' });
    const patch = await server.inject({ method: 'PATCH', url: '/plan/tasks/t1', payload: { completed: true } });
    expect(get.statusCode).toBe(401);
    expect(patch.statusCode).toBe(401);
  });

  it('rejects task ids outside t1..t15 and a missing boolean', async () => {
    const server = await startApp(prismaStub().prisma);
    const headers = await authHeader(server);
    for (const taskId of ['t0', 't16', 't01', 'other']) {
      const response = await server.inject({ method: 'PATCH', url: `/plan/tasks/${taskId}`, headers, payload: { completed: true } });
      expect(response.statusCode).toBe(400);
    }
    const response = await server.inject({ method: 'PATCH', url: '/plan/tasks/t1', headers, payload: {} });
    expect(response.statusCode).toBe(400);
  });

  it('sets completedAt on completion, clears it on reopen, and returns only the user rows', async () => {
    const { prisma, rows } = prismaStub();
    const server = await startApp(prisma);
    const headers = await authHeader(server);
    const completed = await server.inject({ method: 'PATCH', url: '/plan/tasks/t1', headers, payload: { completed: true } });
    expect(completed.statusCode).toBe(200);
    expect(completed.json()).toEqual({ taskId: 't1', completed: true, completedAt: expect.any(String) });
    expect(new Date(completed.json().completedAt).toISOString()).toBe(completed.json().completedAt);

    rows.push({ userId: 'other-user', taskId: 't2', completed: true, completedAt: new Date() });
    const get = await server.inject({ method: 'GET', url: '/plan', headers });
    expect(get.statusCode).toBe(200);
    expect(get.json()).toEqual({ tasks: [completed.json()] });

    const reopened = await server.inject({ method: 'PATCH', url: '/plan/tasks/t1', headers, payload: { completed: false } });
    expect(reopened.statusCode).toBe(200);
    expect(reopened.json()).toEqual({ taskId: 't1', completed: false, completedAt: null });
    expect(rows.filter((row) => row.userId === 'user-1')).toHaveLength(1);
  });
});
