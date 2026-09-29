import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { User } from '../generated/prisma/client.js';
import { maskEmail } from '../lib/mask.js';
import { authenticate, userIdFromRequest } from '../plugins/auth.js';
import { meResponseSchema, updateMeBodySchema } from '../schemas/me.js';

function publicProfile(user: User) {
  return {
    name: user.name,
    emailMasked: maskEmail(user.email),
    guest: user.isGuest,
    theme: user.theme as 'light' | 'dark',
    contrast: user.contrast,
    fontSize: user.fontSize as 's' | 'm' | 'g',
  };
}

export const meRoutes: FastifyPluginAsync = async (rawApp) => {
  const app = rawApp.withTypeProvider<ZodTypeProvider>();

  app.get('/me', {
    preHandler: authenticate,
    schema: { response: { 200: meResponseSchema } },
  }, async (req) => {
    const user = await app.prisma.user.findUniqueOrThrow({ where: { id: userIdFromRequest(req) } });
    return publicProfile(user);
  });

  app.patch('/me', {
    preHandler: authenticate,
    schema: { body: updateMeBodySchema, response: { 200: meResponseSchema } },
  }, async (req) => {
    const user = await app.prisma.user.update({ where: { id: userIdFromRequest(req) }, data: req.body });
    return publicProfile(user);
  });
};
