import Fastify, { type FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import type { PrismaClient } from './generated/prisma/client.js';
import { HttpError, statusCodeOf } from './lib/httpErrors.js';
import { registerJwt } from './plugins/jwt.js';
import { registerPrisma } from './plugins/prisma.js';
import { registerRateLimit } from './plugins/rateLimit.js';
import { authRoutes } from './routes/auth.js';
import { assessmentRoutes } from './routes/assessments.js';
import { planRoutes } from './routes/plan.js';

export interface BuildAppOptions {
  /**
   * Injetado só nos testes de rota, que exercitam o HTTP sem subir Postgres.
   * Em produção fica ausente e o plugin abre a conexão real.
   */
  prisma?: PrismaClient;
  logger?: boolean;
}

/**
 * Monta a aplicação sem escutar porta — é o que `server.ts` sobe e o que os
 * testes injetam requisição via `app.inject()`.
 */
export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? true,
    // Atrás de proxy todo request chega com o IP do proxy, e o rate limit por
    // IP viraria um balde único pro tráfego inteiro. Fica opt-in por ambiente
    // porque confiar em X-Forwarded-For sem proxy na frente é exatamente como
    // se forja o IP de origem.
    //
    // O valor é `1` — quantidade de saltos confiáveis — e **não** `true`. Com
    // `true` o Fastify adota a entrada mais à ESQUERDA do X-Forwarded-For, que é
    // escrita pelo cliente: bastaria girar o cabeçalho a cada request para ter
    // um balde novo por tentativa e contornar o limite inteiro de uma máquina
    // só. Com `1`, ele pula o salto confiável e adota o endereço que o proxy de
    // fato observou, ignorando o que o cliente escreveu antes. Se um dia houver
    // outro proxy na frente (CDN sobre a Fly), este número precisa subir junto —
    // errar para menos agrupa tráfego demais no mesmo balde, o que é perda de
    // disponibilidade; errar para mais reabre a forja.
    trustProxy: process.env.TRUST_PROXY === 'true' ? 1 : false,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof HttpError) {
      reply.code(err.status).send({ code: err.code, message: err.message });
      return;
    }
    app.log.error(err);
    reply.code(statusCodeOf(err)).send({
      code: 'internal_error',
      message: 'Algo deu errado. Tente novamente.',
    });
  });

  // Antes das rotas: o limite por rota em `routes/auth.ts` só vale se o plugin
  // já estiver registrado no escopo pai.
  await registerRateLimit(app);

  if (options.prisma) {
    app.decorate('prisma', options.prisma);
  } else {
    await registerPrisma(app);
  }
  await registerJwt(app);

  app.get('/health', async () => ({ ok: true }));
  await app.register(authRoutes);
  await app.register(assessmentRoutes);
  await app.register(planRoutes);

  return app;
}
