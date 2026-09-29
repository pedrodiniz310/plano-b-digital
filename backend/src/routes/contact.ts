import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { NotFound } from '../lib/httpErrors.js';
import { maskEmail, maskPhone } from '../lib/mask.js';
import { authenticate, userIdFromRequest } from '../plugins/auth.js';
import { contactBodySchema, contactResponseSchema } from '../schemas/contact.js';

const shape = (row: { name: string; relation: string; phone: string; email: string | null; note: string | null }) => ({
  name: row.name,
  relation: row.relation,
  phoneMasked: maskPhone(row.phone),
  emailMasked: row.email ? maskEmail(row.email) : null,
  note: row.note,
});

export const contactRoutes: FastifyPluginAsync = async (rawApp) => {
  const app = rawApp.withTypeProvider<ZodTypeProvider>();

  app.get('/trusted-contact', {
    preHandler: authenticate,
    schema: { response: { 200: contactResponseSchema } },
  }, async (req) => {
    const row = await app.prisma.trustedContact.findUnique({ where: { userId: userIdFromRequest(req) } });
    if (!row) throw NotFound('contact_not_found', 'Contato de confiança não encontrado.');
    return shape(row);
  });

  app.put('/trusted-contact', {
    preHandler: authenticate,
    schema: { body: contactBodySchema, response: { 200: contactResponseSchema } },
  }, async (req) => {
    const userId = userIdFromRequest(req);
    const { name, relation, phone, email, note } = req.body;
    const row = await app.prisma.trustedContact.upsert({
      where: { userId },
      create: { userId, name, relation, phone, email: email ?? null, note: note ?? null },
      update: { name, relation, phone, email: email ?? null, note: note ?? null },
    });
    return shape(row);
  });

  app.delete('/trusted-contact', { preHandler: authenticate }, async (req, reply) => {
    await app.prisma.trustedContact.deleteMany({ where: { userId: userIdFromRequest(req) } });
    return reply.code(204).send();
  });
};
