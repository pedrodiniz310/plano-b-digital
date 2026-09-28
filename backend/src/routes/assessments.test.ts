import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import type { PrismaClient } from '../generated/prisma/client.js';

process.env.JWT_ACCESS_SECRET ??= 'segredo-de-teste-sem-valor-fora-daqui';

const updatedAt = new Date('2026-09-28T12:34:56.000Z');

function answersFor(option = 0): Record<string, number> {
  return Object.fromEntries(Array.from({ length: 10 }, (_, index) => [String(index), option]));
}

function prismaStub(initialAssessment: Record<string, unknown> | null = null): PrismaClient {
  let assessment = initialAssessment;
  return {
    assessment: {
      findUnique: async () => assessment,
      upsert: async (args: {
        create: { userId: string; answers: unknown; baseScore: number };
        update: { answers: unknown; baseScore: number };
      }) => {
        assessment = {
          id: 'assessment-1',
          userId: args.create.userId,
          answers: args.update.answers,
          baseScore: args.update.baseScore,
          updatedAt,
        };
        return assessment;
      },
    },
  } as unknown as PrismaClient;
}

let app: FastifyInstance | null = null;

async function startApp(prisma = prismaStub()): Promise<FastifyInstance> {
  app = await buildApp({ prisma, logger: false });
  await app.ready();
  return app;
}

async function authHeader(server: FastifyInstance): Promise<{ authorization: string }> {
  return { authorization: `Bearer ${await server.jwt.sign({ sub: 'user-1' })}` };
}

beforeEach(() => {
  process.env.JWT_ACCESS_SECRET ??= 'segredo-de-teste-sem-valor-fora-daqui';
});

afterEach(async () => {
  await app?.close();
  app = null;
});

describe('rotas de assessments', () => {
  it('returns 401 with the contract response when no token is supplied', async () => {
    const server = await startApp();
    const response = await server.inject({ method: 'GET', url: '/assessments/latest' });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: 'unauthorized', message: 'Sessão inválida ou expirada.' });
  });

  it('returns 401 with the contract response for a garbage token', async () => {
    const server = await startApp();
    const response = await server.inject({
      method: 'POST',
      url: '/assessments',
      headers: { authorization: 'Bearer lixo' },
      payload: { answers: answersFor() },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: 'unauthorized', message: 'Sessão inválida ou expirada.' });
  });

  it('returns 401 for an expired token', async () => {
    const server = await startApp();
    const expiredToken = await server.jwt.sign({ sub: 'user-1' }, { expiresIn: -1 });
    const response = await server.inject({
      method: 'GET',
      url: '/assessments/latest',
      headers: { authorization: `Bearer ${expiredToken}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: 'unauthorized', message: 'Sessão inválida ou expirada.' });
  });

  it('rejects answers when one of the 10 required values is missing', async () => {
    const server = await startApp();
    const answers = answersFor();
    delete answers['9'];
    const response = await server.inject({
      method: 'POST',
      url: '/assessments',
      headers: await authHeader(server),
      payload: { answers },
    });

    expect(response.statusCode).toBe(400);
  });

  it('rejects an answer value outside the option indexes', async () => {
    const server = await startApp();
    const response = await server.inject({
      method: 'POST',
      url: '/assessments',
      headers: await authHeader(server),
      payload: { answers: { ...answersFor(), '4': 4 } },
    });

    expect(response.statusCode).toBe(400);
  });

  it('rejects extra question indexes and non-integer option indexes', async () => {
    const server = await startApp();
    const headers = await authHeader(server);
    const extraQuestion = await server.inject({
      method: 'POST',
      url: '/assessments',
      headers,
      payload: { answers: { ...answersFor(), '10': 0 } },
    });
    const nonInteger = await server.inject({
      method: 'POST',
      url: '/assessments',
      headers,
      payload: { answers: { ...answersFor(), '4': 1.5 } },
    });

    expect(extraQuestion.statusCode).toBe(400);
    expect(nonInteger.statusCode).toBe(400);
  });

  it('computes the score on the server and does not echo a client baseScore', async () => {
    const server = await startApp();
    const response = await server.inject({
      method: 'POST',
      url: '/assessments',
      headers: await authHeader(server),
      payload: { answers: answersFor(1), baseScore: 100 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      answers: answersFor(1),
      baseScore: 60,
      updatedAt: updatedAt.toISOString(),
    });
  });

  it('returns 404 when the user has not completed an assessment', async () => {
    const server = await startApp();
    const response = await server.inject({
      method: 'GET',
      url: '/assessments/latest',
      headers: await authHeader(server),
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ code: 'assessment_not_found', message: 'Nenhum teste concluído.' });
  });

  it('returns the latest assessment shape for the authenticated user', async () => {
    const seeded = {
      id: 'assessment-1',
      userId: 'user-1',
      answers: answersFor(2),
      baseScore: 0,
      updatedAt,
    };
    const server = await startApp(prismaStub(seeded));
    const response = await server.inject({
      method: 'GET',
      url: '/assessments/latest',
      headers: await authHeader(server),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      answers: answersFor(2),
      baseScore: 0,
      updatedAt: updatedAt.toISOString(),
    });
  });
});
