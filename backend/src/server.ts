try {
  process.loadEnvFile();
} catch {
  // Sem .env local — ok em produção, onde os secrets vêm do ambiente (Fly.io).
}

import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { HttpError, statusCodeOf } from './lib/httpErrors.js';
import { registerJwt } from './plugins/jwt.js';
import { registerPrisma } from './plugins/prisma.js';
import { authRoutes } from './routes/auth.js';

async function main() {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

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

  await registerPrisma(app);
  await registerJwt(app);

  app.get('/health', async () => ({ ok: true }));
  await app.register(authRoutes);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
