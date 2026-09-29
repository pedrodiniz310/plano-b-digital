import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { baseScoreOf } from '../lib/assessmentScore.js';
import { NotFound } from '../lib/httpErrors.js';
import { authenticate, userIdFromRequest } from '../plugins/auth.js';
import {
  assessmentBodySchema,
  assessmentResponseSchema,
} from '../schemas/assessments.js';

export const assessmentRoutes: FastifyPluginAsync = async (rawApp) => {
  const app = rawApp.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/assessments',
    {
      preHandler: authenticate,
      schema: { body: assessmentBodySchema, response: { 200: assessmentResponseSchema } },
    },
    async (req) => {
      const userId = userIdFromRequest(req);
      const { answers } = req.body;
      const baseScore = baseScoreOf(answers);
      const assessment = await app.prisma.assessment.upsert({
        where: { userId },
        create: { userId, answers, baseScore },
        update: { answers, baseScore },
      });

      return assessmentResponseSchema.parse({
        answers: assessment.answers,
        baseScore: assessment.baseScore,
        updatedAt: assessment.updatedAt.toISOString(),
      });
    }
  );

  app.get(
    '/assessments/latest',
    {
      preHandler: authenticate,
      schema: { response: { 200: assessmentResponseSchema } },
    },
    async (req) => {
      const assessment = await app.prisma.assessment.findUnique({
        where: { userId: userIdFromRequest(req) },
      });
      if (!assessment) throw NotFound('assessment_not_found', 'Nenhum teste concluído.');

      return assessmentResponseSchema.parse({
        answers: assessment.answers,
        baseScore: assessment.baseScore,
        updatedAt: assessment.updatedAt.toISOString(),
      });
    }
  );
};
