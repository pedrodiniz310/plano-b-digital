import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate, userIdFromRequest } from '../plugins/auth.js';
import {
  simulationIdParamsSchema,
  simulationResultBodySchema,
  simulationResultResponseSchema,
  simulationResultsResponseSchema,
} from '../schemas/simulations.js';

export const simulationRoutes: FastifyPluginAsync = async (rawApp) => {
  const app = rawApp.withTypeProvider<ZodTypeProvider>();

  app.get('/simulations/results', {
    preHandler: authenticate,
    schema: { response: { 200: simulationResultsResponseSchema } },
  }, async (req) => {
    const rows = await app.prisma.simulationResult.findMany({ where: { userId: userIdFromRequest(req) } });
    return { results: rows.map((row) => ({
      simulationId: row.simulationId,
      hits: row.hits,
      timeSeconds: row.timeSeconds,
      completedAt: row.completedAt.toISOString(),
    })) };
  });

  app.post('/simulations/:simulationId/results', {
    preHandler: authenticate,
    schema: {
      params: simulationIdParamsSchema,
      body: simulationResultBodySchema,
      response: { 200: simulationResultResponseSchema },
    },
  }, async (req) => {
    const userId = userIdFromRequest(req);
    const { simulationId } = req.params;
    const { hits, timeSeconds } = req.body;
    const completedAt = new Date();
    const row = await app.prisma.simulationResult.upsert({
      where: { userId_simulationId: { userId, simulationId } },
      create: { userId, simulationId, hits, timeSeconds, completedAt },
      update: { hits, timeSeconds, completedAt },
    });
    return {
      simulationId: row.simulationId,
      hits: row.hits,
      timeSeconds: row.timeSeconds,
      completedAt: row.completedAt.toISOString(),
    };
  });
};
