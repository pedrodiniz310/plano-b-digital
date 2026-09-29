import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import { hashRefreshToken } from '../lib/tokens.js';

process.env.JWT_ACCESS_SECRET ??= 'segredo-de-teste-sem-valor-fora-daqui';

const email = 'pessoa@example.test';
const user = { id: 'user-1', name: 'Pessoa', email, isGuest: false, theme: 'light', contrast: false, fontSize: 's' };

function prismaStub() {
  const current = { ...user };
  const deleted: { where: { tokenHash: string; userId: string } }[] = [];
  const prisma = {
    user: {
      findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
        expect(where.id).toBe('user-1');
        return current;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<typeof user> }) => {
        expect(where.id).toBe('user-1');
        Object.assign(current, data);
        return current;
      },
    },
    refreshToken: { deleteMany: async (args: { where: { tokenHash: string; userId: string } }) => {
      deleted.push(args);
      return { count: args.where.userId === 'user-1' && args.where.tokenHash === hashRefreshToken('owned') ? 1 : 0 };
    } },
  } as unknown as PrismaClient;
  return { prisma, current, deleted };
}

let app: FastifyInstance | null = null;
async function startApp(prisma: PrismaClient) {
  app = await buildApp({ prisma, logger: false });
  await app.ready();
  return app;
}
async function headers(server: FastifyInstance) {
  return { authorization: `Bearer ${await server.jwt.sign({ sub: 'user-1' })}` };
}
afterEach(async () => { await app?.close(); app = null; });

describe('perfil e logout', () => {
  it('requires access-token auth on GET/PATCH /me and logout', async () => {
    const server = await startApp(prismaStub().prisma);
    expect((await server.inject({ method: 'GET', url: '/me' })).statusCode).toBe(401);
    expect((await server.inject({ method: 'PATCH', url: '/me', payload: { theme: 'dark' } })).statusCode).toBe(401);
    expect((await server.inject({ method: 'POST', url: '/auth/logout', payload: { refreshToken: 'owned' } })).statusCode).toBe(401);
  });

  it('masks email in GET and PATCH responses and scopes updates to the user', async () => {
    const { prisma, current } = prismaStub();
    const server = await startApp(prisma);
    const auth = await headers(server);
    const get = await server.inject({ method: 'GET', url: '/me', headers: auth });
    expect(get.statusCode).toBe(200);
    expect(get.json()).toEqual({ name: 'Pessoa', emailMasked: 'p•••@example.test', guest: false, theme: 'light', contrast: false, fontSize: 's' });
    expect(get.body).not.toContain(email);

    const patch = await server.inject({ method: 'PATCH', url: '/me', headers: auth, payload: { name: '  Outro Nome  ', theme: 'dark', contrast: true, fontSize: 'g' } });
    expect(patch.statusCode).toBe(200);
    expect(patch.json()).toMatchObject({ name: 'Outro Nome', theme: 'dark', contrast: true, fontSize: 'g' });
    expect(patch.body).not.toContain(email);
    expect(current.name).toBe('Outro Nome');
  });

  it('rejects empty and invalid PATCH bodies', async () => {
    const server = await startApp(prismaStub().prisma);
    const auth = await headers(server);
    for (const payload of [{}, { name: ' ' }, { name: 'x' }, { name: 'x'.repeat(81) }, { theme: 'system' }, { contrast: 'yes' }, { fontSize: 'l' }, { email: 'raw@example.test' }]) {
      expect((await server.inject({ method: 'PATCH', url: '/me', headers: auth, payload })).statusCode).toBe(400);
    }
  });

  it('deletes only by token hash and authenticated user, and always returns 204', async () => {
    const { prisma, deleted } = prismaStub();
    const server = await startApp(prisma);
    const auth = await headers(server);
    for (const refreshToken of ['owned', 'someone-elses-token']) {
      const response = await server.inject({ method: 'POST', url: '/auth/logout', headers: auth, payload: { refreshToken } });
      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
    }
    expect(deleted).toEqual([
      { where: { tokenHash: hashRefreshToken('owned'), userId: 'user-1' } },
      { where: { tokenHash: hashRefreshToken('someone-elses-token'), userId: 'user-1' } },
    ]);
  });
});
