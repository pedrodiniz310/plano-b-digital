import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { User } from '../generated/prisma/client.js';
import { hashPassword, verifyPassword } from '../lib/hash.js';
import { Conflict, Unauthorized } from '../lib/httpErrors.js';
import { generateRefreshToken, guestEmail, hashRefreshToken } from '../lib/tokens.js';
import {
  authSessionSchema,
  loginBodySchema,
  recoverBodySchema,
  recoverResponseSchema,
  refreshBodySchema,
  signupBodySchema,
  type AuthSessionResponse,
} from '../schemas/auth.js';

function toPublicUser(user: User): AuthSessionResponse['user'] {
  return { id: user.id, name: user.name, email: user.email, guest: user.isGuest };
}

export const authRoutes: FastifyPluginAsync = async (rawApp) => {
  const app = rawApp.withTypeProvider<ZodTypeProvider>();

  async function issueSession(app_: typeof app, userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await app_.jwt.sign({ sub: userId });
    const refresh = generateRefreshToken();
    await app_.prisma.refreshToken.create({
      data: { userId, tokenHash: refresh.hash, expiresAt: refresh.expiresAt },
    });
    return { accessToken, refreshToken: refresh.raw };
  }

  app.post(
    '/auth/signup',
    { schema: { body: signupBodySchema, response: { 200: authSessionSchema } } },
    async (req) => {
      const { name, email, password } = req.body;
      const existing = await app.prisma.user.findUnique({ where: { email } });
      if (existing) throw Conflict('email_taken', 'Este e-mail já está cadastrado.');

      const user = await app.prisma.user.create({
        data: { name, email, passwordHash: await hashPassword(password) },
      });
      const tokens = await issueSession(app, user.id);
      return { user: toPublicUser(user), ...tokens };
    }
  );

  app.post(
    '/auth/login',
    { schema: { body: loginBodySchema, response: { 200: authSessionSchema } } },
    async (req) => {
      const { email, password } = req.body;
      const user = await app.prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash || !(await verifyPassword(user.passwordHash, password))) {
        throw Unauthorized('invalid_credentials', 'E-mail ou senha incorretos.');
      }
      const tokens = await issueSession(app, user.id);
      return { user: toPublicUser(user), ...tokens };
    }
  );

  app.post('/auth/guest', { schema: { response: { 200: authSessionSchema } } }, async () => {
    const user = await app.prisma.user.create({
      data: { name: 'Visitante', email: guestEmail(), isGuest: true },
    });
    const tokens = await issueSession(app, user.id);
    return { user: toPublicUser(user), ...tokens };
  });

  app.post(
    '/auth/refresh',
    { schema: { body: refreshBodySchema, response: { 200: authSessionSchema } } },
    async (req) => {
      const tokenHash = hashRefreshToken(req.body.refreshToken);
      const stored = await app.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });
      if (!stored || stored.expiresAt < new Date()) {
        throw Unauthorized('invalid_refresh_token', 'Sessão expirada. Entre novamente.');
      }

      // Rotação: o token usado morre e um novo par é emitido.
      await app.prisma.refreshToken.delete({ where: { id: stored.id } });
      const tokens = await issueSession(app, stored.userId);
      return { user: toPublicUser(stored.user), ...tokens };
    }
  );

  app.post(
    '/auth/recover',
    { schema: { body: recoverBodySchema, response: { 200: recoverResponseSchema } } },
    async () => {
      // TODO(marco futuro): disparar e-mail de verdade. Por ora, resposta
      // sempre positiva — não revela se o e-mail existe na base.
      return { sent: true as const };
    }
  );
};
