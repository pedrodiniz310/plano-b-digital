import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate, userIdFromRequest } from '../plugins/auth.js';
import {
  planResponseSchema,
  taskCompletionBodySchema,
  taskIdParamsSchema,
  taskStateResponseSchema,
} from '../schemas/plan.js';

export const planRoutes: FastifyPluginAsync = async (rawApp) => {
  const app = rawApp.withTypeProvider<ZodTypeProvider>();

  app.get('/plan', {
    preHandler: authenticate,
    schema: { response: { 200: planResponseSchema } },
  }, async (req) => {
    const rows = await app.prisma.taskState.findMany({ where: { userId: userIdFromRequest(req) } });
    return { tasks: rows.map((row) => ({
      taskId: row.taskId,
      completed: row.completed,
      completedAt: row.completedAt?.toISOString() ?? null,
    })) };
  });

  app.patch('/plan/tasks/:taskId', {
    preHandler: authenticate,
    schema: {
      params: taskIdParamsSchema,
      body: taskCompletionBodySchema,
      response: { 200: taskStateResponseSchema },
    },
  }, async (req) => {
    const userId = userIdFromRequest(req);
    const { taskId } = req.params;
    const { completed } = req.body;
    const completedAt = completed ? new Date() : null;
    const row = await app.prisma.taskState.upsert({
      where: { userId_taskId: { userId, taskId } },
      create: { userId, taskId, completed, completedAt },
      update: { completed, completedAt },
    });
    return {
      taskId: row.taskId,
      completed: row.completed,
      completedAt: row.completedAt?.toISOString() ?? null,
    };
  });
};
