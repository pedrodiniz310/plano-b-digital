import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import type { PrismaClient } from '../generated/prisma/client.js';

process.env.JWT_ACCESS_SECRET ??= 'segredo-de-teste-sem-valor-fora-daqui';

type Action = { actionId: string; completedAt: Date; clientTimestamp: Date | null; incidentId: string };
type Incident = { id: string; userId: string; scenarioId: string; startedAt: Date; closedAt: Date | null; actions: Action[] };
const id = 'e643fe85-54c1-45b3-a1ea-4742e0bcf6e3';
const otherId = '6b2270be-c7e3-4aa2-a5b9-7972ad163984';

function prismaStub() {
  const rows: Incident[] = [];
  const prisma = {
    incident: {
      findFirst: async ({ where }: { where: { id: string; userId: string } }) => rows.find((row) => row.id === where.id && row.userId === where.userId) ?? null,
      create: async ({ data }: { data: { id: string; userId: string; scenarioId: string } }) => {
        if (rows.some((row) => row.id === data.id)) throw { code: 'P2002' };
        const row: Incident = { ...data, startedAt: new Date(), closedAt: null, actions: [] };
        rows.push(row);
        return row;
      },
      updateMany: async ({ where, data }: { where: { id: string; userId: string; closedAt: null }; data: { closedAt: Date } }) => {
        const row = rows.find((item) => item.id === where.id && item.userId === where.userId && item.closedAt === null);
        if (row) row.closedAt = data.closedAt;
        return { count: row ? 1 : 0 };
      },
    },
    incidentAction: {
      upsert: async ({ where, create }: { where: { incidentId_actionId: { incidentId: string; actionId: string } }; create: Action }) => {
        const { incidentId, actionId } = where.incidentId_actionId;
        const incident = rows.find((row) => row.id === incidentId)!;
        let action = incident.actions.find((item) => item.actionId === actionId);
        if (!action) { action = create; incident.actions.push(action); }
        return action;
      },
    },
  } as unknown as PrismaClient;
  return { prisma, rows };
}

let app: FastifyInstance | null = null;
async function startApp(prisma: PrismaClient) { app = await buildApp({ prisma, logger: false }); await app.ready(); return app; }
async function headers(server: FastifyInstance, sub = 'user-1') { return { authorization: `Bearer ${await server.jwt.sign({ sub })}` }; }
afterEach(async () => { await app?.close(); app = null; });

describe('rotas de atendimento', () => {
  it('requires auth on every route', async () => {
    const server = await startApp(prismaStub().prisma);
    for (const [method, url, payload] of [
      ['POST', '/incidents', { id, scenarioId: 'celular' }],
      ['POST', `/incidents/${id}/actions`, { actionId: 'c1', clientTimestamp: new Date().toISOString() }],
      ['POST', `/incidents/${id}/close`, undefined],
      ['GET', `/incidents/${id}`, undefined],
    ] as const) {
      expect((await server.inject({ method, url, payload })).statusCode).toBe(401);
    }
  });

  it('validates UUID, scenario and action plan', async () => {
    const server = await startApp(prismaStub().prisma);
    const auth = await headers(server);
    expect((await server.inject({ method: 'POST', url: '/incidents', headers: auth, payload: { id: 'bad', scenarioId: 'celular' } })).statusCode).toBe(400);
    expect((await server.inject({ method: 'POST', url: '/incidents', headers: auth, payload: { id: 'e643fe85-54c1-15b3-a1ea-4742e0bcf6e3', scenarioId: 'celular' } })).statusCode).toBe(400);
    expect((await server.inject({ method: 'POST', url: '/incidents', headers: auth, payload: { id, scenarioId: 'desconhecido' } })).statusCode).toBe(400);
    expect((await server.inject({ method: 'GET', url: '/incidents/bad', headers: auth })).statusCode).toBe(400);
    await server.inject({ method: 'POST', url: '/incidents', headers: auth, payload: { id, scenarioId: 'zap' } });
    expect((await server.inject({ method: 'POST', url: `/incidents/${id}/actions`, headers: auth, payload: { actionId: 'c1', clientTimestamp: new Date().toISOString() } })).statusCode).toBe(400);
    expect((await server.inject({ method: 'POST', url: `/incidents/${id}/actions`, headers: auth, payload: { actionId: 'g1', clientTimestamp: 'yesterday' } })).statusCode).toBe(400);
  });

  it('creates idempotently, rejects another owner and never reveals their incident', async () => {
    const { prisma, rows } = prismaStub();
    const server = await startApp(prisma);
    const auth = await headers(server);
    const payload = { id, scenarioId: 'celular' };
    const first = await server.inject({ method: 'POST', url: '/incidents', headers: auth, payload });
    expect(first.statusCode).toBe(200);
    expect(first.json()).toEqual({ id, scenarioId: 'celular', startedAt: expect.any(String), closedAt: null, actions: [] });
    const replay = await server.inject({ method: 'POST', url: '/incidents', headers: auth, payload: { ...payload, scenarioId: 'zap' } });
    expect(replay.json()).toEqual(first.json());
    expect(rows).toHaveLength(1);
    const other = await headers(server, 'user-2');
    const conflict = await server.inject({ method: 'POST', url: '/incidents', headers: other, payload });
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json().code).toBe('incident_conflict');
    expect((await server.inject({ method: 'GET', url: `/incidents/${id}`, headers: other })).json().code).toBe('incident_not_found');
    expect((await server.inject({ method: 'POST', url: `/incidents/${id}/close`, headers: other })).statusCode).toBe(404);
    expect((await server.inject({ method: 'POST', url: `/incidents/${id}/actions`, headers: other, payload: { actionId: 'c1', clientTimestamp: new Date().toISOString() } })).statusCode).toBe(404);
  });

  it('keeps first server timestamp on action replay, even after idempotent close', async () => {
    const { prisma, rows } = prismaStub();
    const server = await startApp(prisma);
    const auth = await headers(server);
    await server.inject({ method: 'POST', url: '/incidents', headers: auth, payload: { id: otherId, scenarioId: 'celular' } });
    const first = await server.inject({ method: 'POST', url: `/incidents/${otherId}/actions`, headers: auth, payload: { actionId: 'c1', clientTimestamp: '2026-09-29T10:00:00.000Z' } });
    expect(first.statusCode).toBe(200);
    const closed = await server.inject({ method: 'POST', url: `/incidents/${otherId}/close`, headers: auth });
    expect(closed.statusCode).toBe(200);
    const replayClose = await server.inject({ method: 'POST', url: `/incidents/${otherId}/close`, headers: auth });
    expect(replayClose.json().closedAt).toBe(closed.json().closedAt);
    const replayAction = await server.inject({ method: 'POST', url: `/incidents/${otherId}/actions`, headers: auth, payload: { actionId: 'c1', clientTimestamp: '2026-09-29T11:00:00.000Z' } });
    expect(replayAction.json()).toEqual(first.json());
    expect(rows[0].actions).toHaveLength(1);
    const get = await server.inject({ method: 'GET', url: `/incidents/${otherId}`, headers: auth });
    expect(get.json().actions).toEqual([first.json()]);
  });
});
