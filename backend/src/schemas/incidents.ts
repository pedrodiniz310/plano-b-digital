import { z } from 'zod';

// Fonte editorial: app/src/content/emergency.ts (EMERGENCY_SCENARIOS e EMERGENCY_PLANS).
export const scenarioIdSchema = z.enum(['celular', 'zap', 'email', 'pix', 'conta', 'social', 'familiar', 'docs', 'outro']);
export const incidentIdParamsSchema = z.object({ id: z.uuidv4() });
export const createIncidentBodySchema = z.object({ id: z.uuidv4(), scenarioId: scenarioIdSchema });
export const actionBodySchema = z.object({ actionId: z.string(), clientTimestamp: z.iso.datetime({ offset: true }) });
export const incidentActionResponseSchema = z.object({
  actionId: z.string(), completedAt: z.iso.datetime(), clientTimestamp: z.iso.datetime().nullable(),
});
export const incidentResponseSchema = z.object({
  id: z.string(), scenarioId: z.string(), startedAt: z.iso.datetime(),
  closedAt: z.iso.datetime().nullable(), actions: z.array(incidentActionResponseSchema),
});
