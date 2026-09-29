import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../app.js';
import type { PrismaClient } from '../generated/prisma/client.js';

process.env.JWT_ACCESS_SECRET ??= 'segredo-de-teste-sem-valor-fora-daqui';

type VaultRow = { userId: string; promptId: string; ciphertext: string; nonce: string; updatedAt: Date };
type ContactRow = { userId: string; name: string; relation: string; phone: string; email: string | null; note: string | null };

function prismaStub() {
  const items: VaultRow[] = [];
  const contacts: ContactRow[] = [];
  const vaultItem = {
    findMany: vi.fn(async ({ where }: { where: { userId: string } }) => items.filter((row) => row.userId === where.userId)),
    findUnique: vi.fn(async ({ where }: { where: { userId_promptId: { userId: string; promptId: string } } }) =>
      items.find((row) => row.userId === where.userId_promptId.userId && row.promptId === where.userId_promptId.promptId) ?? null),
    count: vi.fn(async ({ where }: { where: { userId: string } }) => items.filter((row) => row.userId === where.userId).length),
    upsert: vi.fn(async (args: {
      where: { userId_promptId: { userId: string; promptId: string } };
      create: Omit<VaultRow, 'updatedAt'>;
      update: Pick<VaultRow, 'ciphertext' | 'nonce'>;
    }) => {
      let row = items.find((item) => item.userId === args.where.userId_promptId.userId && item.promptId === args.where.userId_promptId.promptId);
      if (row) Object.assign(row, args.update);
      else { row = { ...args.create, updatedAt: new Date() }; items.push(row); }
      return row;
    }),
    deleteMany: vi.fn(async ({ where }: { where: { userId: string; promptId: string } }) => {
      const index = items.findIndex((row) => row.userId === where.userId && row.promptId === where.promptId);
      if (index >= 0) items.splice(index, 1);
    }),
  };
  const trustedContact = {
    findUnique: vi.fn(async ({ where }: { where: { userId: string } }) => contacts.find((row) => row.userId === where.userId) ?? null),
    upsert: vi.fn(async (args: { where: { userId: string }; create: ContactRow; update: Omit<ContactRow, 'userId'> }) => {
      let row = contacts.find((item) => item.userId === args.where.userId);
      if (row) Object.assign(row, args.update);
      else { row = args.create; contacts.push(row); }
      return row;
    }),
    deleteMany: vi.fn(async ({ where }: { where: { userId: string } }) => {
      const index = contacts.findIndex((row) => row.userId === where.userId);
      if (index >= 0) contacts.splice(index, 1);
    }),
  };
  const prisma = { vaultItem, trustedContact, $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({ vaultItem })) } as unknown as PrismaClient;
  return { prisma, items, contacts, vaultItem, trustedContact };
}

let app: FastifyInstance | null = null;
async function start(prisma: PrismaClient) {
  app = await buildApp({ prisma, logger: false });
  await app.ready();
  return app;
}
async function auth(server: FastifyInstance, userId = 'user-1') {
  return { authorization: `Bearer ${await server.jwt.sign({ sub: userId })}` };
}
afterEach(async () => { await app?.close(); app = null; });

const blob = { ciphertext: Buffer.from('cipher-and-tag').toString('base64'), nonce: Buffer.alloc(12).toString('base64') };
const contact = { name: 'Marina Alves', relation: 'irmã', phone: '(11) 91234-0000', email: 'marina@example.test', note: 'Confirmar por ligação.' };

describe('vault routes', () => {
  it('requires authentication on every route', async () => {
    const server = await start(prismaStub().prisma);
    for (const [method, url, payload] of [
      ['GET', '/vault/items'], ['PUT', '/vault/items/v1', blob], ['DELETE', '/vault/items/v1'],
      ['GET', '/trusted-contact'], ['PUT', '/trusted-contact', contact], ['DELETE', '/trusted-contact'],
    ] as const) {
      expect((await server.inject({ method, url, payload })).statusCode).toBe(401);
    }
  });

  it('rejects invalid slot, nonce length, and oversized ciphertext', async () => {
    const server = await start(prismaStub().prisma);
    const headers = await auth(server);
    for (const [url, payload] of [
      ['/vault/items/v7', blob],
      ['/vault/items/v1', { ...blob, nonce: Buffer.alloc(11).toString('base64') }],
      ['/vault/items/v1', { ...blob, ciphertext: 'A'.repeat(8196) }],
    ] as const) expect((await server.inject({ method: 'PUT', url, headers, payload })).statusCode).toBe(400);
  });

  it('enforces 40 items on create but permits update and scopes every query', async () => {
    const stub = prismaStub();
    const server = await start(stub.prisma);
    const headers = await auth(server);
    for (let index = 0; index < 40; index++) stub.items.push({ userId: 'user-1', promptId: `c-${String(index).padStart(8, '0')}`, ...blob, updatedAt: new Date() });
    stub.items.push({ userId: 'other', promptId: 'v1', ...blob, updatedAt: new Date() });
    expect((await server.inject({ method: 'PUT', url: '/vault/items/v1', headers, payload: blob })).json().code).toBe('vault_full');
    expect((await server.inject({ method: 'PUT', url: '/vault/items/c-00000000', headers, payload: blob })).statusCode).toBe(200);
    const read = await server.inject({ method: 'GET', url: '/vault/items', headers });
    expect(read.json().items).toHaveLength(40);
    expect(stub.vaultItem.findMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(stub.vaultItem.findUnique).toHaveBeenCalledWith({ where: { userId_promptId: { userId: 'user-1', promptId: 'c-00000000' } } });
    expect(stub.vaultItem.count).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(stub.vaultItem.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_promptId: { userId: 'user-1', promptId: 'c-00000000' } } }));
    expect((await server.inject({ method: 'DELETE', url: '/vault/items/v1', headers })).statusCode).toBe(204);
    expect(stub.vaultItem.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1', promptId: 'v1' } });
    expect(stub.items.find((item) => item.userId === 'other')).toBeDefined();
  });
});

describe('trusted contact routes', () => {
  it('validates input and returns only masked phone and email', async () => {
    const stub = prismaStub();
    const server = await start(stub.prisma);
    const headers = await auth(server);
    for (const payload of [
      { ...contact, name: ' A ' }, { ...contact, relation: '' }, { ...contact, phone: '123' },
      { ...contact, email: 'invalid' }, { ...contact, note: 'a'.repeat(501) },
    ]) expect((await server.inject({ method: 'PUT', url: '/trusted-contact', headers, payload })).statusCode).toBe(400);
    expect((await server.inject({ method: 'GET', url: '/trusted-contact', headers })).json().code).toBe('contact_not_found');
    const saved = await server.inject({ method: 'PUT', url: '/trusted-contact', headers, payload: contact });
    expect(saved.statusCode).toBe(200);
    expect(saved.json()).toEqual({ name: contact.name, relation: contact.relation, phoneMasked: '(11) •••••-0000', emailMasked: 'm•••@example.test', note: contact.note });
    expect(saved.body).not.toContain('11912340000');
    expect(saved.body).not.toContain(contact.email);
    expect(stub.trustedContact.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-1' }, create: expect.objectContaining({ userId: 'user-1', phone: '11912340000' }) }));
    const read = await server.inject({ method: 'GET', url: '/trusted-contact', headers });
    expect(read.body).toBe(saved.body);
    expect(read.body).not.toContain('11912340000');
    expect(read.body).not.toContain(contact.email);
    expect(stub.trustedContact.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect((await server.inject({ method: 'DELETE', url: '/trusted-contact', headers })).statusCode).toBe(204);
    expect(stub.trustedContact.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});
