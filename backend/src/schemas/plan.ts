import { z } from 'zod';

// O catálogo de tarefas tem fonte única em app/src/content/plan.ts.
export const taskIdParamsSchema = z.object({ taskId: z.string().regex(/^t([1-9]|1[0-5])$/) });
export const taskCompletionBodySchema = z.object({ completed: z.boolean() });
export const taskStateResponseSchema = z.object({
  taskId: z.string(),
  completed: z.boolean(),
  completedAt: z.iso.datetime().nullable(),
});
export const planResponseSchema = z.object({ tasks: z.array(taskStateResponseSchema) });
