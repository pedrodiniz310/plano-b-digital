import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';

const ACCESS_TOKEN_TTL = '15m';

export interface AccessTokenPayload {
  sub: string;
}

export async function registerJwt(app: FastifyInstance): Promise<void> {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET não configurado.');

  await app.register(fastifyJwt, {
    secret,
    sign: { expiresIn: ACCESS_TOKEN_TTL },
  });
}
