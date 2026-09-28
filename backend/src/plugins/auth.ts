import type { FastifyRequest } from 'fastify';
import { Unauthorized } from '../lib/httpErrors.js';
import type { AccessTokenPayload } from './jwt.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AccessTokenPayload;
    user: AccessTokenPayload;
  }
}

export async function authenticate(req: FastifyRequest): Promise<void> {
  try {
    await req.jwtVerify();
  } catch {
    throw Unauthorized('unauthorized', 'Sessão inválida ou expirada.');
  }
}

export function userIdFromRequest(req: FastifyRequest): string {
  return req.user.sub;
}
