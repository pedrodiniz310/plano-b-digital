import { z } from 'zod';

// Os ids do catálogo têm fonte única em app/src/content/simulations.ts.
export const simulationIdParamsSchema = z.object({
  simulationId: z.enum(['roubo', 'zap', 'email', 'auth', 'pix', 'familia', 'social', 'docs']),
});
export const simulationResultBodySchema = z.object({
  hits: z.number().int().min(0).max(20),
  timeSeconds: z.number().int().min(0).max(7200),
});
export const simulationResultResponseSchema = z.object({
  simulationId: z.string(),
  hits: z.number().int(),
  timeSeconds: z.number().int(),
  completedAt: z.iso.datetime(),
});
export const simulationResultsResponseSchema = z.object({
  results: z.array(simulationResultResponseSchema),
});
