import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { Conflict } from '../lib/httpErrors.js';
import { authenticate, userIdFromRequest } from '../plugins/auth.js';
import { vaultBodySchema, vaultItemSchema, vaultItemsSchema, vaultParamsSchema } from '../schemas/vault.js';

const shape = (row: { promptId: string; ciphertext: string; nonce: string; updatedAt: Date }) => ({
  promptId: row.promptId,
  ciphertext: row.ciphertext,
  nonce: row.nonce,
  updatedAt: row.updatedAt.toISOString(),
});

export const vaultRoutes: FastifyPluginAsync = async (rawApp) => {
  const app = rawApp.withTypeProvider<ZodTypeProvider>();

  app.get('/vault/items', {
    preHandler: authenticate,
    schema: { response: { 200: vaultItemsSchema } },
  }, async (req) => {
    const rows = await app.prisma.vaultItem.findMany({ where: { userId: userIdFromRequest(req) } });
    return { items: rows.map(shape) };
  });

  app.put('/vault/items/:promptId', {
    preHandler: authenticate,
    schema: { params: vaultParamsSchema, body: vaultBodySchema, response: { 200: vaultItemSchema } },
  }, async (req) => {
    const userId = userIdFromRequest(req);
    const { promptId } = req.params;
    const { ciphertext, nonce } = req.body;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const row = await app.prisma.$transaction(async (tx) => {
          const existing = await tx.vaultItem.findUnique({ where: { userId_promptId: { userId, promptId } } });
          if (!existing && await tx.vaultItem.count({ where: { userId } }) >= 40) {
            throw Conflict('vault_full', 'O cofre já tem 40 informações.');
          }
          return tx.vaultItem.upsert({
            where: { userId_promptId: { userId, promptId } },
            create: { userId, promptId, ciphertext, nonce },
            update: { ciphertext, nonce },
          });
        }, { isolationLevel: 'Serializable' });
        return shape(row);
      } catch (error) {
        // Serializable transactions can conflict when two new slots race for the cap.
        if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'P2034') throw error;
      }
    }
    throw Conflict('vault_conflict', 'O cofre mudou durante a gravação. Tente novamente.');
  });

  app.delete('/vault/items/:promptId', {
    preHandler: authenticate,
    schema: { params: vaultParamsSchema },
  }, async (req, reply) => {
    const userId = userIdFromRequest(req);
    await app.prisma.vaultItem.deleteMany({ where: { userId, promptId: req.params.promptId } });
    return reply.code(204).send();
  });
};
